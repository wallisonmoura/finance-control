import { Money } from '@/shared/domain/value-objects/money.vo';
import { InvalidMoneyAmountError } from '@/shared/domain/errors/invalid-money-amount.error';

describe('Money Value Object', () => {
  it('should create a valid Money from a positive value', () => {
    const money = Money.create(150.5);

    expect(money.getValue()).toBe(150.5);
  });

  it('should create a valid Money from zero', () => {
    const money = Money.create(0);

    expect(money.getValue()).toBe(0);
  });

  it('should throw InvalidMoneyAmountError when the value is negative', () => {
    expect(() => Money.create(-1)).toThrow(InvalidMoneyAmountError);
  });

  it('should throw InvalidMoneyAmountError when the value is not finite', () => {
    expect(() => Money.create(Number.POSITIVE_INFINITY)).toThrow(
      InvalidMoneyAmountError,
    );
  });

  it('should throw InvalidMoneyAmountError when the value is NaN', () => {
    expect(() => Money.create(Number.NaN)).toThrow(InvalidMoneyAmountError);
  });

  // Amounts persist as DECIMAL(14,2): a value with more precision would be
  // silently rounded by the database.
  it.each([10.555, 0.001, 19.999])('should refuse %d, with more than 2 decimal places', (value) => {
    expect(() => Money.create(value)).toThrow(InvalidMoneyAmountError);
  });

  it('should refuse a value above the ceiling', () => {
    expect(() => Money.create(1_000_000_000_000)).toThrow(InvalidMoneyAmountError);
  });

  // These have no exact binary form (19.99 * 100 is 1998.9999999999998).
  it.each([0.07, 19.99, 1.1, 4623.47, 999999999999.99])('should accept %d', (value) => {
    expect(Money.create(value).getValue()).toBe(value);
  });
});
