interface ApiResponse {
  data: ApiResponseData
}

interface ApiResponseData {
  streamPlaybackAccessToken: ApiAccessToken,
  videoPlaybackAccessToken: ApiAccessToken
}
interface ApiAccessToken {
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
async function getAccessTokenResponse(clientId: string, isLive: boolean, channelName = '', videoId = ''): Promise<ApiResponse> {
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
): Promise<AccessToken> {
  const dataJson = await getAccessTokenResponse(clientId, true, channelName, undefined);
  const { value: token, signature } = dataJson.data.streamPlaybackAccessToken;
  return { token, signature };
}

export async function getVideoAccessToken(
  clientId: string,
  videoId: string,
): Promise<AccessToken> {
  const dataJson = await getAccessTokenResponse(clientId, false, undefined, videoId);
  const { value: token, signature } = dataJson.data.videoPlaybackAccessToken;
  return { token, signature };
}

/**
 * Get the shared structure for the different index-dvr.m3u8 URLs. This can be used to generate valid index-dvr.m3u8 URLs.

 * @param videoId The id of the video
 * @returns A string with the part of the URL that is shared between dvr m3u8 files.
 */
export async function getBaseDvrUrl(clientId: string, videoId: string) {

  // This is stupid, but we can't access the base m3u8 content if Firefox's Enhanced Tracking Protection is enabled. 
  // This means that we can't read the available index-dvr.m3u8 URLs directly, we need to "guess" them by requesting
  // other resources that share the same base URL. In this case, we are using the "storyboards" URL.

  // Body of the gql query we will use to get the "storyboards" URL
  const requestBody =
  {
    "operationName": "VideoPlayer_VODSeekbarPreviewVideo",
    "variables": {
      "includePrivate": false,
      "videoID": videoId
    },
    "extensions": {
      "persistedQuery": {
        "version": 1,
        "sha256Hash": "07e99e4d56c5a7c67117a154777b0baf85a5ffefa393b213f4bc712ccaf85dd6"
      }
    }
  }

  // Get api response
  const response = await fetch("https://gql.twitch.tv/gql", {
    "headers": {
      "client-id": clientId,
    },
    "body": JSON.stringify(requestBody),
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  })

  if (!response.ok) {
    throw new Error("Unable to fetch manifest")
  }

  const responseJson = await response.json()

  // Extract storyboads URL from response
  const fullStoryboardsUrl = responseJson["data"]["video"]["seekPreviewsURL"]

  // Split the pathname of the url
  const url = new URL(fullStoryboardsUrl);
  const pathnamePieces = url.pathname.split("/");

  // Check if the current url has the expected format (ends with /storyboards/<videoId>-info.json)
  const expectedFile = `${videoId}-info.json`;
  if (pathnamePieces.at(-1) !== expectedFile || pathnamePieces.at(-2) !== "storyboards") {
    throw new Error(`Storyboards URL does not have the expected format: ${fullStoryboardsUrl}`);
  }

  // Take everything before "/storyboards"
  const beforeStoryboards = pathnamePieces
    .slice(0, pathnamePieces.indexOf("storyboards"))
    .join("/");

  // Rebuild full URL
  url.pathname = beforeStoryboards
  return url.toString();
}
