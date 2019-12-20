/* global ytplayer */

// Video format dictionary
import { getFormatDescription } from './formats';
// UI popup
import Popup from '../popup/popup';
import 'whatwg-fetch';

/**
 * Each video format is an array of strings where each strings in the array
 * is a parameter of the format.
 * Example array: ["url=...", "itag=...", "type=...", "itag=..."]
 * This method transforms the array format to a more useful object.
 */
function objectifyVideoFormat(videoFormatArray) {
  const object = {};
  videoFormatArray.forEach(formatItem => {
    const valueArray = formatItem.split('=');
    object[decodeURIComponent(valueArray[0])] = decodeURIComponent(
      valueArray.slice(1).join('=')
    );
  });
  return object;
}

// Retrieve all available format from the raw string
function extractUefsmVideoFormats(rawData) {
  const videoFormats = [];
  rawData.forEach(item => {
    const splitData = item.split('&');
    videoFormats.push(objectifyVideoFormat(splitData));
  });
  return videoFormats;
}

// Extract using the property "url_encoded_fmt_stream_map" from the "ytplayer"
function getFormatsUsingYtPlayerUrlEncodedFmtStreamMap(uefsmProperty) {
  const muxedFormatsSplit = uefsmProperty.split(',');
  const muxedFormats = extractUefsmVideoFormats(muxedFormatsSplit);
  // Extract adaptive formats (Video or Audio)
  const adaptiveFormatsSplit = ytplayer.config.args.adaptive_fmts.split(',');
  const adaptiveFormats = extractUefsmVideoFormats(adaptiveFormatsSplit);
  // Merge and add all formats to the result list
  const allFormats = muxedFormats.concat(adaptiveFormats);

  // Title that we are going to append to the url to force the download
  const videoTitle =
    escape(ytplayer.config.args.title.replace(/"/g, '')) || 'download';

  const result = [];
  allFormats.forEach(item => {
    // Add to results
    result.push({
      title: getFormatDescription(item.itag),
      subtitle: item.size || item.quality || '',
      url: `${item.url}&title=${videoTitle}`
    });
  });
  return result;
}

// Extract using the property "player_response" from the "ytplayer"
function getFormatsUsingYtPlayerPlayerResponse(playerResponseJSON) {
  const {
    formats: baseFormats, // Base formats (Video + Audio)
    adaptiveFormats // Adaptative formats (separate video and audio)
  } = playerResponseJSON.streamingData;
  const allFormats = baseFormats.concat(adaptiveFormats);

  // Title that we are going to append to the url to force the download
  const videoTitle =
    escape(ytplayer.config.args.title.replace(/"/g, '')) || 'download';

  const result = [];
  allFormats.forEach(item => {
    // Add to results
    result.push({
      title: getFormatDescription(item.itag),
      subtitle: item.size || item.quality || '',
      url: `${item.url}&title=${videoTitle}`
    });
  });
  return result;
}

// Extract using "get_video_info" content
function getFormatsUsingGetVideoInfo() {
  const videoId = ytplayer.config.args.video_id;
  return fetch(
    `/get_video_info?video_id=${videoId}&ps=default&eurl=&gl=US&hl=en&disable_polymer=true`
  )
    .then(response => response.text())
    .then(body => {
      // Extract all pair values from the response
      const pairValues = decodeURIComponent(body).split('&');
      // Retreive the value with the key "player_response"
      const playerResponseRaw = pairValues.find(value => {
        return value.split('=')[0] === 'player_response';
      });
      // From that key-value pair, we only are interested in the value
      const playerResponseSplit = playerResponseRaw.split('=');
      playerResponseSplit.shift(); // Ignore key
      const playerResponseSplitValue = playerResponseSplit.join('=');
      return playerResponseSplitValue;
    })
    .then(playerResponseString => {
      // We may need to replace some simbols
      // const sanitazed = value.replace('\u0026', '&amp;');
      return JSON.parse(playerResponseString);
    })
    .then(playerResponseJSON => {
      // At this point, we have all the info in a strcuture really similar
      // to the one used by "getFormatsUsingYtPlayerPlayerResponse", so we
      // call the function with our data.
      return getFormatsUsingYtPlayerPlayerResponse(playerResponseJSON);
    });
}

/**
 * We have more than one way to extract the available formats, but
 * not all methods are always available, so we check each one until
 * we are able to get the information. We use a Promise because some
 * of those methods may require a new request.
 */
const getFormats = new Promise((resolve, reject) => {
  const { args } = ytplayer.config;

  // Method 1: Using the property "player_response" from the "ytplayer"
  // variable that we can use when we are in a video webpage.
  if ({}.hasOwnProperty.call(args, 'player_response')) {
    console.log('Using "getFormatsUsingYtPlayerPlayerResponse"');
    const playerResponseProperty = JSON.parse(args.player_response);
    const results = getFormatsUsingYtPlayerPlayerResponse(
      playerResponseProperty
    );
    return resolve(results);
  }

  // Method 2: Using the property "url_encoded_fmt_stream_map" from the
  // "ytplayer" variable that we can use when we are in a video webpage.
  // The structure of this property is more awkward to use, but we have all
  // the video formats available without the need of trigger another request.
  if ({}.hasOwnProperty.call(args, 'url_encoded_fmt_stream_map')) {
    console.log('Using "getFormatsUsingYtPlayerUrlEncodedFmtStreamMap"');
    const uefsmProperty = args.url_encoded_fmt_stream_map;
    const results = getFormatsUsingYtPlayerUrlEncodedFmtStreamMap(
      uefsmProperty
    );
    return resolve(results);
  }

  // Method 3: If none all the above methods are available, we can make a new
  // request to the "get_video_info" content. This will get us way more information
  // about the current video, includirng the available formats that we are trying to get.
  console.log('Using "getFormatsUsingGetVideoInfo"');
  return getFormatsUsingGetVideoInfo()
    .then(results => {
      resolve(results);
    })
    .catch(() => {
      console.error('getFormatsUsingGetVideoInfo failed');
      reject();
    });
});

function main() {
  // Popup
  const popup = new Popup();

  getFormats
    .then(formatResults => {
      formatResults.forEach(result => {
        popup.addItemToList(result);
      });
      popup.show();
    })
    .catch(() => console.error('An error occurred'));
}

export default main;
