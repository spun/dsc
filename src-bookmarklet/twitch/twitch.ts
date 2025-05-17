import { getLiveAccessToken, getBaseDvrUrl } from './utils/accessUtils';

interface CommonOptions {
  headers: Record<string, string>;
}
declare const commonOptions: CommonOptions;

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
 * Check URL against known formats and select the one with the best quality
 * @param baseUrl 
 * @returns A Promise with the best m3u8 url or undefined if we where unable to find one.
 */
async function getBestM3u8FromSupportedFormats(baseUrl: string): Promise<string | undefined> {

  // NOTE: For "Source" quality it will normally use "chunked" instead of a format string. 
  //  Since we are not checking against "chunked", we will probably always get the second-best quality.
  // TODO: We could display a quality selector
  const formats = [
    "1080p60",  // HighHighFPS
    "1080p30",  // High
    "720p60",   // MediumHighFPS
    "720p30",   // Medium
    "360p30",   // Low
    "160p30"    // VeryLow
  ]

  // Check all known formats and stop when we find one that exists.
  for (const format of formats) {
    const formatUrl = `${baseUrl}/${format}/index-dvr.m3u8`
    // We use a full fetch instead of just HEAD because it creates CORS issues.
    const response = await fetch(formatUrl);
    if (response.ok) {
      return formatUrl
    }
  }

  return undefined
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
    // Check if the request was for a vod
    const vodId = getVodId();
    if (vodId) {
      const clientId = getClientId();
      const baseDvrUrl = await getBaseDvrUrl(clientId, vodId)
      const bestAvailableM3u8 = await getBestM3u8FromSupportedFormats(baseDvrUrl)
      if (bestAvailableM3u8) {
        const m3u8Content = await transformRelativeM3u8ToFullPath(bestAvailableM3u8)
        downloadM3u8File(`${vodId}.m3u8`, m3u8Content)
      } else {
        console.warn("Unable to find a valid format")
      }
    }
  }
}

export default main;
