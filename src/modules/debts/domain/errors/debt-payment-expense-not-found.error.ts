export class DebtPaymentExpenseNotFoundError extends Error {
  constructor() {
    super('Não foi possível desfazer: a despesa deste pagamento não foi encontrada.');
    this.name = 'DebtPaymentExpenseNotFoundError';
  }
}
