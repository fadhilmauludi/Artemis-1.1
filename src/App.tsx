import { useState, useMemo, useEffect, useCallback } from 'react';
import { Flame, ExternalLink, Database } from 'lucide-react';
import artemisLogo from '@/logo/Artemis.jpg';

import { REGIONS } from '@/data/regions';
import {
  createLiveDailySummary,
  createLiveEarlyWarning,
  fetchLiveFirmsData,
  type LiveFireData,
} from '@/data/firmsApi';
import type { Region } from '@/types';

import { RegionSelector } from '@/components/RegionSelector';
import { SatelliteComparison } from '@/components/SatelliteComparison';
import { LiveEarlyWarningPanel } from '@/components/LiveEarlyWarningPanel';
import { FireMap } from '@/components/FireMap';
import { AboutModal } from '@/components/AboutModal';
import { ArtemisLanding } from '@/components/ArtemisLanding';
import { NewsSlider } from '@/components/NewsSlider';
import { fetchDisasterNews, type DisasterNewsArticle } from '@/data/newsDataApi';
import { DonationWidget } from '@/components/DonationWidget';
import type { Map as LeafletMap } from 'leaflet';

function App() {
  const [region, setRegion] = useState<Region>(REGIONS[0]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLandingOpen, setIsLandingOpen] = useState(true);
  const [liveData, setLiveData] = useState<LiveFireData | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [disasterReports, setDisasterReports] = useState<DisasterNewsArticle[]>([]);
  const [disasterError, setDisasterError] = useState<string | null>(null);
  const [isDisasterLoading, setIsDisasterLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState('Indonesia');
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveFirmsData()
      .then((data) => {
        if (!cancelled) {
          setLiveData(data);
          setLiveError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLiveError(error instanceof Error ? error.message : 'Unable to load NASA FIRMS data.');
        }
      });
    return () => { cancelled = true; };
  }, []);

  const loadDisasterReports = useCallback(() => {
    const controller = new AbortController();
    setIsDisasterLoading(true);
    setDisasterError(null);
    fetchDisasterNews(controller.signal)
      .then(setDisasterReports)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setDisasterError(error instanceof Error ? error.message : 'Unable to load NewsData.io articles.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsDisasterLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => loadDisasterReports(), [loadDisasterReports]);

  useEffect(() => {
    if (!liveData) return;
    setSelectedDate(liveData.date);
  }, [liveData]);

  const handleRegionChange = useCallback((r: Region) => {
    setRegion(r);
  }, []);

  const handleMapReady = useCallback((map: LeafletMap) => {
    setMapInstance(map);
  }, []);

  const handleViewDonationLocation = useCallback((latitude: number, longitude: number, zoom: number) => {
    mapInstance?.flyTo([latitude, longitude], zoom, { duration: 1.5 });
  }, [mapInstance]);

  const liveSummary = useMemo(
    () => liveData ? createLiveDailySummary(liveData, region) : null,
    [liveData, region],
  );
  const liveDailySummaries = useMemo(
    () => liveSummary ? new Map([[liveSummary.date, liveSummary]]) : new Map(),
    [liveSummary],
  );
  const liveWarning = useMemo(
    () => liveSummary ? createLiveEarlyWarning(liveSummary, region) : null,
    [liveSummary, region],
  );

  if (isLandingOpen) {
    return (
      <>
        <ArtemisLanding
          onEnterConsole={() => setIsLandingOpen(false)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
        <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090b] text-white/90 font-sans">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.1] bg-[#080b0e]/95 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:py-3.5">
          <button
            onClick={() => setIsAboutOpen(true)}
            className="group flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-85"
          >
            <img
              src={artemisLogo}
              alt="Artemis"
              className="h-9 w-[4.5rem] shrink-0 rounded-md border border-accent-400/30 bg-black object-cover object-[center_48%] shadow-[0_0_24px_rgba(240,138,36,0.14)] sm:h-10 sm:w-20"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm font-bold tracking-[0.08em] text-white sm:text-base">ARTEMIS</h1>
                <span className="hidden rounded border border-accent-400/25 bg-accent-400/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-300 sm:inline">
                  Monitor
                </span>
              </div>
              <p className="truncate font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40 sm:text-[10px]">
                Satellite fire intelligence
              </p>
            </div>
          </button>

          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <div className="border-l border-white/[0.12] pl-4">
              <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-white/35">Operational console</div>
              <div className="mt-0.5 text-xs text-white/65">Global fire monitoring desk</div>
            </div>
            <div className="h-8 w-px bg-white/[0.1]" />
            <div className="flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.03] px-3 py-2">
              <Database className="h-3.5 w-3.5 text-accent-300" />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">Sensors</div>
                <div className="font-mono text-[10px] font-semibold text-white/75">MODIS + VIIRS</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2">
              <span className={`h-2 w-2 rounded-full ${liveData ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">Feed status</div>
                <div className="font-mono text-[10px] font-semibold text-emerald-200/80">{liveData ? 'NASA FIRMS live' : 'Connecting'}</div>
              </div>
            </div>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md px-2 py-2 font-mono text-[10px] font-semibold text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/85"
            >
              Source
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="rounded-md border border-accent-400/35 bg-accent-400/10 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-200 transition-colors hover:bg-accent-400/20"
            >
              About Artemis
            </button>
          </div>

          <button
            onClick={() => setIsAboutOpen(true)}
            className="rounded-md border border-accent-400/35 bg-accent-400/10 px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-200 transition-colors hover:bg-accent-400/20 lg:hidden"
          >
            About
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6 sm:py-5">
        {/* Page context */}
        <section className="mb-4 flex flex-col justify-between gap-4 border-b border-[#9dadbe]/20 pb-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="terminal-label mb-2 flex items-center gap-2 text-xs font-semibold text-accent-400">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500 shadow-[0_0_10px_rgba(249,136,15,0.8)]" />
              Fire intelligence desk
            </div>
            <h2 className="font-mono text-xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              LIVE FIRE INTELLIGENCE // EARLY WARNING
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
              Monitor live satellite fire hotspots, understand wildfire conditions, follow relevant
              reports, and access direct relief campaigns matched to the selected disaster area.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-white/35 sm:gap-3">
            <span className="rounded border border-white/[0.12] bg-[#10161b] px-3 py-1.5 font-mono text-xs text-white/60">
              Live observation · browser date
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${liveData ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {liveData ? `MODIS + VIIRS NRT · ${liveData.date}` : 'Loading today’s data'}
            </span>
          </div>
        </section>

        <div className="mt-3">
          {liveWarning && liveSummary ? (
            <LiveEarlyWarningPanel warning={liveWarning} summary={liveSummary} />
          ) : (
            <div className="rounded-xl border border-accent-400/20 bg-accent-400/5 p-5 text-sm text-accent-100/70">
              Waiting for NASA FIRMS live observations before issuing an early-warning signal.
            </div>
          )}
        </div>

        {/* Interactive Fire Map — primary workspace */}
        <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div>
            <FireMap
              region={region}
              selectedDate={selectedDate}
              liveModisHotspots={liveData?.modisHotspots ?? []}
              liveViirsHotspots={liveData?.viirsHotspots ?? []}
              liveHarmonizedHotspots={liveData?.harmonizedHotspots ?? []}
              liveDate={liveData?.date ?? null}
              showAllRegions={showAllRegions}
              onToggleAllRegions={() => setShowAllRegions(!showAllRegions)}
              onLocationChange={setCurrentLocation}
              onMapReady={handleMapReady}
            />
          </div>
          <aside className="space-y-3">
            <RegionSelector selectedRegion={region} onSelect={handleRegionChange} />
            <div className="terminal-surface rounded-xl p-4">
              <div className="terminal-label text-xs font-semibold text-white/55">Region profile</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{region.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.1] pt-3 text-xs">
                <span className="text-white/50">Fire season</span>
                <span className="font-medium text-accent-300">
                  {region.fireSeason.startMonth === 1 && region.fireSeason.endMonth === 12
                    ? 'Year-round'
                    : `${getMonthAbbr(region.fireSeason.startMonth)} – ${getMonthAbbr(region.fireSeason.endMonth)}`}
                </span>
              </div>
            </div>
            <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.1]">
              <div className="bg-[#0b0b0b] px-4 py-3">
                <div className="font-mono text-xs uppercase tracking-[0.14em] text-white/55">Sensor fusion</div>
                <div className="mt-1 text-sm font-medium text-white/85">MODIS 1 km + VIIRS 375 m</div>
              </div>
              <div className="bg-[#0b0b0b] px-4 py-3">
                <div className="font-mono text-xs uppercase tracking-[0.14em] text-white/55">Data status</div>
                <div className={`mt-1 text-sm font-medium ${liveData ? 'text-emerald-300' : 'text-accent-300'}`}>
                  {liveSummary ? `${liveSummary.harmonizedCount.toLocaleString()} harmonized detections` : 'Waiting for NASA FIRMS'}
                </div>
                <div className="mt-1 text-xs text-white/55">Current browser-date observation.</div>
              </div>
            </div>
          </aside>
        </section>

        {liveError && (
          <div className="mb-3 rounded-sm border border-red-400/30 bg-red-400/5 px-4 py-3 text-xs text-red-200">
            <strong>NASA FIRMS unavailable:</strong> {liveError} Live observations are unavailable until the connection is restored.
          </div>
        )}

        <div className="mt-3">
          <SatelliteComparison
            dailySummaries={liveDailySummaries}
            selectedDate={selectedDate}
          />
        </div>

        <section className="mt-3 grid gap-3 lg:grid-cols-2">
          <NewsSlider
            articles={disasterReports}
            isLoading={isDisasterLoading}
            error={disasterError}
            onRetry={loadDisasterReports}
          />
          <DonationWidget currentLocation={currentLocation} onViewLocation={handleViewDonationLocation} />
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/[0.04] pt-6 pb-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2 text-xs text-white/20">
              <Flame className="h-3.5 w-3.5 text-amber-500/60" />
              <span className="font-semibold text-white/30">Artemis</span>
              <span className="text-white/10">·</span>
              <span>Harmonized Active Fire Hotspot Analysis</span>
            </div>
            <p className="max-w-2xl text-[10px] leading-relaxed text-white/15">
              Current-day data is fetched from NASA FIRMS MODIS NRT and VIIRS NRT
              (NOAA-21 and SNPP). Harmonization is calculated in the browser from those
              live detections; no simulated historical values are shown in this dashboard.
            </p>
            <div className="flex items-center gap-3 text-[10px] text-white/10">
              <span>MODIS Collection 6.1</span>
              <span>·</span>
              <span>VIIRS VNP14IMGTD</span>
              <span>·</span>
              <span>NASA FIRMS NRT</span>
            </div>
          </div>
        </footer>
      </main>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

function getMonthAbbr(month: number): string {
  if (month < 1) month = 12 + month;
  if (month > 12) month = month - 12;
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return names[month - 1] ?? '';
}

export default App;
