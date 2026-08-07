import { Money } from '@/shared/domain/value-objects/money.vo';
import { InvalidMoneyAmountError } from '@/shared/domain/errors/invalid-money-amount.error';

describe('Money Value Object', () => {
  it('deve criar um Money válido a partir de um valor positivo', () => {
    const money = Money.create(150.5);

    expect(money.getValue()).toBe(150.5);
  });

  it('deve criar um Money válido a partir de zero', () => {
    const money = Money.create(0);

    expect(money.getValue()).toBe(0);
  });

  it('deve lançar InvalidMoneyAmountError quando o valor for negativo', () => {
    expect(() => Money.create(-1)).toThrow(InvalidMoneyAmountError);
  });

  it('deve lançar InvalidMoneyAmountError quando o valor não for finito', () => {
    expect(() => Money.create(Number.POSITIVE_INFINITY)).toThrow(
      InvalidMoneyAmountError,
    );
  });

  it('deve lançar InvalidMoneyAmountError quando o valor for NaN', () => {
    expect(() => Money.create(Number.NaN)).toThrow(InvalidMoneyAmountError);
  });
});
