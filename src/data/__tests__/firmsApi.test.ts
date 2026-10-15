import { describe, expect, it } from 'vitest';
import {
  parseConfidence,
  parseCsv,
  harmonizeLiveHotspots,
  isRegionMatch,
  createLiveEarlyWarning,
  createLiveDailySummary,
  type LiveFireData,
} from '@/data/firmsApi';
import type { FireHotspot, Region } from '@/types';

describe('firmsApi: parseConfidence', () => {
  it('correctly maps categorical confidence levels', () => {
    expect(parseConfidence('h')).toBe(90);
    expect(parseConfidence('H')).toBe(90);
    expect(parseConfidence('n')).toBe(60);
    expect(parseConfidence('N')).toBe(60);
    expect(parseConfidence('l')).toBe(30);
    expect(parseConfidence('L')).toBe(30);
  });

  it('correctly parses numeric confidence values', () => {
    expect(parseConfidence('85')).toBe(85);
    expect(parseConfidence('100')).toBe(100);
    expect(parseConfidence('0')).toBe(0);
    expect(parseConfidence('120')).toBe(100);
    expect(parseConfidence('-10')).toBe(0);
  });

  it('handles invalid values gracefully', () => {
    expect(parseConfidence('invalid')).toBe(0);
    expect(parseConfidence('')).toBe(0);
  });
});

describe('firmsApi: parseCsv', () => {
  it('parses valid MODIS CSV data and filters by date', () => {
    const csv = `latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,confidence,version,bright_t31,frp,daynight
-0.123,101.456,335.2,1.0,1.0,2026-10-15,0430,T,85,6.1NRT,295.1,45.8,D
-0.999,102.111,310.0,1.0,1.0,2026-10-14,0500,T,60,6.1NRT,290.0,12.0,D`;

    const result = parseCsv(csv, 'MODIS', '2026-10-15');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      source: 'MODIS',
      date: '2026-10-15',
      lat: -0.123,
      lng: 101.456,
      frp: 45.8,
      confidence: 85,
      acqTime: '04:30',
    });
  });

  it('throws an error if required headers are missing', () => {
    const invalidCsv = `latitude,longitude\n1.0,2.0`;
    expect(() => parseCsv(invalidCsv, 'MODIS', '2026-10-15')).toThrow(
      /missing required columns/,
    );
  });

  it('returns empty array if CSV is empty or only has headers', () => {
    expect(parseCsv('', 'MODIS', '2026-10-15')).toEqual([]);
    expect(
      parseCsv('latitude,longitude,acq_date,frp\n', 'MODIS', '2026-10-15'),
    ).toEqual([]);
  });
});

describe('firmsApi: harmonizeLiveHotspots', () => {
  it('merges overlapping detections within the ~1km grid cell', () => {
    const modisHotspot: FireHotspot = {
      id: 'modis-1',
      source: 'MODIS',
      date: '2026-10-15',
      lat: 0.5001,
      lng: 101.5001,
      brightness: 340,
      confidence: 80,
      frp: 50,
      scan: 1,
      track: 1,
      acqTime: '04:00',
    };

    const viirsHotspot: FireHotspot = {
      id: 'viirs-1',
      source: 'VIIRS',
      date: '2026-10-15',
      lat: 0.5003,
      lng: 101.5003,
      brightness: 360,
      confidence: 90,
      frp: 30,
      scan: 0.375,
      track: 0.375,
      acqTime: '04:15',
    };

    const result = harmonizeLiveHotspots([modisHotspot], [viirsHotspot]);
    expect(result).toHaveLength(1);
    expect(result[0].frp).toBe(80); // 50 + 30
    expect(result[0].confidence).toBe(90); // Max confidence
    expect(result[0].brightness).toBe(350); // Average (340 + 360) / 2
  });

  it('keeps distinct distant detections separate', () => {
    const pointA: FireHotspot = {
      id: 'p1',
      source: 'MODIS',
      date: '2026-10-15',
      lat: 0.0,
      lng: 100.0,
      brightness: 320,
      confidence: 70,
      frp: 20,
      scan: 1,
      track: 1,
      acqTime: '04:00',
    };

    const pointB: FireHotspot = {
      id: 'p2',
      source: 'VIIRS',
      date: '2026-10-15',
      lat: 5.0, // Far away
      lng: 110.0,
      brightness: 330,
      confidence: 80,
      frp: 40,
      scan: 0.375,
      track: 0.375,
      acqTime: '04:15',
    };

    const result = harmonizeLiveHotspots([pointA], [pointB]);
    expect(result).toHaveLength(2);
  });
});

