import { InvalidMoneyAmountError } from '../errors/invalid-money-amount.error';

export class Money {
  private constructor(private readonly value: number) {}

  public static create(value: number): Money {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new InvalidMoneyAmountError(value);
    }

    if (value < 0) {
      throw new InvalidMoneyAmountError(value);
    }

    return new Money(value);
  }

  public getValue(): number {
    return this.value;
  }
}
