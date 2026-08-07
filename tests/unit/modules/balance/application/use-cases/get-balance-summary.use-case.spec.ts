import { GetBalanceSummaryUseCase } from '@/modules/balance/application/use-cases/get-balance-summary.use-case';
import { InMemoryBalanceSummaryRepository } from './fakes/in-memory-balance-summary.repository';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

describe('GetBalanceSummaryUseCase', () => {
  let balanceSummaryRepository: InMemoryBalanceSummaryRepository;
  let sut: GetBalanceSummaryUseCase;

  beforeEach(() => {
    balanceSummaryRepository = new InMemoryBalanceSummaryRepository();
    sut = new GetBalanceSummaryUseCase(balanceSummaryRepository);
  });

  it('deve retornar o resumo de saldo com walletTotal, pendingDebts e finalBalance', async () => {
    balanceSummaryRepository.setBalanceSummary('user-1', {
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      pendingDebts: 400,
    });

    const output = await sut.execute({
      userId: 'user-1',
    });

    expect(output).toEqual({
      wallet: {
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: 300,
        walletTotal: 1500,
      },
      debts: {
        pendingDebts: 400,
      },
      finalBalance: 1100,
    });
  });

  it('deve permitir finalBalance negativo quando pendingDebts for maior que walletTotal', async () => {
    balanceSummaryRepository.setBalanceSummary('user-1', {
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 50,
      pendingDebts: 500,
    });

    const output = await sut.execute({
      userId: 'user-1',
    });

    expect(output.wallet.walletTotal).toBe(200);
    expect(output.debts.pendingDebts).toBe(500);
    expect(output.finalBalance).toBe(-300);
  });

  it('deve retornar pendingDebts zero quando não houver dívidas pendentes', async () => {
    balanceSummaryRepository.setBalanceSummary('user-1', {
      bankBalance: 1000,
      cashBalance: 500,
      receivableBalance: 250,
      pendingDebts: 0,
    });

    const output = await sut.execute({
      userId: 'user-1',
    });

    expect(output.wallet.walletTotal).toBe(1750);
    expect(output.debts.pendingDebts).toBe(0);
    expect(output.finalBalance).toBe(1750);
  });

  it('deve lançar WalletNotFoundError quando não existir wallet para o usuário', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(WalletNotFoundError);
  });

  it('deve incluir o userId na mensagem de WalletNotFoundError', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toThrow('Wallet não encontrada para o usuário "user-1".');
  });
});
