import { describe, expect, it } from 'vitest';
import { toCompassDirection } from '@/data/weatherApi';

describe('weatherApi: toCompassDirection', () => {
  it('correctly maps angles to compass directions', () => {
    expect(toCompassDirection(0)).toBe('N');
    expect(toCompassDirection(360)).toBe('N');
    expect(toCompassDirection(45)).toBe('NE');
    expect(toCompassDirection(90)).toBe('E');
    expect(toCompassDirection(135)).toBe('SE');
    expect(toCompassDirection(180)).toBe('S');
    expect(toCompassDirection(225)).toBe('SW');
    expect(toCompassDirection(270)).toBe('W');
    expect(toCompassDirection(315)).toBe('NW');
  });
});
