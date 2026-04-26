import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import s from './StatCard.module.scss';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface StatCardProps {
  title:       string;
  value:       string | number;
  /** e.g. "+12.4%" — shown with colour coding */
  trend?:      string;
  trendUp?:    boolean;   // true = green, false = red, undefined = neutral
  /** Small description under the value */
  subtitle?:   string;
  /** Icon shown in the top-right corner */
  icon?:       ReactNode;
  /** Slot for a sparkline / mini chart below the value */
  chart?:      ReactNode;
  isLoading?:  boolean;
  className?:  string;
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
export function StatCard({
  title,
  value,
  trend,
  trendUp,
  subtitle,
  icon,
  chart,
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div className={clsx(s.card, isLoading && s.loading, className)}>
      {/* ── Header row ───────────────────────────────────────────────── */}
      <div className={s.header}>
        <span className={s.title}>{title}</span>
        {icon && <span className={s.icon} aria-hidden="true">{icon}</span>}
      </div>

      {/* ── Value ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className={s.skeletonValue} />
      ) : (
        <div className={s.value}>{value}</div>
      )}

      {/* ── Trend + subtitle ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className={s.skeletonMeta} />
      ) : (
        <div className={s.meta}>
          {trend && (
            <span
              className={clsx(
                s.trend,
                trendUp === true  && s.trendUp,
                trendUp === false && s.trendDown,
              )}
            >
              {/* Arrow */}
              {trendUp !== undefined && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className={s.trendArrow}
                >
                  <path
                    d={trendUp ? 'M5 8V2M2 5l3-3 3 3' : 'M5 2v6M8 5L5 8 2 5'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {trend}
            </span>
          )}
          {subtitle && (
            <span className={s.subtitle}>{subtitle}</span>
          )}
        </div>
      )}

      {/* ── Chart slot ───────────────────────────────────────────────── */}
      {chart && !isLoading && (
        <div className={s.chart}>{chart}</div>
      )}
    </div>
  );
}