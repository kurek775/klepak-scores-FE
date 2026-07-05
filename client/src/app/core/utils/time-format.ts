/**
 * Time-value helpers for TIME_* activities.
 *
 * Scores are stored canonically as *total seconds* (a numeric string) in the
 * record's `value_raw`. These helpers convert between that canonical form and
 * the human form used for input and display.
 *
 * Accepted input (comma or dot decimals; whitespace tolerated):
 *   "83"        → 83 s
 *   "83.4"      → 83.4 s
 *   "1:23"      → 1 min 23 s
 *   "1:23.4"    → 1 min 23.4 s
 *   "1:23:45"   → 1 min 23.45 s   (mm:ss:cc — the third group is the fraction)
 *
 * Note: race times here never span hours, so a 3-part `a:b:c` is read as
 * mm:ss:fraction, NOT h:mm:ss.
 */

const IS_UINT = /^\d+$/;
const IS_DECIMAL = /^\d*\.?\d+$/;

/** Parse a human time string into total seconds. Returns `null` if invalid. */
export function parseTimeToSeconds(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  const text = String(input).trim().replace(',', '.');
  if (text === '') return null;

  const parts = text.split(':');
  if (parts.length > 3) return null;

  let minutes = 0;
  let secondsStr: string;

  if (parts.length === 1) {
    secondsStr = parts[0].trim();
  } else if (parts.length === 2) {
    const m = parts[0].trim();
    if (!IS_UINT.test(m)) return null;
    minutes = Number(m);
    secondsStr = parts[1].trim();
  } else {
    // mm:ss:cc — the third colon group is a decimal fraction of the second.
    const m = parts[0].trim();
    const s = parts[1].trim();
    const frac = parts[2].trim();
    if (!IS_UINT.test(m) || !IS_UINT.test(s) || !IS_UINT.test(frac)) return null;
    minutes = Number(m);
    secondsStr = `${s}.${frac}`;
  }

  if (!IS_DECIMAL.test(secondsStr)) return null;
  const seconds = Number(secondsStr);
  if (Number.isNaN(seconds) || seconds < 0) return null;
  if (parts.length >= 2 && seconds >= 60) return null; // seconds must be < 60 when minutes present

  return Math.round((minutes * 60 + seconds) * 100) / 100;
}

/** Format total seconds as `m:ss` or `m:ss.cc` (minutes may exceed 59). */
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

  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  const pad = (val: number) => String(val).padStart(2, '0');

  const base = `${minutes}:${pad(seconds)}`;
  return centis > 0 ? `${base}.${pad(centis)}` : base;
}

/** Format a stored canonical value (seconds string) for display. */
export function formatTimeValue(valueRaw: string | number | null | undefined): string {
  if (valueRaw === null || valueRaw === undefined || valueRaw === '') return '';
  const formatted = formatSeconds(valueRaw);
  return formatted === '' ? String(valueRaw) : formatted;
}
