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

  it('should return the balance summary with walletTotal, pendingDebts and finalBalance', async () => {
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

  it('should round walletTotal and finalBalance to cents', async () => {
    // Plain arithmetic gives 0.30000000000000004 and 0.20000000000000004.
    balanceSummaryRepository.setBalanceSummary('user-1', {
      bankBalance: 0.1,
      cashBalance: 0.2,
      receivableBalance: 0,
      pendingDebts: 0.1,
    });

    const output = await sut.execute({ userId: 'user-1' });

    expect(output.wallet.walletTotal).toBe(0.3);
    expect(output.finalBalance).toBe(0.2);
  });

  it('should allow a negative finalBalance when pendingDebts is greater than walletTotal', async () => {
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

  it('should return pendingDebts zero when there are no pending debts', async () => {
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

  it('should throw WalletNotFoundError when there is no wallet for the user', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(WalletNotFoundError);
  });

  it('should include the userId in the WalletNotFoundError message', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toThrow('Wallet não encontrada para o usuário "user-1".');
  });
});
