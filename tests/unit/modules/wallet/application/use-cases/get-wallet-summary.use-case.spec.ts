import { GetWalletSummaryUseCase } from '@/modules/wallet/application/use-cases/get-wallet-summary.use-case';
import { InMemoryWalletRepository } from './fakes/in-memory-wallet.repository';
import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

describe('GetWalletSummaryUseCase', () => {
  let walletRepository: InMemoryWalletRepository;
  let sut: GetWalletSummaryUseCase;

  beforeEach(() => {
    walletRepository = new InMemoryWalletRepository();
    sut = new GetWalletSummaryUseCase(walletRepository);
  });

  it('deve retornar o summary da wallet', async () => {
    const wallet = Wallet.create({
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      createdAt: new Date('2026-04-20T00:00:00.000Z'),
      updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    });

    await walletRepository.update(wallet);

    const output = await sut.execute({
      userId: 'user-1',
    });

    expect(output).toEqual({
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: 300,
        walletTotal: 1500,
        createdAt: new Date('2026-04-20T00:00:00.000Z'),
        updatedAt: new Date('2026-04-20T00:00:00.000Z'),
      },
    });
  });

  it('deve lançar erro quando a wallet não existir', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(WalletNotFoundError);
  });
});
