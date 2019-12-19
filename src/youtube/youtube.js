/* global ytplayer */

// Video format dictionary
import { getFormatDescription } from './formats';
// UI popup
import Popup from '../popup/popup';

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

// Extract all available format from the raw string
function extractVideoFormats(rawData) {
  const videoFormats = [];
  rawData.forEach(item => {
    const splitData = item.split('&');
    videoFormats.push(objectifyVideoFormat(splitData));
  });
  return videoFormats;
}

// Add all the formats available as items of the UI popup
function addFormatsToPopup(popup, videoFormats, videoTitle) {
  // Add each format to the list
  videoFormats.forEach(formatData => {
    // Retrieve necessary item info from "formatData"
    const formatTitle = getFormatDescription(formatData.itag);
    const formatSubtitle = formatData.size || formatData.quality || '';
    const formatUrl = `${formatData.url}&title=${videoTitle}`;
    // Add to popup
    popup.addItemToList(formatTitle, formatSubtitle, formatUrl);
  });
}

function main() {
  // Popup
  const popup = new Popup();
  // Extract muxed formats (Video + Audio)
  const muxedFormatsData = ytplayer.config.args.url_encoded_fmt_stream_map.split(
    ','
  );
  const muxedFormats = extractVideoFormats(muxedFormatsData);
  // Extract adaptive formats (Video or Audio)
  const adaptiveFormatsData = ytplayer.config.args.adaptive_fmts.split(',');
  const adaptiveFormats = extractVideoFormats(adaptiveFormatsData);
  // Add all formats to the popup list
  // Use videoTitle as the download file name
  const videoTitle = escape(ytplayer.config.args.title.replace(/"/g, ''));
  addFormatsToPopup(popup, muxedFormats, videoTitle);
  addFormatsToPopup(popup, adaptiveFormats, videoTitle);
  // Show popup
  popup.show();
}

export default main;
