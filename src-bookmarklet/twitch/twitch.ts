interface CommonOptions {
  headers: Record<string, string>;
}
declare const commonOptions: CommonOptions;

interface AccessTokenResponse {
  readonly sig: string;
  readonly token: string;
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
  const signatureAndTokenUrl = `https://api.twitch.tv/api/channels/${channelName}/access_token?client_id=${clientId}&format=json`;
  const response = await fetch(signatureAndTokenUrl);
  const data: AccessTokenResponse = await response.json();
  const signature = data.sig;
  const token = encodeURIComponent(data.token);
  return `https://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8?sig=${signature}&token=${token}`;
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
  // Form a gql petition
  const gqlUrl = 'https://gql.twitch.tv/gql';
  const requestData = {
    operationName: 'PlaybackAccessToken_Template',
    query: 'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
    variables: {
      isLive: false,
      login: '',
      isVod: true,
      vodID: videoId,
      playerType: 'site',
    },
  };
  // Send request
  const response = await fetch(gqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Client-ID': clientId,
    },
    body: JSON.stringify(requestData),
  });
  // Extract required values
  const responseJson = await response.json();
  const { value: token, signature } = responseJson.data.videoPlaybackAccessToken;
  // Form url
  const encodedToken = encodeURIComponent(token);
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
