// ─── Core Types ───────────────────────────────────────────────────────────────

export type SatelliteSource = 'MODIS' | 'VIIRS';

export type FireIntensityLevel =
  | 'low'
  | 'moderate'
  | 'high'
  | 'very-high'
  | 'extreme';

// A single raw fire hotspot as received from NASA FIRMS
export interface FireHotspot {
  id: string;
  source: SatelliteSource;
  date: string; // ISO yyyy-mm-dd
  lat: number;
  lng: number;
  brightness: number; // Kelvin — MODIS uses 310-500K, VIIRS 300-450K
  confidence: number; // 0-100
  frp: number; // Fire Radiative Power (MW)
  scan: number; // pixel size
  track: number; // pixel size
  acqTime: string; // HH:mm UTC
}

// Harmonized hotspot after spatial-temporal deduplication
export interface HarmonizedHotspot {
  id: string;
  lat: number;
  lng: number;
  frp: number; // Combined FRP (sum of constituent points)
  confidence: number; // Normalized confidence
  brightness: number; // Average brightness temperature (K)
  sources: SatelliteSource[];
  date: string;
}

// Harmonized daily aggregate for a region
export interface DailyFireSummary {
  date: string; // yyyy-mm-dd
  dayOfYear: number;
  month: number; // 1-12
  day: number; // 1-31
  year: number;

  // Raw counts per satellite
  modisCount: number;
  viirsCount: number;

  // Harmonized metrics
  harmonizedCount: number;
  totalFRP: number;
  meanBrightness: number;
  meanConfidence: number;

  // Intensity classification
  intensity: FireIntensityLevel;
  intensityScore: number; // 0-100

  // High-confidence hotspot ratio
  highConfidenceRatio: number;
}

// ─── Regions ──────────────────────────────────────────────────────────────────

export interface Region {
  id: string;
  name: string;
  country: string;
  scope: 'world' | 'continent' | 'country';
  bbox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  fireSeason: {
    startMonth: number;
    endMonth: number;
  };
  description: string;
}

// ─── Early Warning ────────────────────────────────────────────────────────────

export type WarningLevel = 'normal' | 'advisory' | 'watch' | 'warning' | 'extreme';

export interface EarlyWarning {
  level: WarningLevel;
  title: string;
  message: string;
  region: string;
  date: string;
  metrics: {
    recentAvg: number;
    historicalAvg: number;
    deviation: number;
    trend: 'rising' | 'declining' | 'stable';
  };
  recommendations: string[];
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface StatsOverview {
  totalHotspots: number;
  totalFRP: number;
  meanDailyHotspots: number;
  peakDayCount: number;
  peakDayDate: string | null;
  anomalyCount: number;
  harmonizationDelta: number;
}
