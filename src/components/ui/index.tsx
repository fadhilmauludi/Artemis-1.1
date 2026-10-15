import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function Card({
  children,
  className,
  title,
  subtitle,
  icon,
  action,
}: CardProps) {
  return (
    <div
      className={cn(
        'terminal-surface rounded-sm overflow-hidden',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[#9dadbe]/15 px-4 py-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/40">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-white/90">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 font-mono text-[10px] text-white/35">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'warning' | 'error' | 'success' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-white/[0.04] text-white/50 border-white/[0.06]',
    accent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    primary: 'bg-white/[0.04] text-white/60 border-white/[0.06]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border font-medium',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 80);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sideClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'pointer-events-none absolute z-50 max-w-[min(280px,calc(100vw-2rem))] whitespace-normal rounded-lg border border-white/[0.08] bg-[#111]/95 px-3 py-2 text-xs text-white/80 shadow-xl backdrop-blur-md',
            sideClasses[side],
            className,
          )}
          style={{ animation: 'fadeIn 0.1s ease-out' }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ─── StatPill ────────────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function StatPill({
  label,
  value,
  unit,
  icon,
  accentColor = 'text-amber-400',
  trend,
  trendValue,
}: StatPillProps) {
  const trendColors: Record<string, string> = {
    up: 'text-red-400',
    down: 'text-emerald-400',
    neutral: 'text-white/30',
  };

  return (
    <div className="rounded-sm border border-white/[0.12] bg-[#111] p-3 transition-colors hover:border-white/[0.24] hover:bg-[#171717]">
      <div className="flex items-center justify-between">
        <span className="terminal-label text-[10px] font-medium text-white/38">{label}</span>
        {icon && <span className={cn('opacity-40', accentColor)}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('terminal-number text-2xl font-bold', accentColor)}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-white/20">{unit}</span>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <span className={trendColors[trend]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Select (custom dropdown) ────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ value, options, onChange, className }: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 pr-9 text-sm font-medium text-white/80 transition-colors hover:border-white/10 focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111]">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  );
}

// ─── Toggle Button ───────────────────────────────────────────────────────────

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ToggleButton({
  active,
  onClick,
  children,
  className,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border',
        active
          ? 'bg-white/[0.06] text-white/80 border-white/10'
          : 'bg-transparent text-white/30 border-transparent hover:bg-white/[0.02] hover:text-white/50',
        className,
      )}
    >
      {children}
    </button>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0-100
  color?: string;
  height?: number;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'bg-amber-500',
  height = 4,
  className,
}: ProgressBarProps) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-white/[0.04]', className)}
      style={{ height }}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 600,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(start + diff * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevRef.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={cn('tabular-nums', className)}>{format(displayValue)}</span>
  );
}
