// Video format dictionary
import { getYtItagInfo } from './formats';
// Subtitle time formats util
import { millisecondsToSrtTime } from './utils/subtitleTimeUtils';
// UI popup
import { Popup, PopupItem } from '../popup/popup';
import { YtPlayer, RawPlayerResponse } from './model/YtPlayer';
import { YtCfg } from './model/YtCfg';
import TimedText from './model/TimedText';

declare const ytplayer: YtPlayer;
declare const ytcfg: YtCfg;

enum ElementType {
  VIDEO = 'element_type_video',
  SUBTITLE = 'element_type_subtitle',
}

interface YtPopupElementData extends PopupItem {
  url: string;
  type?: ElementType;
  extras?: Record<string, unknown>;
}

function getVideoIdFromUrl(urlString: string) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = urlString.match(regExp);
  if (match) {
    return match[2];
  }
  return '';
}

// Extract available formats from the player response
function getFormatsUsingYtPlayerPlayerResponse(playerResponseJSON: RawPlayerResponse) {
  const {
    formats: baseFormats, // Base formats (Video + Audio)
    adaptiveFormats, // Adaptative formats (separate video and audio)
  } = playerResponseJSON.streamingData;
  const allFormats = baseFormats.concat(adaptiveFormats).filter((item) => item);

  // Title that we are going to append to the url to force the download
  const videoTitle = escape(playerResponseJSON.videoDetails.title.replace(/"/g, ''))
    || 'download';

  const result: YtPopupElementData[] = [];
  allFormats.forEach((item) => {
    const itagInfo = getYtItagInfo(item.itag);
    // Add to results
    result.push({
      headlineText: itagInfo.text,
      supportingText: itagInfo.subtext || item.size || item.quality || '',
      onClick: () => { },
      url: `${item.url}&title=${videoTitle}`,
    });
  });
  return result;
}

// Method 2: Extract player_response using an api request
async function getPlayerResponseFromApi(videoId: string) {
  // Extract api values from window
  const {
    INNERTUBE_API_KEY,
    INNERTUBE_CONTEXT_CLIENT_VERSION,
    INNERTUBE_CONTEXT_HL,
    INNERTUBE_CONTEXT_CLIENT_NAME,
  } = ytcfg.data_;

  // Create body for the api request
  const data = {
    context: {
      client: {
        hl: INNERTUBE_CONTEXT_HL,
        clientName: INNERTUBE_CONTEXT_CLIENT_NAME,
        clientVersion: INNERTUBE_CONTEXT_CLIENT_VERSION,
        mainAppWebInfo: { graftUrl: `/watch?v=${videoId}` },
      },
    },
    videoId,
  };

  // Api url
  const url = `https://youtubei.googleapis.com/youtubei/v1/player?key=${INNERTUBE_API_KEY}`;

  // Api post fetch request
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * We have more than one way to extract the available formats, but
 * not all methods are always available, so we check each one until
 * we are able to get the information. We use a Promise because some
 * of those methods may require a new request.
 */
async function getFormats() {
  const locationUrl = window.location.href;
  const urlVideoId = getVideoIdFromUrl(locationUrl);

  // If we can't get the video id, we probably are in a page that doesn't contain any
  // video. So we skip all the methods and fail the promise.
  // TODO: Improve error messages
  if (urlVideoId !== '') {
    // While browsing the webpage as a SPA, the values from "ytplayer" get "stuck"
    // with old values (from the first page visited) and only a page refresh can fix this
    // situation. We don't know if there is a way to get the new "ytplayer" values
    // from another property, but until then, we check "ytplayer" and make sure that
    // it holds the values of the current webpage video. If the video ids are different
    // we'll get all the data using the method 2 that makes a new request and doesn't
    // depend on "ytplayer".
    let isYtPlayerDataAvailable = false;
    const jsVideoId = ytplayer?.config?.args?.video_id;
    if (jsVideoId) {
      if (urlVideoId === jsVideoId) {
        isYtPlayerDataAvailable = true;
      }
    }

    // Method 1: Using the property "player_response" from the "ytplayer"
    // variable that we can use when we are in a video webpage.
    if (isYtPlayerDataAvailable === true && ytplayer?.config?.args?.raw_player_response) {
      console.info('Using method 1, "getFormatsUsingYtPlayerPlayerResponse"');
      const playerResponse = ytplayer.config.args.raw_player_response;
      return getFormatsUsingYtPlayerPlayerResponse(playerResponse);
    }

    // Method 2: If the player_response method was not available, we can make a new api request.
    // This will get us the same information.
    console.info('Using method 2, "getPlayerResponseFromApi"');
    try {
      const playerResponse: RawPlayerResponse = await getPlayerResponseFromApi(urlVideoId);
      return getFormatsUsingYtPlayerPlayerResponse(playerResponse);
    } catch (e) {
      throw new Error(`getPlayerResponseFromApi failed: ${e}`);
    }
  }
  throw new Error();
}

/**
 * Get a list of all available subtitles for the current video url
 */
function getAvailableSubtitles(): YtPopupElementData[] {
  // TODO: We also make this check for video formats. Extract so we can reuse it.
  const locationUrl = window.location.href;
  const urlVideoId = getVideoIdFromUrl(locationUrl);
  // If we can't get the video id, we probably are in a page that doesn't contain any
  // video. So we skip all the methods and fail the promise.
  // TODO: Improve error messages
  if (urlVideoId !== '') {
    // While browsing the webpage as a SPA, the values from "ytplayer" get "stuck"
    // with old values (from the first page visited) and only a page refresh can fix this
    // situation. We don't know if there is a way to get the new "ytplayer" values
    // from another property, but until then, we check "ytplayer" and make sure that
    // it holds the values of the current webpage video.
    const jsVideoId = ytplayer?.config?.args?.video_id;
    if (!jsVideoId || jsVideoId !== urlVideoId) {
      // We don't have an alternative solution to list available subtitles.
      return [];
    }

    // Subtitle urls make use of a custom format. Beefore the download we need
    // to transform it to a common subtitle format like srt. Because of that, url
    // values are empty for subtitles and we need to set extra values required for
    // the transformation and download triggered when the user selects a subtitle.
    const captionsConfig = ytplayer.config.args.raw_player_response.captions;
    const tracks = captionsConfig.playerCaptionsTracklistRenderer.captionTracks;
    const result: YtPopupElementData[] = tracks.map((track) => ({
      headlineText: track.name.simpleText,
      supportingText: `Subtitle ${track.languageCode}`,
      onClick: () => { },
      url: '',
      extras: {
        baseUrl: track.baseUrl,
      },
    }));
    return result;
  }
  return [];
}

/**
 * Fetch the subtitle content, create the lines of a new srt file
 * with the expected format and trigger the download.
 */
async function downloadSubtitle(subtitleData: YtPopupElementData) {
  // Fetch subtitle content
  if (!subtitleData.extras) return;
  const { baseUrl } = subtitleData.extras;
  const response = await fetch(`${baseUrl}&fmt=json3`);
  const json: TimedText = await response.json();

  // Transform to srt format
  let result = '';
  let subtitleIndex = 1;
  json.events.forEach((line) => {
    if (line.tStartMs && line.dDurationMs && line.segs) {
      result += (`${subtitleIndex}\r\n`);
      result += `${millisecondsToSrtTime(line.tStartMs)} --> ${millisecondsToSrtTime(line.tStartMs + line.dDurationMs)}\r\n`;
      line.segs.forEach((segment) => { result += (`${segment.utf8}\r\n`); });
      result += ('\r\n');
      subtitleIndex += 1;
    }
  });

  // Trigger file download
  const filename = 'subtitle.srt';
  const blob = new Blob([result], { type: 'text/plain' });
  const elem = window.document.createElement('a');
  elem.href = window.URL.createObjectURL(blob);
  elem.download = filename;
  // Add to dom
  document.body.appendChild(elem);
  // trigger click event
  elem.click();
  // remove from dom
  document.body.removeChild(elem);
}

async function main(): Promise<void> {
  // Popup
  const popup = new Popup("#f03", "#fff");

  try {
    // VIDEO FORMATS
    const formatResults = await getFormats();
    console.log("formatResults", formatResults)
    const videoItems: PopupItem[] = formatResults.map(item => ({
      headlineText: item.headlineText,
      supportingText: item.supportingText,
      onClick: async () => { window.location.href = item.url; }
    }))

    // SUBTITLES
    const availableSubtitles = getAvailableSubtitles();
    // Add all available subtitle to the list
    const subtitleItems: PopupItem[] = availableSubtitles.map(item => ({
      headlineText: item.headlineText,
      supportingText: item.supportingText,
      onClick: async () => { downloadSubtitle(item) }
    }))
    
    // Show popup
    popup.setState({ type: 'Success', list: [...videoItems, ...subtitleItems] })
    popup.show();
  } catch (e) {
    console.error('An error occurred', e);
  }
}

export default main;
