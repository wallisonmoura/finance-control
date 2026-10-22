export class NextOccurrenceAlreadyPaidError extends Error {
  constructor() {
    super('Desfaça primeiro o pagamento da ocorrência seguinte.');
    this.name = 'NextOccurrenceAlreadyPaidError';
  }
}
