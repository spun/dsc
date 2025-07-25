import { getLiveAccessToken, getBaseDvrUrl } from './utils/accessUtils';
// UI popup
import { Popup, PopupItem } from '../popup/popup';

interface CommonOptions {
  headers: Record<string, string>;
}
declare const commonOptions: CommonOptions;

interface SupportedFormat {
  name: string;
  urlSegment: string;
}

const supportedFormats: {
  modern: SupportedFormat[];
  legacy: SupportedFormat[];
} = {
  modern: [
    { name: "Source", urlSegment: "chunked", },
    { name: "1080p60", urlSegment: "1080p60", },
    { name: "1080p30", urlSegment: "1080p30", },
    { name: "720p60", urlSegment: "720p60", },
    { name: "720p30", urlSegment: "720p30", },
    { name: "480p30", urlSegment: "480p30", },
    { name: "360p30", urlSegment: "360p30", },
    { name: "160p30", urlSegment: "160p30", },
  ],
  // Old VODs use different urlSegments
  legacy: [
    { name: "1080p30", urlSegment: "1080p", },
    { name: "720p30", urlSegment: "720p", },
    { name: "480p30", urlSegment: "480p", },
    { name: "360p30", urlSegment: "360p", },
    { name: "240p30", urlSegment: "240p", },
    // Is 160p a valid legacy url segement?
    { name: "160p30", urlSegment: "160p", },
    { name: "144p30", urlSegment: "144p", },
  ]
}

/**
 * Get assigned client id
 */
function getClientId() {
  return commonOptions.headers['Client-ID'];
}

/**
 * Check it the current url is from a main/live channel page and extracts the channel name
 */
function isLiveChannelUrl() {
  // A live channel only has the name of the channel in its pathname
  const { pathname } = window.location;
  const regExp = /^\/(\w+)\/?$/;
  const match = pathname.match(regExp);
  if (match) {
    return match[1];
  }
  return false;
}

/**
 * Get the manifest (m3u8 file) of a live channel
 */
async function getManifestLiveUrl(channelName: string, clientId: string) {
  const accessToken = await getLiveAccessToken(clientId, channelName);
  // Form url
  const { signature } = accessToken;
  const encodedToken = encodeURIComponent(accessToken.token);
  return `https://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?sig=${signature}&token=${encodedToken}`;
}

/**
 * Check it the url is from a vod page with the type 1 format and extract the video id
 * Format: twitch.tv/videos/<videoId>
 */
function getVodIdType1(url: string) {
  const regExp = /^.*twitch\.tv\/videos\/([0-9]+)*/;
  const match = url.match(regExp);
  if (match) {
    return match[1];
  }
  return undefined;
}

/**
 * Check it the url is from a vod page with the type 2 format and extract the video id
 * Format: twitch.tv/<channelName>/video/<videoId>
 */
function getVodIdType2(url: string) {
  const regExp = /^.*twitch\.tv\/.*\/video\/([0-9]+)*/;
  const match = url.match(regExp);
  if (match) {
    return match[1];
  }
  return undefined;
}

/**
 * Check it the current url is from a vod page and extracts the video id
 */
function getVodId() {
  const locationUrl = window.location.href;
  return getVodIdType1(locationUrl) || getVodIdType2(locationUrl);
}

/**
 * Check URL against known formats return the available ones
 * @param baseUrl 
 * @returns A Promise with the list of available formats.
 */
async function getAllM3u8FromSupportedFormats(baseUrl: string): Promise<{ format: SupportedFormat, url: string }[]> {

  const checkFormats = async (formats: SupportedFormat[]) => {
    // Create Promises to check against received formats
    const promises = formats.map(async format => {
      const formatUrl = `${baseUrl}/${format.urlSegment}/index-dvr.m3u8`
      // NOTE: We use a full fetch instead of just HEAD to avoid CORS issues.
      const response = await fetch(formatUrl);
      return {
        format: format,
        url: formatUrl,
        isAvailable: response.ok
      }
    })

    // Check all URLs in parallel
    return await Promise.all(promises)
  }

  // Only check legacy format urls if we were not able to find a valid result from the modern format set
  let availableResults = (await checkFormats(supportedFormats.modern)).filter(result => result.isAvailable)
  if (availableResults.length == 0) {
    console.log("Checking legacy formats.")
    availableResults = (await checkFormats(supportedFormats.legacy)).filter(result => result.isAvailable)
  }

  // Remove isAvailable property and return
  return availableResults.map(result => ({ format: result.format, url: result.url }));
}

