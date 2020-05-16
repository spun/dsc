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
  const playerFileUrl = 'https://player.twitch.tv/js/player.js';

  return fetch(playerFileUrl)
    .then((response) => response.text())
    .then((rawResponseStr) => {
      const re = /\{"Client-ID":"(\w+)"\}/;
      const m = re.exec(rawResponseStr);

      if (m !== null) {
        if (m.index === re.lastIndex) {
          re.lastIndex += 1;
        }
        return m[1];
      }
      return Promise.reject(new Error('Client ID not found'));
    });
}

function getVideoUrl(videoId, clientId) {
  const signatureAndTokenUrl = `https://api.twitch.tv/api/vods/${videoId}/access_token?client_id=${clientId}&format=json`;

  return fetch(signatureAndTokenUrl)
    .then((response) => response.json())
    .then((data) => {
      const signature = data.sig;
      const token = encodeURIComponent(data.token);

      const url = `http://usher.twitch.tv/vod/${videoId}?nauthsig=${signature}&nauth=${token}`;
      return url;
    });
}

function main() {
  const videoId = getVideoId();
  getClientId()
    .then((clientId) => getVideoUrl(videoId, clientId))
    .then((url) => {
      window.location.href = url;
    });
}

export default main;
