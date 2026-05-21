export class InvalidWalletBalanceError extends Error {
  constructor(
    field: 'bankBalance' | 'cashBalance' | 'receivableBalance',
    value: number,
  ) {
    super(
      `Saldo inválido para "${field}": ${value}. O saldo deve ser maior ou igual a zero.`,
    );
    this.name = 'InvalidWalletBalanceError';
  }
}
