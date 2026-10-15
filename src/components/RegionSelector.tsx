import { Globe, MapPin, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { REGIONS } from '@/data/regions';
import { cn } from '@/lib/utils';
import type { Region } from '@/types';

interface RegionSelectorProps {
  selectedRegion: Region;
  onSelect: (region: Region) => void;
}

export function RegionSelector({ selectedRegion, onSelect }: RegionSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const groups = [
    { scope: 'world' as const, label: 'World' },
    { scope: 'continent' as const, label: 'Continents' },
    { scope: 'country' as const, label: 'Countries' },
  ];

  return (
    <div className={cn('relative', open && 'z-[2000]')} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#171b1c] px-4 py-3.5 text-left shadow-[0_8px_25px_rgba(0,0,0,0.12)] transition-all hover:border-accent-500/50 hover:bg-[#1b2021]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 text-accent-400">
          <Globe className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-400">
            Area of Interest
          </div>
          <div className="truncate text-sm font-semibold text-primary-100">
            {selectedRegion.name}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-primary-400 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-[2100] mt-2 max-w-full overflow-hidden rounded-xl border border-[#9dadbe]/25 bg-[#0d1115] shadow-[0_18px_45px_rgba(0,0,0,0.55)] animate-scale-in"
        >
          <div className="max-h-[min(32rem,70vh)] overflow-y-auto p-1.5">
            {groups.map((group) => {
              const regions = REGIONS.filter((region) => region.scope === group.scope);
              return (
                <div key={group.scope} className="mb-2 last:mb-0">
                  <div className="px-3 pb-1 pt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-primary-500">
                    {group.label}
                  </div>
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        onSelect(region);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                        region.id === selectedRegion.id
                          ? 'bg-accent-500/15 text-accent-200'
                          : 'text-primary-300 hover:bg-primary-800/60',
                      )}
                    >
                      <MapPin
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          region.id === selectedRegion.id
                            ? 'text-accent-400'
                            : 'text-primary-500',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{region.name}</div>
                        <div className="truncate text-xs text-primary-500">
                          {region.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
