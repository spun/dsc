import { getLiveAccessToken, getVideoAccessToken } from './utils/accessUtils';

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
  const regExp = /^\/(\w+)$/;
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
 * Check it the current url is from a vod page and extracts the video id
 */
function isVideoUrl() {
  const locationUrl = window.location.href;

  const regExp = /^.*twitch\.tv\/videos\/([0-9]+)*/;
  const match = locationUrl.match(regExp);
  if (match) {
    return match[1];
  }
  return false;
}

/**
 * Get the manifest (m3u8 file) of a live channel
 */
async function getManigestVideoUrl(videoId: string, clientId: string) {
  const accessToken = await getVideoAccessToken(clientId, videoId);
  // Form url
  const { signature } = accessToken;
  const encodedToken = encodeURIComponent(accessToken.token);
  return `https://usher.ttvnw.net/vod/${videoId}.m3u8?sig=${signature}&token=${encodedToken}`;
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
    const videoId = isVideoUrl();
    if (videoId) {
      const clientId = getClientId();
      const videoManifestUrl = await getManigestVideoUrl(videoId, clientId);
      window.location.href = videoManifestUrl;
    }
  }
}

export default main;
