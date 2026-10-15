import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import type { FireHotspot, Region } from '@/types';
import { REGIONS } from '@/data/regions';
import { fetchCurrentWeather, type CurrentWeather } from '@/data/weatherApi';
import { WeatherInfoCard } from '@/components/WeatherInfoCard';
import { reverseGeocode } from '@/data/locationApi';

interface FireMapProps {
  region: Region;
  selectedDate: string | null;
  liveModisHotspots: FireHotspot[];
  liveViirsHotspots: FireHotspot[];
  liveHarmonizedHotspots: FireHotspot[];
  liveDate: string | null;
  showAllRegions: boolean;
  onToggleAllRegions: () => void;
  onLocationChange: (location: string) => void;
  onMapReady: (map: L.Map) => void;
}

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';
const CARTO_QUERY = CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : '';

const BASE_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png${CARTO_QUERY}`;
const LABELS_URL = `https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}.png${CARTO_QUERY}`;

const LAYER_COLORS = {
  modis: '#3b82f6',
  viirs: '#06b6d4',
  harmonized: '#f9880f',
} as const;

const MAX_LIVE_MAP_POINTS = 1000;

export function FireMap({
  region,
  selectedDate,
  liveModisHotspots,
  liveViirsHotspots,
  liveHarmonizedHotspots,
  liveDate,
  showAllRegions,
  onToggleAllRegions,
  onLocationChange,
  onMapReady,
}: FireMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const layersRef = useRef<{
    modis: L.FeatureGroup;
    viirs: L.FeatureGroup;
    harmonized: L.FeatureGroup;
    regions: L.FeatureGroup;
  }>({
    modis: new L.FeatureGroup(),
    viirs: new L.FeatureGroup(),
    harmonized: new L.FeatureGroup(),
    regions: new L.FeatureGroup(),
  });

  const [showModis, setShowModis] = useState(false);
  const [showViirs, setShowViirs] = useState(false);
  const [showHarmonized, setShowHarmonized] = useState(true);
  const [showLayerInfo, setShowLayerInfo] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      minZoom: 2,
      maxBounds: [
        [-90, -180],
        [90, 180],
      ],
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
    }).setView([region.center[0], region.center[1]], region.zoom);

    canvasRendererRef.current = L.canvas({ padding: 0.5 });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.createPane('modisPane').style.zIndex = '420';
    map.createPane('viirsPane').style.zIndex = '430';
    map.createPane('harmonizedPane').style.zIndex = '440';

    L.tileLayer(BASE_URL, {
      maxZoom: 19,
      minZoom: 2,
      noWrap: true,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    L.tileLayer(LABELS_URL, {
      maxZoom: 19,
      minZoom: 2,
      noWrap: true,
      pane: 'shadowPane',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    }).addTo(map);

    // Add layer groups to map
    layersRef.current.modis.addTo(map);
    layersRef.current.viirs.addTo(map);
    layersRef.current.harmonized.addTo(map);
    layersRef.current.regions.addTo(map);

    mapInstance.current = map;
    onMapReady(map);

    return () => {
      map.remove();
      mapInstance.current = null;
      canvasRendererRef.current = null;
    };
  }, [region.center, region.zoom, onMapReady]);

  // Update map view when region changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.flyTo([region.center[0], region.center[1]], region.zoom, {
        duration: 1.5
      });
    }
  }, [region]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current) return;

    const { modis, viirs, harmonized } = layersRef.current;
    modis.clearLayers();
    viirs.clearLayers();
    harmonized.clearLayers();

    if (!selectedDate) return;

    const isLiveDate = liveDate === selectedDate;
    const filterLive = (points: FireHotspot[]) => isLiveDate
      ? points.filter((point) => {
        const { minLat, maxLat, minLng, maxLng } = region.bbox;
        return region.id === 'global' ||
          (point.lat >= minLat && point.lat <= maxLat && point.lng >= minLng && point.lng <= maxLng);
      }).sort((a, b) => b.frp - a.frp).slice(0, MAX_LIVE_MAP_POINTS)
      : [];
    const hotspots = isLiveDate
      ? {
        modis: filterLive(liveModisHotspots),
        viirs: filterLive(liveViirsHotspots),
        harmonized: filterLive(liveHarmonizedHotspots),
      }
      : { modis: [], viirs: [], harmonized: [] };

    const createPopup = (point: FireHotspot, color: string) => `
      <div style="background-color: #0f0f0f; border: 1px solid rgba(255,255,255,0.04); padding: 12px; border-radius: 8px; color: #fff; font-family: Inter, sans-serif; min-width: 200px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: ${color}; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">${point.source} Detection</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
          <span style="color: #888;">FRP</span>
          <span style="font-family: 'JetBrains Mono', monospace;">${point.frp.toFixed(1)} MW</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
          <span style="color: #888;">Confidence</span>
          <span style="font-family: 'JetBrains Mono', monospace;">${point.confidence}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px;">
          <span style="color: #888;">Brightness</span>
          <span style="font-family: 'JetBrains Mono', monospace;">${point.brightness.toFixed(1)} K</span>
        </div>
      </div>
    `;

    const addMarkers = (
      data: FireHotspot[],
      group: L.FeatureGroup,
      color: string,
      pane: string,
      radius: number,
    ) => {
      data.forEach(point => {
        const marker = L.circleMarker([point.lat, point.lng], {
          radius,
          fillColor: color,
          color: color,
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.78,
          pane,
          renderer: canvasRendererRef.current ?? undefined,
        });
        
        marker.bindPopup(createPopup(point, color), {
          className: 'custom-popup',
          closeButton: false,
        });
        marker.on('click', () => {
          setSelectedCoordinates({ lat: point.lat, lng: point.lng });
          reverseGeocode(point.lat, point.lng)
            .then((location) => onLocationChange(location.displayName))
            .catch(() => onLocationChange('Selected disaster area'));
        });
        
        group.addLayer(marker);
      });
    };

    addMarkers(hotspots.modis, modis, LAYER_COLORS.modis, 'modisPane', 3.5);
    addMarkers(hotspots.viirs, viirs, LAYER_COLORS.viirs, 'viirsPane', 3.5);
    addMarkers(hotspots.harmonized, harmonized, LAYER_COLORS.harmonized, 'harmonizedPane', 5);

  }, [region, selectedDate, liveDate, liveModisHotspots, liveViirsHotspots, liveHarmonizedHotspots, onLocationChange]);

  const loadWeather = React.useCallback(() => {
    if (!selectedCoordinates) return;

    const controller = new AbortController();
    setIsWeatherLoading(true);
    setWeatherError(null);
    setWeather(null);

    fetchCurrentWeather(selectedCoordinates.lat, selectedCoordinates.lng, controller.signal)
      .then(setWeather)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setWeatherError(error instanceof Error ? error.message : 'Unable to load weather data.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsWeatherLoading(false);
      });

    return () => controller.abort();
  }, [selectedCoordinates]);

  useEffect(() => loadWeather(), [loadWeather]);

  // Update regions overlay
  useEffect(() => {
    if (!mapInstance.current) return;
    
    const { regions } = layersRef.current;
    regions.clearLayers();

    if (showAllRegions) {
      REGIONS.forEach(r => {
        const bounds = L.latLngBounds(
          [r.bounds[0][0], r.bounds[0][1]],
          [r.bounds[1][0], r.bounds[1][1]]
        );
        
        const rect = L.rectangle(bounds, {
          color: '#ffffff',
          weight: 1,
          dashArray: '4, 4',
          fillOpacity: 0.05,
          opacity: 0.3
        });
        
        rect.bindTooltip(r.name, {
          permanent: false,
          direction: 'center',
          className: 'bg-[#0f0f0f] border border-white/5 text-white px-2 py-1 rounded text-xs'
        });

        regions.addLayer(rect);
      });
    }
  }, [showAllRegions]);

  // Handle layer visibility
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const { modis, viirs, harmonized } = layersRef.current;

    if (showModis) map.addLayer(modis);
    else map.removeLayer(modis);

    if (showViirs) map.addLayer(viirs);
    else map.removeLayer(viirs);

    if (showHarmonized) map.addLayer(harmonized);
    else map.removeLayer(harmonized);

  }, [showModis, showViirs, showHarmonized]);

  return (
    <div className="relative isolate h-[430px] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101210] shadow-[0_14px_45px_rgba(0,0,0,0.2)] sm:h-[540px]">
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {selectedCoordinates && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] sm:bottom-4 sm:left-4">
          <WeatherInfoCard
            coordinates={selectedCoordinates}
            weather={weather}
            isLoading={isWeatherLoading}
            error={weatherError}
            onRetry={loadWeather}
            onClose={() => {
              setSelectedCoordinates(null);
              setWeather(null);
              setWeatherError(null);
            }}
          />
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 z-[1000] sm:left-5 sm:top-5">
        <div className="max-w-[calc(100vw-10rem)] rounded-xl border border-white/[0.1] bg-[#0b0d0b]/85 px-3 py-2.5 backdrop-blur-md sm:max-w-none sm:px-4 sm:py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e7a356]">
            Live activity map
          </div>
          <div className="mt-1 text-xs text-white/55">
            {selectedDate
              ? `${liveDate === selectedDate ? 'NASA FIRMS live ·' : 'Modeled ·'} ${selectedDate}`
              : 'Select a day to inspect hotspots'}
          </div>
        </div>
      </div>
      
      {/* Controls Overlay */}
      <div className="pointer-events-none absolute bottom-3 right-3 top-3 z-[1000] flex max-w-[calc(100%-1.5rem)] flex-col gap-2 sm:bottom-4 sm:right-4 sm:top-4">
        <div className="pointer-events-auto flex max-h-full flex-col gap-3 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0b0d0b]/90 p-3 backdrop-blur-md sm:p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Layers</h3>
            <button
              type="button"
              onClick={() => setShowLayerInfo((current) => !current)}
              aria-expanded={showLayerInfo}
              aria-label="Explain fire map layers"
              className={cn(
                'rounded-md p-1 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white/75',
                showLayerInfo && 'bg-white/[0.07] text-[#f0a04a]',
              )}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>

          {showLayerInfo && (
            <div className="border-b border-white/[0.08] pb-3 text-[11px] leading-5 text-white/50">
              <p>
                Compare the two satellite sensors with the harmonized record used for analysis.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: LAYER_COLORS.modis }} />
                  <p><strong className="font-medium text-blue-300">MODIS Raw</strong> · longer historical record, 1 km resolution.</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: LAYER_COLORS.viirs }} />
                  <p><strong className="font-medium text-cyan-300">VIIRS Raw</strong> · finer detail, 375 m resolution, detects smaller fires.</p>
                </div>
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: LAYER_COLORS.harmonized }} />
                  <p><strong className="font-medium text-orange-300">Harmonized</strong> · MODIS + VIIRS combined with overlapping detections reduced.</p>
                </div>
              </div>
              <p className="mt-3 text-white/35">
                Use Harmonized for early warnings, intensity metrics, and operational triage.
              </p>
            </div>
          )}
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={cn("w-3 h-3 rounded-full border", !showHarmonized && "border-white/20")}
              style={showHarmonized ? { backgroundColor: LAYER_COLORS.harmonized, borderColor: LAYER_COLORS.harmonized } : undefined}
            />
            <span className={cn("text-sm", showHarmonized ? "text-white" : "text-white/50 group-hover:text-white/70")}>Harmonized</span>
            <input type="checkbox" className="hidden" checked={showHarmonized} onChange={(e) => setShowHarmonized(e.target.checked)} />
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={cn("w-3 h-3 rounded-full border", !showModis && "border-white/20")}
              style={showModis ? { backgroundColor: LAYER_COLORS.modis, borderColor: LAYER_COLORS.modis } : undefined}
            />
            <span className={cn("text-sm", showModis ? "text-white" : "text-white/50 group-hover:text-white/70")}>MODIS Raw</span>
            <input type="checkbox" className="hidden" checked={showModis} onChange={(e) => setShowModis(e.target.checked)} />
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={cn("w-3 h-3 rounded-full border", !showViirs && "border-white/20")}
              style={showViirs ? { backgroundColor: LAYER_COLORS.viirs, borderColor: LAYER_COLORS.viirs } : undefined}
            />
            <span className={cn("text-sm", showViirs ? "text-white" : "text-white/50 group-hover:text-white/70")}>VIIRS Raw</span>
            <input type="checkbox" className="hidden" checked={showViirs} onChange={(e) => setShowViirs(e.target.checked)} />
          </label>
        </div>

        <button
          onClick={onToggleAllRegions}
          className="pointer-events-auto rounded-xl border border-white/[0.1] bg-[#0b0d0b]/90 px-4 py-2.5 text-xs font-medium text-white/65 backdrop-blur-md transition-colors hover:text-white"
        >
          {showAllRegions ? 'Hide Regions' : 'Show Regions'}
        </button>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-popup-tip {
          background: #0f0f0f;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-left: 1px solid rgba(255,255,255,0.04);
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
