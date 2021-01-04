// Video format dictionary
import { getFormatDescription } from './formats';
// Subtitle time formats util
import { milisecondsToSrtTime } from './utils/subtitleTimeUtils';
// UI popup
import { Popup, PopupElementData } from '../popup/popup';
import { YtPlayer, RawPlayerResponse } from './model/YtPlayer';
import TimedText from './model/TimedText';

declare const ytplayer: YtPlayer;

enum ElementType {
  VIDEO = 'element_type_video',
  SUBTITLE = 'element_type_subtitle',
}

interface YtPopupElementData extends PopupElementData {
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

// Method 1: Extract using the property "player_response" from the "ytplayer"
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
    // Add to results
    result.push({
      title: getFormatDescription(item.itag),
      subtitle: item.size || item.quality || '',
      url: `${item.url}&title=${videoTitle}`,
    });
  });
  return result;
}

// Method 2: Extract using "get_video_info" content
async function getFormatsUsingGetVideoInfo(videoId: string) {
  const response = await fetch(`/get_video_info?video_id=${videoId}&ps=default&eurl=&gl=US&hl=en&disable_polymer=true`);
  const body = await response.text();
  // Extract all pair values from the response
  const pairValues = decodeURIComponent(body).split('&');
  // Retreive the value with the key "player_response"
  const playerResponseRaw = pairValues.find((value) => value.split('=')[0] === 'player_response');
  if (playerResponseRaw) {
    // From that key-value pair, we only are interested in the value
    const playerResponseSplit = playerResponseRaw.split('=');
    playerResponseSplit.shift(); // Ignore key
    const playerResponseString = playerResponseSplit.join('=');
    // We may need to replace some simbols
    // const sanitazed = value.replace('\u0026', '&amp;');
    const playerResponseJSON = JSON.parse(playerResponseString);
    // At this point, we have all the info in a strcuture really similar
    // to the one used by "getFormatsUsingYtPlayerPlayerResponse", so we
    // call the function with our data.
    return getFormatsUsingYtPlayerPlayerResponse(playerResponseJSON);
  }
  return [];
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
      return getFormatsUsingYtPlayerPlayerResponse(ytplayer.config.args.raw_player_response);
    }

    // Method 2: If none all the above methods are available, we can make a new
    // request to the "get_video_info" content. This will get us way more information
    // about the current video, includirng the available formats that we are trying to get.
    console.info('Using method 2, "getFormatsUsingGetVideoInfo"');
    try {
      return await getFormatsUsingGetVideoInfo(urlVideoId);
    } catch (e) {
      throw new Error(`getFormatsUsingGetVideoInfo failed: ${e}`);
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
    const result = tracks.map((track) => ({
      title: track.name.simpleText,
      subtitle: `Subtitle ${track.languageCode}`,
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
      result += `${milisecondsToSrtTime(line.tStartMs)} --> ${milisecondsToSrtTime(line.tStartMs + line.dDurationMs)}\r\n`;
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
  const popup = new Popup(async (receivedData) => {
    const data = receivedData as YtPopupElementData;
    // Check what type of available downloads was selected
    switch (data.type) {
      case ElementType.VIDEO:
        // Navigate to download url
        window.location.href = data.url;
        break;
      case ElementType.SUBTITLE:
        // Create subtitle file and trigger download
        await downloadSubtitle(data);
        break;
      default:
      // default code block
    }
  });

  // VIDEO FORMATS
  try {
    const formatResults = await getFormats();
    formatResults.forEach((videoData) => {
      const item: YtPopupElementData = { ...videoData, type: ElementType.VIDEO };
      popup.addItemToList(item);
    });
    popup.show();
  } catch (e) {
    console.error('An error occurred', e);
  }

  // SUBTITLES
  const availableSubtitles = getAvailableSubtitles();
  // Add all available subtitle to the list
  availableSubtitles.forEach((subtitleData) => {
    const item: YtPopupElementData = { ...subtitleData, type: ElementType.SUBTITLE };
    popup.addItemToList(item);
  });

  // Show popup
  popup.show();
}

export default main;
