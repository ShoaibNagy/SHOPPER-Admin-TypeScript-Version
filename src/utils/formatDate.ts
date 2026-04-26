// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------
// All helpers accept either a JS Date or an ISO-8601 string
// (what Mongoose returns over JSON).
// ---------------------------------------------------------------------------

type DateInput = Date | string | number;

const DEFAULT_LOCALE = 'en-EG';

function toDate(input: DateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

/**
 * Short date: "Apr 25, 2026"
 */
export function formatDate(input: DateInput, locale = DEFAULT_LOCALE): string {
  return toDate(input).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Date + time: "Apr 25, 2026, 14:32"
 */
export function formatDateTime(input: DateInput, locale = DEFAULT_LOCALE): string {
  return toDate(input).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Time only: "14:32"
 */
export function formatTime(input: DateInput, locale = DEFAULT_LOCALE): string {
  return toDate(input).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Relative time using Intl.RelativeTimeFormat.
 * Returns strings like "3 days ago", "in 2 hours", "just now".
 */
export function formatRelativeTime(input: DateInput, locale = DEFAULT_LOCALE): string {
  const date = toDate(input);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const absMs = Math.abs(diffMs);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (absMs < 60_000) return 'just now';
  if (absMs < 3_600_000) return rtf.format(Math.round(diffMs / 60_000), 'minute');
  if (absMs < 86_400_000) return rtf.format(Math.round(diffMs / 3_600_000), 'hour');
  if (absMs < 7 * 86_400_000) return rtf.format(Math.round(diffMs / 86_400_000), 'day');
  if (absMs < 30 * 86_400_000) return rtf.format(Math.round(diffMs / 7 / 86_400_000), 'week');
  if (absMs < 365 * 86_400_000) return rtf.format(Math.round(diffMs / 30 / 86_400_000), 'month');
  return rtf.format(Math.round(diffMs / 365 / 86_400_000), 'year');
}

/**
 * ISO date only, useful for <input type="date"> value binding: "2026-04-25"
 */
export function toISODate(input: DateInput): string {
  return toDate(input).toISOString().slice(0, 10);
}

/**
 * Format a date range: "Apr 1 – Apr 25, 2026"
 */
export function formatDateRange(
  from: DateInput,
  to: DateInput,
  locale = DEFAULT_LOCALE,
): string {
  const f = toDate(from);
  const t = toDate(to);
  const sameYear = f.getFullYear() === t.getFullYear();
  const sameMonth = sameYear && f.getMonth() === t.getMonth();

  const startOpts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  };
  const endOpts: Intl.DateTimeFormatOptions = {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  };

  const start = f.toLocaleDateString(locale, startOpts);
  const end = t.toLocaleDateString(locale, endOpts);
  return `${start} – ${end}`;
}