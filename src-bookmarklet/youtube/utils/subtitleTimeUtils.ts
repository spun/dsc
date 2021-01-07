interface TimeStamp {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

/**
 * Converts a milisecconds time number value to a TimeStamp object
 */
export function millisecondsToTimeStamp(millisecondsInput: number): TimeStamp {
  const ms = millisecondsInput % 1000;
  const s = Math.floor(millisecondsInput / 1000) % 60;
  const m = Math.floor(millisecondsInput / 60000) % 60;
  const h = Math.floor(millisecondsInput / 3600000);
  return {
    hours: h,
    minutes: m,
    seconds: s,
    milliseconds: ms,
  };
}

/**
 * Converts a TimeStamp to a SRT file time format
 */
export function timeStampToSrtTime(timeStamp: TimeStamp): string {
  const hours = timeStamp.hours.toString().padStart(2, '0');
  const minutes = timeStamp.minutes.toString().padStart(2, '0');
  const seconds = timeStamp.seconds.toString().padStart(2, '0');
  const milliseconds = timeStamp.milliseconds.toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}

/**
 * Converts a milisecconds time number to a SRT file time format
 */
export function millisecondsToSrtTime(milliseconds: number): string {
  const msValue = (milliseconds >= 0) ? milliseconds : 0;
  const timeStamp = millisecondsToTimeStamp(msValue);
  return timeStampToSrtTime(timeStamp);
}
