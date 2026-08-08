import { GetWalletUseCase } from '@/modules/wallet/application/use-cases/get-wallet.use-case';
import { InMemoryWalletRepository } from './fakes/in-memory-wallet.repository';
import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';

describe('GetWalletUseCase', () => {
  let walletRepository: InMemoryWalletRepository;
  let sut: GetWalletUseCase;

  beforeEach(() => {
    walletRepository = new InMemoryWalletRepository();
    sut = new GetWalletUseCase(walletRepository);
  });

  it('should return the user wallet', async () => {
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
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      walletTotal: 1500,
      createdAt: new Date('2026-04-20T00:00:00.000Z'),
      updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    });
  });

  it('should throw an error when the wallet does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
      }),
    ).rejects.toBeInstanceOf(WalletNotFoundError);
  });
});
