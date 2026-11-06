import { InvalidMoneyAmountError } from '../errors/invalid-money-amount.error';

// The largest amount DECIMAL(14,2) holds.
const MAX_AMOUNT = 999999999999.99;

// Rounds through cents instead of checking value * 100 directly: 19.99 * 100
// is 1998.9999999999998, but the rounded value divided back is 19.99 again.
function hasAtMostTwoDecimalPlaces(value: number): boolean {
  return Math.round(value * 100) / 100 === value;
}

export class Money {
  private constructor(private readonly value: number) {}

  public static create(value: number): Money {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new InvalidMoneyAmountError(value);
    }

    if (value < 0 || value > MAX_AMOUNT || !hasAtMostTwoDecimalPlaces(value)) {
      throw new InvalidMoneyAmountError(value);
    }

    return new Money(value);
  }

  public getValue(): number {
    return this.value;
  }
}
