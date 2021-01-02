// Utility Object with hours, minutes, seconds and miliseconds
export function milisecondsToTime(miliseconds) {
  let temp;
  const time = {};

  time.miliseconds = miliseconds % 1000;
  temp = Math.floor(miliseconds / 1000);
  time.seconds = temp % 60;
  temp = Math.floor(temp / 60);
  time.minutes = temp % 60;
  temp = Math.floor(temp / 60);
  time.hours = temp;
  return time;
}

export function timeStampToSrtTime(timeStamp) {
  const hours = timeStamp.hours.toString().padStart(2, '0');
  const minutes = timeStamp.minutes.toString().padStart(2, '0');
  const seconds = timeStamp.seconds.toString().padStart(2, '0');
  const miliseconds = timeStamp.miliseconds.toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${miliseconds}`;
}

export function milisecondsToSrtTime(miliseconds) {
  const timeStamp = milisecondsToTime(miliseconds);
  return timeStampToSrtTime(timeStamp);
}