describe('firmsApi: isRegionMatch', () => {
  const dummyRegion: Region = {
    id: 'test-region',
    name: 'Test Region',
    country: 'Test Country',
    scope: 'country',
    bbox: { minLat: 0, maxLat: 10, minLng: 100, maxLng: 110 },
    center: [5, 105],
    zoom: 5,
    bounds: [[0, 100], [10, 110]],
    fireSeason: { startMonth: 1, endMonth: 12 },
    description: 'Test region bbox',
  };

  const globalRegion: Region = {
    id: 'global',
    name: 'World',
    country: 'All',
    scope: 'world',
    bbox: { minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 },
    center: [0, 0],
    zoom: 2,
    bounds: [[-90, -180], [90, 180]],
    fireSeason: { startMonth: 1, endMonth: 12 },
    description: 'Global',
  };

  it('matches points inside bounding box', () => {
    const insidePoint: FireHotspot = {
      id: 'p1',
      source: 'MODIS',
      date: '2026-10-15',
      lat: 5,
      lng: 105,
      brightness: 320,
      confidence: 80,
      frp: 30,
      scan: 1,
      track: 1,
      acqTime: '04:00',
    };
    expect(isRegionMatch(insidePoint, dummyRegion)).toBe(true);
    expect(isRegionMatch(insidePoint, globalRegion)).toBe(true);
  });

  it('rejects points outside bounding box', () => {
    const outsidePoint: FireHotspot = {
      id: 'p2',
      source: 'MODIS',
      date: '2026-10-15',
      lat: 15,
      lng: 105,
      brightness: 320,
      confidence: 80,
      frp: 30,
      scan: 1,
      track: 1,
      acqTime: '04:00',
    };
    expect(isRegionMatch(outsidePoint, dummyRegion)).toBe(false);
    expect(isRegionMatch(outsidePoint, globalRegion)).toBe(true);
  });
});

describe('firmsApi: createLiveEarlyWarning', () => {
  const dummyRegion: Region = {
    id: 'riau',
    name: 'Riau, Indonesia',
    country: 'Indonesia',
    scope: 'country',
    bbox: { minLat: -1, maxLat: 2.5, minLng: 100, maxLng: 104 },
    center: [0.5, 101.5],
    zoom: 7,
    bounds: [[-1, 100], [2.5, 104]],
    fireSeason: { startMonth: 6, endMonth: 10 },
    description: 'Riau peatlands',
  };

  it('generates extreme warning when counts and FRP exceed thresholds', () => {
    const mockData: LiveFireData = {
      date: '2026-10-15',
      modisHotspots: [],
      viirsHotspots: [],
      harmonizedHotspots: Array.from({ length: 25000 }, (_, i) => ({
        id: `h-${i}`,
        source: 'MODIS',
        date: '2026-10-15',
        lat: 0.5,
        lng: 101.5,
        brightness: 350,
        confidence: 90,
        frp: 10,
        scan: 1,
        track: 1,
        acqTime: '04:00',
      })),
      fetchedAt: new Date().toISOString(),
    };

    const summary = createLiveDailySummary(mockData, dummyRegion);
    const warning = createLiveEarlyWarning(summary, dummyRegion);

    expect(warning.level).toBe('extreme');
    expect(warning.title).toBe('Immediate operational attention');
  });

  it('generates normal status when no detections exist', () => {
    const mockData: LiveFireData = {
      date: '2026-10-15',
      modisHotspots: [],
      viirsHotspots: [],
      harmonizedHotspots: [],
      fetchedAt: new Date().toISOString(),
    };

    const summary = createLiveDailySummary(mockData, dummyRegion);
    const warning = createLiveEarlyWarning(summary, dummyRegion);

    expect(warning.level).toBe('normal');
    expect(warning.title).toBe('No FIRMS detections in this region');
  });
});
