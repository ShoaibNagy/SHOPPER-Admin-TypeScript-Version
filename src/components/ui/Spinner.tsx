import { clsx } from 'clsx';
import s from './Spinner.module.scss';

export type SpinnerSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'inline' | 'overlay' | 'page';

export interface SpinnerProps {
  size?:    SpinnerSize;
  variant?: SpinnerVariant;
  label?:   string;   // accessible label; also shown below in page variant
  className?: string;
}

const sizePx: Record<SpinnerSize, number> = {
  xs: 12, sm: 16, md: 24, lg: 36, xl: 48,
};

const strokeWidth: Record<SpinnerSize, number> = {
  xs: 2, sm: 2, md: 2.5, lg: 3, xl: 3,
};

export function Spinner({
  size    = 'md',
  variant = 'inline',
  label   = 'Loading…',
  className,
}: SpinnerProps) {
  const px = sizePx[size];
  const sw = strokeWidth[size];
  const r  = (px - sw * 2) / 2;
  const c  = px / 2;
  const circumference = 2 * Math.PI * r;

  const ring = (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      className={s.ring}
      aria-hidden="true"
    >
      {/* Track */}
      <circle cx={c} cy={c} r={r} stroke="currentColor" strokeWidth={sw} opacity={0.15} />
      {/* Arc — 25% of circumference */}
      <circle
        cx={c}
        cy={c}
        r={r}
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
        strokeDashoffset={0}
        style={{ transformOrigin: 'center', animation: `spin ${0.8}s linear infinite` }}
      />
    </svg>
  );

  if (variant === 'overlay') {
    return (
      <div className={clsx(s.overlay, className)} role="status" aria-label={label}>
        <div className={s.overlayCard}>
          <span className={clsx(s.inline, s[size])} style={{ color: 'var(--color-brand)' }}>
            {ring}
          </span>
          {label && <span className={s.overlayLabel}>{label}</span>}
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={clsx(s.page, className)} role="status" aria-label={label}>
        <span className={clsx(s.inline, s[size])} style={{ color: 'var(--color-brand)' }}>
          {ring}
        </span>
        {label && <span className={s.pageLabel}>{label}</span>}
      </div>
    );
  }

  // Default: inline
  return (
    <span
      className={clsx(s.inline, s[size], className)}
      role="status"
      aria-label={label}
      style={{ color: 'var(--color-brand)' }}
    >
      {ring}
      <span className={s.srOnly}>{label}</span>
    </span>
  );
}