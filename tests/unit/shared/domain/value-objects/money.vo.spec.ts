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
});
