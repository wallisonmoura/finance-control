import { InvalidWalletBalanceError } from '../errors/invalid-wallet-balance.error';

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
      throw new Error('User id is required.');
    }

    if (this.props.bankBalance < 0) {
      throw new InvalidWalletBalanceError(
        'bankBalance',
        this.props.bankBalance,
      );
    }

    if (this.props.cashBalance < 0) {
      throw new InvalidWalletBalanceError(
        'cashBalance',
        this.props.cashBalance,
      );
    }

    if (this.props.receivableBalance < 0) {
      throw new InvalidWalletBalanceError(
        'receivableBalance',
        this.props.receivableBalance,
      );
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
