import { AlertTriangle, Cloud, Droplets, LoaderCircle, RefreshCw, Wind, X } from 'lucide-react';
import type { CurrentWeather } from '@/data/weatherApi';

interface WeatherInfoCardProps {
  coordinates: { lat: number; lng: number };
  weather: CurrentWeather | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export function WeatherInfoCard({
  coordinates,
  weather,
  isLoading,
  error,
  onRetry,
  onClose,
}: WeatherInfoCardProps) {
  const highFireSpreadRisk = weather !== null
    && weather.windSpeedMetersPerSecond >= 8
    && weather.humidityPercent <= 35;

  return (
    <section
      aria-live="polite"
      className="pointer-events-auto w-[min(22rem,calc(100vw-1.5rem))] rounded-xl border border-white/[0.12] bg-[#0b0d0b]/95 p-4 text-white shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-sky-300" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Current weather</h3>
            <p className="mt-1 font-mono text-[10px] text-white/40">
              {weather?.locationName ?? `${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close weather information"
          className="rounded-md p-1 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-white/55">
          <LoaderCircle className="h-4 w-4 animate-spin text-sky-300" />
          Loading weather data...
        </div>
      )}

      {error && !isLoading && (
        <div className="mt-4 rounded-lg border border-red-400/25 bg-red-400/5 p-3">
          <p className="text-xs leading-5 text-red-200">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-white/[0.12] px-2.5 py-1.5 text-[11px] text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}

      {weather && !isLoading && !error && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric icon={<Cloud className="h-3.5 w-3.5" />} label="Temperature" value={`${weather.temperatureCelsius.toFixed(1)}°C`} />
            <Metric icon={<Droplets className="h-3.5 w-3.5" />} label="Humidity" value={`${weather.humidityPercent}%`} />
            <Metric icon={<Wind className="h-3.5 w-3.5" />} label="Wind speed" value={`${weather.windSpeedMetersPerSecond.toFixed(1)} m/s`} />
            <Metric icon={<Wind className="h-3.5 w-3.5" />} label="Wind direction" value={`${weather.windDirectionLabel} · ${Math.round(weather.windDirectionDegrees)}°`} />
          </div>
          <p className="mt-3 text-[11px] capitalize text-white/45">{weather.condition}</p>
          {highFireSpreadRisk && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-2 text-[11px] font-semibold text-orange-200">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              High Fire Spread Risk
            </div>
          )}
          <p className="mt-3 font-mono text-[9px] text-white/25">
            OpenWeatherMap · updated {new Date(weather.observedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </>
      )}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-white/40">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-mono text-xs font-medium text-white/85">{value}</div>
    </div>
  );
}
