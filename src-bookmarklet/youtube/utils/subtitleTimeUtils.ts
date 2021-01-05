interface TimeStamp {
  hours: number
  minutes: number
  seconds: number
  miliseconds: number
}

/**
 * Converts a milisecconds time number value to a TimeStamp object
 */
export function milisecondsToTimeStamp(milisecondsInput: number): TimeStamp {
  const ms = milisecondsInput % 1000;
  const s = Math.floor(milisecondsInput / 1000) % 60;
  const m = Math.floor(milisecondsInput / (1000 * 60)) % 60;
  const h = Math.floor(milisecondsInput / (1000 * 60 * 60));
  return {
    hours: h,
    minutes: m,
    seconds: s,
    miliseconds: ms,
  };
}

/**
 * Converts a TimeStamp to a SRT file time format
 */
export function timeStampToSrtTime(timeStamp: TimeStamp): string {
  const hours = timeStamp.hours.toString().padStart(2, '0');
  const minutes = timeStamp.minutes.toString().padStart(2, '0');
  const seconds = timeStamp.seconds.toString().padStart(2, '0');
  const miliseconds = timeStamp.miliseconds.toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${miliseconds}`;
}

/**
 * Converts a milisecconds time number to a SRT file time format
 */
export function milisecondsToSrtTime(miliseconds: number): string {
  const timeStamp = milisecondsToTimeStamp(miliseconds);
  return timeStampToSrtTime(timeStamp);
}
