export class FinancialEntryLinkedToDebtError extends Error {
  constructor() {
    super('Lançamento vinculado ao pagamento de dívida não pode ser alterado.');
    this.name = 'FinancialEntryLinkedToDebtError';
  }
}
