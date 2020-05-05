import { coordinatesFromStr, CoordinatesFromStrError } from '../coordinatesFromString';

test.each([
  ['{ lat, lon }', '-12.345678,-90.123456', { lat: -12.345678, lon: -90.123456 }],
  ['{ lat, lon }', '12.345678,90.123456', { lat: 12.345678, lon: 90.123456 }],
  ['{ lat, lon }', ' -12.345678  ,  90.123456 ', { lat: -12.345678, lon: 90.123456 }],
  ['{ lat, lon }', ' [ 12.345678  ,  -90.123456 ] ', { lat: 12.345678, lon: -90.123456 }],
])('should return %s', (_, input, expected) => {
  expect(coordinatesFromStr(input)).toMatchObject(expected);
});

test.each([
  ' [ 12.345678  .  90.123456 ] ',
  '92.345678,90.123456',
  '-92.345678,90.123456',
  '12.345678,190.123456',
  '12.345678,-190.123456',
])('should throw error', (input) => {
  expect(() => coordinatesFromStr(input)).toThrow(CoordinatesFromStrError);
});
