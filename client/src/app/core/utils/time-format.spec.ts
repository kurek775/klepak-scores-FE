import { formatSeconds, formatTimeValue, parseTimeToSeconds } from './time-format';

describe('parseTimeToSeconds', () => {
  it('parses plain seconds', () => {
    expect(parseTimeToSeconds('83')).toBe(83);
    expect(parseTimeToSeconds('83.4')).toBe(83.4);
  });

  it('parses m:ss and h:mm:ss', () => {
    expect(parseTimeToSeconds('1:23')).toBe(83);
    expect(parseTimeToSeconds('1:23.4')).toBe(83.4);
    expect(parseTimeToSeconds('1:02:03')).toBe(3723);
    expect(parseTimeToSeconds('1:02:03.5')).toBe(3723.5);
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
    expect(formatSeconds(83.4)).toBe('1:23.40');
    expect(formatSeconds(5)).toBe('0:05');
    expect(formatSeconds(3723)).toBe('1:02:03');
    expect(formatSeconds(3723.5)).toBe('1:02:03.50');
    expect(formatSeconds(0)).toBe('0:00');
  });

  it('returns empty string for invalid input', () => {
    expect(formatSeconds(null)).toBe('');
    expect(formatSeconds('nope')).toBe('');
    expect(formatSeconds(-1)).toBe('');
  });
});

describe('round trip', () => {
  it('parse then format is stable', () => {
    for (const t of ['1:23.40', '0:05', '1:02:03.50', '12:00']) {
      const secs = parseTimeToSeconds(t);
      expect(secs).not.toBeNull();
      expect(formatSeconds(secs)).toBe(t);
    }
  });
});

describe('formatTimeValue', () => {
  it('formats a stored seconds string', () => {
    expect(formatTimeValue('83.4')).toBe('1:23.40');
    expect(formatTimeValue('')).toBe('');
  });
});
