interface Format {
  itag: number;
  url: string;
  quality?: string;
  size?: string;
}

interface StreamingData {
  formats: Format[]
  adaptiveFormats: Format[]
}

interface VideoDetails {
  title: string
}

interface CaptionName {
  simpleText: string
}

interface CaptionTrack {
  baseUrl: string
  languageCode: string
  name: CaptionName
}

interface PlayerCaptionsTracklistRenderer {
  captionTracks: CaptionTrack[]
}

interface Captions {
  playerCaptionsTracklistRenderer: PlayerCaptionsTracklistRenderer
}

export interface RawPlayerResponse {
  streamingData: StreamingData
  videoDetails: VideoDetails
  captions: Captions
}

interface Args {
  raw_player_response: RawPlayerResponse;
  video_id: string;
}

interface Config {
  args: Args;
}

export interface YtPlayer {
  config: Config;
}
