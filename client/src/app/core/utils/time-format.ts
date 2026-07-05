/**
 * Time-value helpers for TIME_* activities.
 *
 * Scores are stored canonically as *total seconds* (a numeric string) in the
 * record's `value_raw`. These helpers convert between that canonical form and
 * the human `m:ss.cc` form used for input and display.
 */

/**
 * Parse a human time string into total seconds. Returns `null` for empty or
 * malformed input.
 *
 * Accepts `"83"`, `"83.4"`, `"1:23"`, `"1:23.4"`, `"1:02:03.5"` (comma or dot
 * decimals). Rejects out-of-range segments (e.g. `"45:74"`) so mistyped values
 * don't silently pass.
 */
export function parseTimeToSeconds(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const text = String(input).trim().replace(',', '.');
  if (text === '') return null;

  const parts = text.split(':');
  if (parts.length > 3) return null;

  let total = 0;
  const n = parts.length;
  for (let i = 0; i < n; i++) {
    const part = parts[i].trim();
    if (!/^\d*\.?\d+$/.test(part)) return null;
    const num = Number(part);
    if (Number.isNaN(num) || num < 0) return null;
    const isLast = i === n - 1;
    if (!isLast && !Number.isInteger(num)) return null; // only seconds may be fractional
    if (n >= 2 && isLast && num >= 60) return null; // seconds < 60 when minutes present
    if (n === 3 && i === 1 && num >= 60) return null; // minutes < 60 in h:mm:ss
    total = total * 60 + num;
  }

  return Math.round(total * 100) / 100;
}

/** Format total seconds as `m:ss` or `m:ss.cc` (with hours if >= 1h). */
export function formatSeconds(totalSeconds: number | string | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined) return '';
  const ts = Number(totalSeconds);
  if (Number.isNaN(ts) || ts < 0) return '';

  const rounded = Math.round(ts * 100) / 100;
  let whole = Math.floor(rounded);
  let centis = Math.round((rounded - whole) * 100);
  if (centis === 100) {
    whole += 1;
    centis = 0;
  }

  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const pad = (val: number) => String(val).padStart(2, '0');

  const base = hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
  return centis > 0 ? `${base}.${pad(centis)}` : base;
}

/** Format a stored canonical value (seconds string) for display. */
export function formatTimeValue(valueRaw: string | number | null | undefined): string {
  if (valueRaw === null || valueRaw === undefined || valueRaw === '') return '';
  const formatted = formatSeconds(valueRaw);
  return formatted === '' ? String(valueRaw) : formatted;
}
