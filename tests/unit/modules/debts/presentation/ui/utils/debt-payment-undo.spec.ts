import { canUndoDebtPayment } from '@/modules/debts/presentation/ui/utils/debt-payment-undo';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

const recordedAt = Date.parse('2026-10-21T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

const paidDebt: DebtUi = {
  id: 'debt-id',
  userId: 'user-id',
  description: 'Internet',
  amount: 100,
  dueDate: '2026-10-20T00:00:00.000Z',
  type: 'ONE_TIME',
  status: 'PAID',
  notes: null,
  paidAt: '2026-10-20T00:00:00.000Z',
  paymentSource: 'BANK',
  paymentRecordedAt: new Date(recordedAt).toISOString(),
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-21T12:00:00.000Z',
};

describe('canUndoDebtPayment', () => {
  it.each([
    ['23h59 after', DAY_MS - 60 * 1000, true],
    ['exactly 24h after', DAY_MS, true],
    ['24h01 after', DAY_MS + 60 * 1000, false],
  ])('should decide %s the payment was recorded', (_label, offset, expected) => {
    expect(canUndoDebtPayment(paidDebt, recordedAt + offset)).toBe(expected);
  });

  it('should not allow undo without a recorded payment time', () => {
    expect(canUndoDebtPayment({ ...paidDebt, paymentRecordedAt: null }, recordedAt)).toBe(false);
    expect(canUndoDebtPayment({ ...paidDebt, paymentRecordedAt: undefined }, recordedAt)).toBe(false);
  });

  it('should not allow undo for a pending debt', () => {
    expect(canUndoDebtPayment({ ...paidDebt, status: 'PENDING' }, recordedAt)).toBe(false);
  });
});
