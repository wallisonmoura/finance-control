import { buildInstallmentSchedule } from '@/modules/debts/domain/services/build-installment-schedule';
import { InvalidInstallmentCountError } from '@/modules/debts/domain/errors/invalid-installment-count.error';

describe('buildInstallmentSchedule', () => {
  it('should split an amount that divides evenly across installments', () => {
    const schedule = buildInstallmentSchedule(1200, 4, new Date(Date.UTC(2026, 7, 29)));

    expect(schedule).toHaveLength(4);
    expect(schedule.map((entry) => entry.amount)).toEqual([300, 300, 300, 300]);
  });

  it('should put the rounding remainder on the last installment', () => {
    const schedule = buildInstallmentSchedule(1000, 3, new Date(Date.UTC(2026, 7, 29)));

    expect(schedule.map((entry) => entry.amount)).toEqual([333.33, 333.33, 333.34]);

    const sum = schedule.reduce((total, entry) => total + entry.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(1000);
  });

  it('should accept the minimum of 2 installments', () => {
    const schedule = buildInstallmentSchedule(100, 2, new Date(Date.UTC(2026, 7, 29)));

    expect(schedule).toHaveLength(2);
  });

  it('should accept the maximum of 12 installments', () => {
    const schedule = buildInstallmentSchedule(1200, 12, new Date(Date.UTC(2026, 7, 29)));

    expect(schedule).toHaveLength(12);
    expect(schedule.map((entry) => entry.amount)).toEqual(Array(12).fill(100));
  });

  it('should throw InvalidInstallmentCountError when installmentCount is below 2', () => {
    expect(() =>
      buildInstallmentSchedule(100, 1, new Date(Date.UTC(2026, 7, 29))),
    ).toThrow(InvalidInstallmentCountError);
  });

  it('should throw InvalidInstallmentCountError when installmentCount is above 12', () => {
    expect(() =>
      buildInstallmentSchedule(100, 13, new Date(Date.UTC(2026, 7, 29))),
    ).toThrow(InvalidInstallmentCountError);
  });

  it('should throw InvalidInstallmentCountError when installmentCount is not an integer', () => {
    expect(() =>
      buildInstallmentSchedule(100, 2.5, new Date(Date.UTC(2026, 7, 29))),
    ).toThrow(InvalidInstallmentCountError);
  });

  it('should space due dates one month apart, using the first due date as the day of month', () => {
    const schedule = buildInstallmentSchedule(400, 4, new Date(Date.UTC(2026, 7, 29)));

    expect(schedule.map((entry) => entry.dueDate.toISOString().slice(0, 10))).toEqual([
      '2026-08-29',
      '2026-09-29',
      '2026-10-29',
      '2026-11-29',
    ]);
  });

  it('should clamp the day to the last day of shorter months', () => {
    const schedule = buildInstallmentSchedule(300, 3, new Date(Date.UTC(2026, 0, 31)));

    expect(schedule.map((entry) => entry.dueDate.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
    ]);
  });

  it('should roll over the year correctly across 12 installments', () => {
    const schedule = buildInstallmentSchedule(1200, 12, new Date(Date.UTC(2026, 10, 15)));

    expect(schedule[0].dueDate.toISOString().slice(0, 10)).toBe('2026-11-15');
    expect(schedule[11].dueDate.toISOString().slice(0, 10)).toBe('2027-10-15');
  });
});
