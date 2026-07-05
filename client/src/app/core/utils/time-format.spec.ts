import { formatSeconds, formatTimeValue, parseTimeToSeconds } from './time-format';

describe('parseTimeToSeconds', () => {
  it('parses plain seconds', () => {
    expect(parseTimeToSeconds('83')).toBe(83);
    expect(parseTimeToSeconds('83.4')).toBe(83.4);
  });

  it('parses m:ss with dot fraction', () => {
    expect(parseTimeToSeconds('1:23')).toBe(83);
    expect(parseTimeToSeconds('1:23.4')).toBe(83.4);
  });

  it('parses mm:ss:cc (colon fraction)', () => {
    expect(parseTimeToSeconds('1:23:45')).toBe(83.45);
    expect(parseTimeToSeconds('1:23:5')).toBe(83.5);
    expect(parseTimeToSeconds('0:59:99')).toBe(59.99);
    expect(parseTimeToSeconds('1:02:03')).toBe(62.03);
  });

  it('accepts comma decimals and whitespace', () => {
    expect(parseTimeToSeconds('1:23,4')).toBe(83.4);
    expect(parseTimeToSeconds(' 1:23 ')).toBe(83);
  });

  it('rejects empty and malformed input', () => {
    for (const bad of ['', '   ', 'abc', '1:2:3:4', '45:74', '1:60:00', '1.5:20', '-5', null, undefined]) {
      expect(parseTimeToSeconds(bad as string)).toBeNull();
    }
  });
});

describe('formatSeconds', () => {
  it('formats with and without centiseconds', () => {
    expect(formatSeconds(83)).toBe('1:23');
    expect(formatSeconds(83.45)).toBe('1:23.45');
    expect(formatSeconds(5)).toBe('0:05');
    expect(formatSeconds(0)).toBe('0:00');
  });

  it('does not break into hours (minutes may exceed 59)', () => {
    expect(formatSeconds(3723)).toBe('62:03');
    expect(formatSeconds(3723.5)).toBe('62:03.50');
  });

  it('returns empty string for invalid input', () => {
    expect(formatSeconds(null)).toBe('');
    expect(formatSeconds('nope')).toBe('');
    expect(formatSeconds(-1)).toBe('');
  });
});

describe('round trip', () => {
  it('parse then format is stable', () => {
    for (const t of ['1:23.45', '0:05', '62:03.50', '12:00']) {
      const secs = parseTimeToSeconds(t);
      expect(secs).not.toBeNull();
      expect(formatSeconds(secs)).toBe(t);
    }
  });

  it('mm:ss:cc input formats back with a dot', () => {
    expect(formatSeconds(parseTimeToSeconds('1:23:45'))).toBe('1:23.45');
  });
});

describe('formatTimeValue', () => {
  it('formats a stored seconds string', () => {
    expect(formatTimeValue('83.45')).toBe('1:23.45');
    expect(formatTimeValue('')).toBe('');
  });
});
