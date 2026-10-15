import { AlertTriangle, CheckCircle2, Eye, Flame, ShieldCheck } from 'lucide-react';
import type { DailyFireSummary, EarlyWarning } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface LiveEarlyWarningPanelProps {
  warning: EarlyWarning;
  summary: DailyFireSummary;
}

const levelConfig = {
  normal: { label: 'CLEAR', color: 'text-emerald-300', border: 'border-emerald-400/30', bg: 'bg-emerald-400/5', icon: CheckCircle2 },
  advisory: { label: 'ADVISORY', color: 'text-sky-300', border: 'border-sky-400/30', bg: 'bg-sky-400/5', icon: Eye },
  watch: { label: 'WATCH', color: 'text-amber-300', border: 'border-amber-400/30', bg: 'bg-amber-400/5', icon: Eye },
  warning: { label: 'WARNING', color: 'text-orange-300', border: 'border-orange-400/30', bg: 'bg-orange-400/5', icon: AlertTriangle },
  extreme: { label: 'EXTREME', color: 'text-red-300', border: 'border-red-400/30', bg: 'bg-red-400/5', icon: Flame },
} as const;

export function LiveEarlyWarningPanel({ warning, summary }: LiveEarlyWarningPanelProps) {
  const config = levelConfig[warning.level];
  const Icon = config.icon;

  return (
    <section className={cn('rounded-xl border border-l-4 p-5', config.border, config.bg)}>
      <div className="flex flex-wrap items-start gap-3">
        <Icon className={cn('mt-0.5 h-6 w-6', config.color)} />
        <div className="min-w-0 flex-1">
          <div className={cn('text-[10px] font-bold uppercase tracking-[0.18em]', config.color)}>
            Live early warning · {config.label}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-white">{warning.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/60">{warning.message}</p>
        </div>
        <div className="text-right text-[10px] text-white/35">
          <div>Observed</div>
          <div className="mt-1 text-xs text-white/60">{formatDate(summary.date)}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="Harmonized" value={summary.harmonizedCount.toLocaleString()} />
        <Metric label="Total FRP" value={`${summary.totalFRP.toLocaleString()} MW`} />
        <Metric label="Confidence" value={`${summary.meanConfidence}%`} />
        <Metric label="Sensors" value="MODIS + VIIRS" />
      </div>

      <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/45">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/70" />
        <span>Use this as a satellite observation triage signal. It does not replace incident command, field verification, weather intelligence, or evacuation authority.</span>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular-nums text-white/85">{value}</div>
    </div>
  );
}
