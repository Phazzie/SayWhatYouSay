import { describe, it, expect } from 'vitest';
import { durationToSeconds } from './route';

describe('durationToSeconds', () => {
  it('should convert a duration with seconds and nanos correctly', () => {
    const duration = { seconds: 1, nanos: 500000000 }; // 1.5 seconds
    expect(durationToSeconds(duration)).toBe(1.5);
  });

  it('should handle seconds only', () => {
    const duration = { seconds: 2, nanos: 0 };
    expect(durationToSeconds(duration)).toBe(2);
  });

  it('should handle nanos only', () => {
    const duration = { seconds: 0, nanos: 100000000 }; // 0.1 seconds
    expect(durationToSeconds(duration)).toBe(0.1);
  });

  it('should handle null or undefined values gracefully', () => {
    const duration = { seconds: null, nanos: undefined };
    expect(durationToSeconds(duration)).toBe(0);
  });

  it('should handle an empty object', () => {
    const duration = {};
    expect(durationToSeconds(duration)).toBe(0);
  });
});
