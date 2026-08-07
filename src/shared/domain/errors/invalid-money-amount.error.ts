export class InvalidMoneyAmountError extends Error {
  constructor(value: number) {
    super(`Valor monetário inválido: ${value}. O valor deve ser um número finito maior ou igual a zero.`);
    this.name = 'InvalidMoneyAmountError';
  }
}
