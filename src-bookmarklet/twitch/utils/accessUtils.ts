interface ApiResponse {
  data: ApiResponseData
}

interface ApiResponseData{
  streamPlaybackAccessToken: ApiAccessToken,
  videoPlaybackAccessToken: ApiAccessToken
}
interface ApiAccessToken{
  readonly signature: string;
  readonly value: string;
}

interface AccessToken {
  readonly signature: string;
  readonly token: string;
}

/**
 * Creates a request to get the access token using gql.
 * @param clientId The client id to use in the request.
 * @param isLive Defines if the petition is for a live channel (true) or for a VOD (false).
 * @param channelName If the petition is for a live channel, this has to be the channel name.
 * @param videoId If the petition is for a VOD, this has to be the id of the video.
 */
async function getAccessTokenResponse(clientId: string, isLive: boolean, channelName = '', videoId = '') : Promise<ApiResponse> {
  const gqlTemplate = `
    query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {
      streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {
        value
        signature
      }
      videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {
        value
        signature
      }
    }`;

  // Form a gql petition
  const gqlUrl = 'https://gql.twitch.tv/gql';
  const requestQuery = {
    operationName: 'PlaybackAccessToken_Template',
    query: gqlTemplate,
    variables: {
      isLive,
      login: channelName,
      isVod: !isLive,
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
    body: JSON.stringify(requestQuery),
  });

  // Return data in JSON format
  const dataJson = await response.json();
  return dataJson;
}

export async function getLiveAccessToken(
  clientId: string,
  channelName: string,
) : Promise<AccessToken> {
  const dataJson = await getAccessTokenResponse(clientId, true, channelName, undefined);
  const { value: token, signature } = dataJson.data.streamPlaybackAccessToken;
  return { token, signature };
}

export async function getVideoAccessToken(
  clientId: string,
  videoId: string,
) : Promise<AccessToken> {
  const dataJson = await getAccessTokenResponse(clientId, false, undefined, videoId);
  const { value: token, signature } = dataJson.data.videoPlaybackAccessToken;
  return { token, signature };
}
