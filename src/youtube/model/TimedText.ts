interface Segment {
  utf8: string
}

interface Event {
  tStartMs: number
  dDurationMs: number
  segs?: Segment[]
}

export default interface TimedText {
  events: Event[]
}