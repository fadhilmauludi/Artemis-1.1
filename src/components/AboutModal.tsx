import {
  X,
  Rocket,
  Users,
  Satellite,
  CloudSun,
  Newspaper,
  HeartHandshake,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import artemisLogo from '@/logo/Artemis.jpg';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setShow(true));
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      setShow(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen && !show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          show && isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#0b0d0f] shadow-2xl shadow-black/50 transition-all duration-200',
          show && isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-2',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close about Artemis"
          className="absolute right-4 top-4 z-10 rounded-lg border border-white/[0.08] bg-black/20 p-2 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden border-b border-white/[0.08] bg-[radial-gradient(circle_at_15%_10%,rgba(240,138,36,0.2),transparent_36%),linear-gradient(135deg,#151a1d,#0b0d0f)] p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border border-amber-300/10" />
          <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border border-amber-300/10" />
          <div className="relative flex items-start gap-4 pr-8">
            <div className="h-14 w-28 shrink-0 overflow-hidden rounded-xl border border-white/[0.15] bg-black shadow-[0_0_28px_rgba(240,138,36,0.18)] sm:h-16 sm:w-36">
              <img src={artemisLogo} alt="Artemis" className="h-full w-full object-cover object-[center_48%]" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" />
                Live fire intelligence
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">About Artemis</h2>
              <p className="mt-1 text-xs text-white/45">A practical wildfire awareness and response companion.</p>
            </div>
          </div>
        </div>
        <div className="space-y-6 p-6 sm:p-8">
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            Artemis turns live satellite fire detections into a clear, location-aware view of wildfire conditions.
            Select a hotspot to inspect local weather, read relevant reports, and find direct relief campaigns for the affected area.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Satellite, title: 'Live hotspot map', text: 'MODIS and combined VIIRS NOAA-21 + SNPP observations from NASA FIRMS.' },
              { icon: CloudSun, title: 'Fire weather context', text: 'Temperature, humidity, wind speed, direction, and spread-risk signals.' },
              { icon: Newspaper, title: 'Wildfire intelligence', text: 'Recent Indonesian and global reports filtered for wildfire relevance.' },
              { icon: HeartHandshake, title: 'Direct relief access', text: 'Location-matched wildfire campaigns and global nonprofit options.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors hover:border-amber-300/25 hover:bg-amber-300/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/15 bg-amber-300/[0.08]">
                    <Icon className="h-4 w-4 text-amber-200" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/85">{title}</h3>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/45">{text}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.06] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-200">How Artemis works</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {['Detect hotspots', 'Add local context', 'Connect relief'].map((step, index) => (
                <div key={step} className="flex items-center gap-3 sm:block">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-300 text-xs font-bold text-[#17130a]">{index + 1}</span>
                  <span className="text-xs font-medium text-white/65 sm:mt-2 sm:block">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <Users className="h-4 w-4 text-white/35" />
              <div><div className="text-[10px] uppercase tracking-wider text-white/30">Built by</div><div className="text-xs font-medium text-white/70">ITS Surabaya</div></div>
            </div>
            <a
              href="https://www.spaceappschallenge.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-blue-300/20 bg-blue-300/[0.05] p-4 transition-colors hover:border-blue-200/40 hover:bg-blue-300/[0.1]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#0b3d91] p-1.5">
                <img
                  src="https://www.nasa.gov/wp-content/themes/nasa/assets/images/nasa-logo.svg"
                  alt="NASA"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-blue-100/60">
                  Hackathon
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="text-xs font-semibold text-white/80">NASA Space Apps Challenge 2026</div>
              </div>
            </a>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/85">Contributors</h3>
              <span className="font-mono text-[9px] uppercase tracking-wider text-white/30">Indonesia</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Fadhil Mauludi', '@fadhilm', 'Team owner'],
                ['Ellvis Cornelius Setiawan', '@ellviscs', 'Contributor'],
                ['Desanda Verdely Yulisar', '@mrpupperfish', 'Contributor'],
                ['Evan Dakara Sukatrilaksana', '@evandakara', 'Contributor'],
                ['Jonathan Itung', '@jonathanitung', 'Contributor'],
                ['Muhammad Syamfiraas Akbar', '@firz', 'Contributor'],
              ].map(([name, handle, role]) => (
                <div key={handle} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
                  <div className="text-xs font-medium text-white/75">{name}</div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-white/35">{handle}</span>
                    <span className="text-[9px] uppercase tracking-wider text-amber-200/55">{role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
            <div>
              <p className="text-[10px] leading-4 text-white/30">Stack: React · TypeScript · Vite · Tailwind · Leaflet · FastAPI · Python</p>
              <p className="mt-1 text-[10px] leading-4 text-white/25">Data: NASA FIRMS · OpenWeatherMap · NewsData.io · Nominatim · Every.org</p>
            </div>
            <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-amber-200/70 transition-colors hover:text-amber-100">
              NASA FIRMS <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
