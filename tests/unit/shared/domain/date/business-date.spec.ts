import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';

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
