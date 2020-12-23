/* global commonOptions */

function getVideoId() {
  const locationUrl = window.location.href;

  const regExp = /^.*twitch\.tv\/videos\/([0-9]+)*/;
  const match = locationUrl.match(regExp);
  if (match) {
    return match[1];
  }
  return false;
}

function getClientId() {
  return commonOptions.headers['Client-ID'];
}

function getVideoUrl(videoId, clientId) {
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
  const videoId = getVideoId();
  const clientId = getClientId();
  const videoUrl = await getVideoUrl(videoId, clientId);
  window.location.href = videoUrl;
}

export default main;
