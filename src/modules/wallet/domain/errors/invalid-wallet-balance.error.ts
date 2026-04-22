export class InvalidWalletBalanceError extends Error {
  constructor(
    field: 'bankBalance' | 'cashBalance' | 'receivableBalance',
    value: number,
  ) {
    super(
      `Invalid wallet balance for "${field}": ${value}. Balance must be greater than or equal to zero.`,
    );
    this.name = 'InvalidWalletBalanceError';
  }
}
