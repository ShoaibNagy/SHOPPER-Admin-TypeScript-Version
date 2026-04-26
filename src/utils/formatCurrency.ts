// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------
// Default locale is 'en-EG' and currency 'EGP' because the storefront and
// admin are deployed for an Egyptian market.
// Pass overrides for any other region.
// ---------------------------------------------------------------------------

const DEFAULT_LOCALE = 'en-EG';
const DEFAULT_CURRENCY = 'EGP';

/**
 * Format a numeric amount as a localised currency string.
 *
 * @example
 * formatCurrency(1499.99)          // "EGP 1,500"
 * formatCurrency(1499.99, 'USD')   // "$1,500"
 * formatCurrency(1499.99, 'EUR', 'de-DE') // "1.500 €"
 */
export function formatCurrency(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a price difference / delta with a leading + or − sign.
 *
 * @example
 * formatCurrencyDelta(250)   // "+EGP 250"
 * formatCurrencyDelta(-120)  // "−EGP 120"
 */
export function formatCurrencyDelta(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  const abs = Math.abs(amount);
  const formatted = formatCurrency(abs, currency, locale);
  return amount >= 0 ? `+${formatted}` : `−${formatted}`;
}

/**
 * Format a number as a compact abbreviated value.
 *
 * @example
 * formatCompact(1_250_000) // "1.3M"
 * formatCompact(9_400)     // "9.4K"
 */
export function formatCompact(value: number, locale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a currency value in compact notation.
 *
 * @example
 * formatCurrencyCompact(1_250_000) // "EGP 1.3M"
 */
export function formatCurrencyCompact(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Calculate the percentage margin between cost and selling price.
 *
 * @example
 * calcMargin(100, 160) // 37.5  (%)
 */
export function calcMargin(cost: number, price: number): number {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}