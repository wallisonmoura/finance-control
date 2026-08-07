import { Money } from '@/shared/domain/value-objects/money.vo';
import { InvalidWalletBalanceError } from '../errors/invalid-wallet-balance.error';
import { InvalidWalletUserIdError } from '../errors/invalid-wallet-user-id.error';

type WalletBalanceField = 'bankBalance' | 'cashBalance' | 'receivableBalance';

export interface WalletProps {
  id: string;
  userId: string;
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet {
  private constructor(private readonly props: WalletProps) {
    this.validate();
  }

  static create(props: WalletProps): Wallet {
    return new Wallet(props);
  }

  private validate(): void {
    if (!this.props.userId.trim()) {
      throw new InvalidWalletUserIdError();
    }

    this.validateBalance('bankBalance', this.props.bankBalance);
    this.validateBalance('cashBalance', this.props.cashBalance);
    this.validateBalance('receivableBalance', this.props.receivableBalance);
  }

  private validateBalance(field: WalletBalanceField, value: number): void {
    try {
      Money.create(value);
    } catch {
      throw new InvalidWalletBalanceError(field, value);
    }
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get bankBalance(): number {
    return this.props.bankBalance;
  }

  get cashBalance(): number {
    return this.props.cashBalance;
  }

  get receivableBalance(): number {
    return this.props.receivableBalance;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  getWalletTotal(): number {
    return (
      this.props.bankBalance +
      this.props.cashBalance +
      this.props.receivableBalance
    );
  }

  update(data: {
    bankBalance?: number;
    cashBalance?: number;
    receivableBalance?: number;
  }): Wallet {
    return Wallet.create({
      ...this.props,
      bankBalance: data.bankBalance ?? this.props.bankBalance,
      cashBalance: data.cashBalance ?? this.props.cashBalance,
      receivableBalance: data.receivableBalance ?? this.props.receivableBalance,
      updatedAt: new Date(),
    });
  }

  toJSON(): WalletProps {
    return {
      ...this.props,
    };
  }
}
