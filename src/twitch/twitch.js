/* global commonOptions */

// Get assigned client id
function getClientId() {
  return commonOptions.headers['Client-ID'];
}

// Check it the current url is from a main/live channel page and extracts the channel name
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

// Get the manifest (m3u8 file) of a live channel
function getManifestLiveUrl(channelName, clientId) {
  const signatureAndTokenUrl = `https://api.twitch.tv/api/channels/${channelName}/access_token?client_id=${clientId}&format=json`;

  return fetch(signatureAndTokenUrl)
    .then((response) => response.json())
    .then((data) => {
      const signature = data.sig;
      const token = encodeURIComponent(data.token);
      console.log(signature, token);
      const url = `https://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?sig=${signature}&token=${token}`;
      return url;
    });
}

// Check it the current url is from a vod page and extracts the video id
function isVideoUrl() {
  const locationUrl = window.location.href;

  const regExp = /^.*twitch\.tv\/videos\/([0-9]+)*/;
  const match = locationUrl.match(regExp);
  if (match) {
    return match[1];
  }
  return false;
}

// Get the manifest (m3u8 file) of a live channel
function getManigestVideoUrl(videoId, clientId) {
  const signatureAndTokenUrl = `https://api.twitch.tv/api/vods/${videoId}/access_token?client_id=${clientId}&format=json`;

  return fetch(signatureAndTokenUrl)
    .then((response) => response.json())
    .then((data) => {
      const signature = data.sig;
      const token = encodeURIComponent(data.token);

      const url = `https://usher.ttvnw.net/vod/${videoId}.m3u8?sig=${signature}&token=${token}`;
      return url;
    });
}

async function main() {
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
