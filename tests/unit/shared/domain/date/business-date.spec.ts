import { getCurrentBusinessDateValue, isAfterBusinessToday } from '@/shared/domain/date/business-date';

/**
 * Simulates a process whose local Date getters read as if it were in UTC
 * (the worst case: a production server) — used to prove that business-date
 * resolution (Intl with an explicit timeZone) ignores those getters and
 * resolves the correct calendar day regardless of the process's own
 * timezone.
 */
function mockDateGettersAsIfUtc(
  year: number,
  monthIndex: number,
  day: number,
): void {
  jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(year);
  jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(monthIndex);
  jest.spyOn(Date.prototype, 'getDate').mockReturnValue(day);
}

describe('getCurrentBusinessDateValue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should resolve the product timezone's (America/Sao_Paulo) calendar day, not the process's", () => {
    // 22:38 in São Paulo (07/31) is already 01:38 UTC the next day (08/01).
    // Simulates a process whose local getters read in UTC (e.g. a
    // production server) — the function must ignore those getters and use
    // Intl with an explicit timeZone instead.
    const instant = new Date('2026-07-31T22:38:00-03:00');
    mockDateGettersAsIfUtc(2026, 7, 1); // "08/01" (August, 0-based)

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-07-31');
  });

  it('should resolve the correct year at year-end, even when the process would already read the next year', () => {
    // 23:10 in São Paulo (12/31/2026) is already 02:10 UTC on 01/01/2027 —
    // the most severe variant of this bug, which would get month and year
    // wrong together.
    const instant = new Date('2026-12-31T23:10:00-03:00');
    mockDateGettersAsIfUtc(2027, 0, 1); // "01/01/2027" (January, 0-based)

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-12-31');
  });

  it('should use the current date when no date is passed', () => {
    const now = new Date();
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    expect(getCurrentBusinessDateValue()).toBe(expected);
  });
});

describe('isAfterBusinessToday', () => {
  // 23h30 on 30/10 in Brazil, already 31/10 in UTC.
  const lateEvening = new Date('2026-10-31T02:30:00.000Z');

  it('should treat a date after the Brazilian today as future, even if UTC already reached it', () => {
    expect(isAfterBusinessToday(new Date('2026-10-31'), lateEvening)).toBe(true);
  });

  it('should accept today and past dates', () => {
    expect(isAfterBusinessToday(new Date('2026-10-30'), lateEvening)).toBe(false);
    expect(isAfterBusinessToday(new Date('2026-01-15'), lateEvening)).toBe(false);
  });

  it('should leave an invalid date to the entity validation instead of throwing', () => {
    expect(isAfterBusinessToday(new Date('invalid'), lateEvening)).toBe(false);
  });
});