/**
 * Default dvr m3u8 files use relative paths for its .ts files. We need to transform it
 * to use full paths before it can be downloaded.
 * @param url The m3u8 file url.
 * @returns A Promise with the tranformend m3u8 content as a string.
 */
async function transformRelativeM3u8ToFullPath(url: string): Promise<string> {

  // Remove last piece from the url to get the base url that will be added to the .ts entries
  const baseUrl = url.replace(/\/[^/]*$/, '/');

  // Fetch the m3u8 content
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Unable to fetch manifest")
  }
  const m3u8Content = await response.text()

  // For each line, replace relative .ts entries with full path URLs
  const m3u8Pieces = m3u8Content
    .split('\n')
    .map(line => {
      // Match lines that look like a segment file, e.g., "23.ts"
      if (/^\d+\.ts$/.test(line.trim())) {
        return baseUrl.replace(/\/$/, '') + '/' + line.trim();
      }
      return line;
    })

  // Make sure our m3u8 file ends with #EXT-X-ENDLIST
  // If we are working with a VOD from an ongoing livestream, this line won't exist.
  // To ensure the generated m3u8 plays/downloads from the beginning, check if 
  // the line exists and add it if it doesn't.
  let lastNonEmptyIndex: number | undefined = undefined;
  for (let i = m3u8Pieces.length - 1; i >= 0; i--) {
    if (m3u8Pieces[i] !== "") {
      lastNonEmptyIndex = i;
      break;
    }
  }

  if (lastNonEmptyIndex && m3u8Pieces[lastNonEmptyIndex] !== "#EXT-X-ENDLIST") {
    m3u8Pieces.splice(lastNonEmptyIndex + 1, 0, "#EXT-X-ENDLIST")
  }

  return m3u8Pieces.join('\n')

}

/**
 * Download some string content as a m3u8 file
 * @param filename The name of the new file.
 * @param content The content of the new file.
 */
function downloadM3u8File(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/vnd.apple.mpegurl" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function main(): Promise<void> {
  // Check if the request is for a live channel
  const channelName = isLiveChannelUrl();
  if (channelName) {
    const clientId = getClientId();
    const liveManifestUrl = await getManifestLiveUrl(channelName, clientId);
    window.location.href = liveManifestUrl;
  } else {
    // Display our loading Popup instead of waiting for the results
    const popup = new Popup("#9147ff", "#ffffff")
    popup.setState({ type: 'Loading' })
    popup.show();

    // Check if the request was for a vod
    const vodId = getVodId();
    if (vodId) {
      const clientId = getClientId();
      const baseDvrUrl = await getBaseDvrUrl(clientId, vodId)
      const availableM3u8 = await getAllM3u8FromSupportedFormats(baseDvrUrl)
      if (availableM3u8.length > 0) {

        const downloadM3u8 = async (item: { format: SupportedFormat, url: string }) => {
          const m3u8Content = await transformRelativeM3u8ToFullPath(item.url)
          downloadM3u8File(`${vodId}_${item.format.urlSegment}.m3u8`, m3u8Content)
        }

        // Add all available m3u8 to the popup
        const items: PopupItem[] = availableM3u8.map(item => ({
          headlineText: item.format.name,
          supportingText: item.format.urlSegment,
          onClick: async () => { downloadM3u8(item) }
        }))
        popup.setState({ type: 'Success', list: items })
      } else {
        console.warn("Unable to find a valid format")
        popup.setState({ type: 'Error', message: 'Unable to find a valid format to display' })
      }
    } else {
      console.warn("Unable to find a valid format")
      popup.setState({ type: 'Error', message: 'Unable to fetch vod id' })
    }
  }
}

export default main;
