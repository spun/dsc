/* eslint-disable no-underscore-dangle */
import { millisecondsToSrtTime } from '../src-bookmarklet/youtube/utils/subtitleTimeUtils';

describe('millisecondsToSrtTime', () => {
  test('zero milliseconds has the correct output', () => {
    const res = millisecondsToSrtTime(0);
    expect(res).toBe('00:00:00,000');
  });

  test('negative milliseconds are ignored and set to 0', () => {
    const res = millisecondsToSrtTime(-1);
    expect(res).toBe('00:00:00,000');
  });

  test('value with just milliseconds', () => {
    const res = millisecondsToSrtTime(345);
    expect(res).toBe('00:00:00,345');
  });

  test('value with milliseconds and seconds', () => {
    const res = millisecondsToSrtTime(51345);
    expect(res).toBe('00:00:51,345');
  });

  test('value with minutes, milliseconds and seconds', () => {
    const res = millisecondsToSrtTime(1611345);
    expect(res).toBe('00:26:51,345');
  });

  test('value with hours, minutes, milliseconds and seconds', () => {
    const res = millisecondsToSrtTime(44811345);
    expect(res).toBe('12:26:51,345');
  });
});
