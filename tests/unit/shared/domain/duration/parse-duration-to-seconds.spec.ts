import { parseDurationToSeconds } from '@/shared/domain/duration/parse-duration-to-seconds';

describe('parseDurationToSeconds', () => {
  it('should convert days to seconds', () => {
    expect(parseDurationToSeconds('7d')).toBe(7 * 24 * 60 * 60);
  });

  it('should convert hours to seconds', () => {
    expect(parseDurationToSeconds('12h')).toBe(12 * 60 * 60);
  });

  it('should convert minutes to seconds', () => {
    expect(parseDurationToSeconds('30m')).toBe(30 * 60);
  });

  it('should convert seconds to seconds', () => {
    expect(parseDurationToSeconds('45s')).toBe(45);
  });

  it('should throw for an unrecognized format', () => {
    expect(() => parseDurationToSeconds('7')).toThrow();
    expect(() => parseDurationToSeconds('7x')).toThrow();
    expect(() => parseDurationToSeconds('')).toThrow();
  });
});
