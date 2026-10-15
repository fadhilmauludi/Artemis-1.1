import { useMemo } from 'react';
import { Satellite } from 'lucide-react';

import type { DailyFireSummary } from '@/types';
import { Card, ProgressBar } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

interface SatelliteComparisonProps {
  dailySummaries: Map<string, DailyFireSummary>;
  selectedDate: string | null;
}

export function SatelliteComparison({
  dailySummaries,
  selectedDate,
}: SatelliteComparisonProps) {
  const comparison = useMemo(() => {
    if (!selectedDate) return null;
    const summary = dailySummaries.get(selectedDate);
    if (!summary) return null;

    const rawTotal = summary.modisCount + summary.viirsCount;
    const modisRatio = rawTotal > 0 ? summary.modisCount / rawTotal : 0;
    const viirsRatio = rawTotal > 0 ? summary.viirsCount / rawTotal : 0;

    // Show how harmonization works for this day
    const harmonized = summary.harmonizedCount;
    const deduped = rawTotal - harmonized;

    return {
      modisCount: summary.modisCount,
      viirsCount: summary.viirsCount,
      rawTotal,
      harmonized,
      deduped,
      modisRatio: Math.round(modisRatio * 100),
      viirsRatio: Math.round(viirsRatio * 100),
      meanBrightness: summary.meanBrightness,
      meanConfidence: summary.meanConfidence,
    };
  }, [dailySummaries, selectedDate]);

  return (
    <Card
      title="Satellite Sensor Comparison"
      subtitle="Live FIRMS · MODIS (1km) vs VIIRS (375m)"
      icon={<Satellite className="h-5 w-5" />}
    >
      <div className="p-5">
        {!comparison ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-primary-500">
            Waiting for NASA FIRMS live observation feed...
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Sensor counts */}
            <div className="grid grid-cols-2 gap-4">
              {/* MODIS */}
              <div className="rounded-xl border border-primary-800/50 bg-primary-900/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                    MODIS
                  </span>
                  <span className="text-[10px] text-primary-500">MODIS NRT · 1km</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-primary-100 tabular-nums">
                  {formatNumber(comparison.modisCount)}
                </div>
                <div className="text-[10px] text-primary-500">detections</div>
                <div className="mt-3">
                  <ProgressBar
                    value={comparison.modisRatio}
                    color="bg-gradient-to-r from-primary-600 to-primary-400"
                  />
                  <div className="mt-1 text-[10px] text-primary-500">
                    {comparison.modisRatio}% of raw detections
                  </div>
                </div>
              </div>

              {/* VIIRS */}
              <div className="rounded-xl border border-primary-800/50 bg-primary-900/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                    VIIRS
                  </span>
                  <span className="text-[10px] text-primary-500">NOAA-21 + SNPP · 375m</span>
                </div>
                <div className="mt-2 text-2xl font-bold text-primary-100 tabular-nums">
                  {formatNumber(comparison.viirsCount)}
                </div>
                <div className="text-[10px] text-primary-500">detections</div>
                <div className="mt-3">
                  <ProgressBar
                    value={comparison.viirsRatio}
                    color="bg-gradient-to-r from-accent-600 to-accent-400"
                  />
                  <div className="mt-1 text-[10px] text-primary-500">
                    {comparison.viirsRatio}% of raw detections
                  </div>
                </div>
              </div>
            </div>

            {/* Harmonization flow */}
            <div className="rounded-xl border border-primary-800/50 bg-primary-900/30 p-4">
              <div className="text-xs font-semibold text-primary-300">
                Harmonization Process
              </div>
              <div className="mt-3 space-y-2.5">
                {/* Raw total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary-400">Raw combined detections</span>
                  <span className="text-sm font-semibold tabular-nums text-primary-200">
                    {formatNumber(comparison.rawTotal)}
                  </span>
                </div>

                <div className="flex justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Dedup */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary-400">
                    Overlapping detections removed
                    <span className="ml-1 text-primary-600">
                      (spatial/temporal de-duplication)
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-error-400">
                    -{formatNumber(comparison.deduped)}
                  </span>
                </div>

                <div className="flex justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary-500">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Harmonized result */}
                <div className="flex items-center justify-between rounded-lg bg-success-500/10 px-3 py-2">
                  <span className="text-xs font-semibold text-success-300">
                    Harmonized unique fire events
                  </span>
                  <span className="text-lg font-bold tabular-nums text-success-400">
                    {formatNumber(comparison.harmonized)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quality metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-primary-800/40 bg-primary-900/30 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-primary-500">
                  Mean Brightness
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-primary-200">
                  {comparison.meanBrightness} K
                </div>
              </div>
              <div className="rounded-lg border border-primary-800/40 bg-primary-900/30 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-primary-500">
                  Mean Confidence
                </div>
                <div className="mt-0.5 text-sm font-semibold tabular-nums text-primary-200">
                  {comparison.meanConfidence}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
