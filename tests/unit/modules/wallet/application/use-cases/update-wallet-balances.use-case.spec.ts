import { UpdateWalletBalancesUseCase } from '@/modules/wallet/application/use-cases/update-wallet-balances.use-case';
import { InMemoryWalletRepository } from './fakes/in-memory-wallet.repository';
import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';
import { InvalidWalletBalanceError } from '@/modules/wallet/domain/errors/invalid-wallet-balance.error';

describe('UpdateWalletBalancesUseCase', () => {
  let walletRepository: InMemoryWalletRepository;
  let sut: UpdateWalletBalancesUseCase;

  beforeEach(() => {
    walletRepository = new InMemoryWalletRepository();
    sut = new UpdateWalletBalancesUseCase(walletRepository);
  });

  it('should update the wallet balances', async () => {
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
      bankBalance: 1500,
      cashBalance: 250,
      receivableBalance: 350,
    });

    expect(output.id).toBe('wallet-1');
    expect(output.userId).toBe('user-1');
    expect(output.bankBalance).toBe(1500);
    expect(output.cashBalance).toBe(250);
    expect(output.receivableBalance).toBe(350);
    expect(output.walletTotal).toBe(2100);
  });

  it('should throw an error when the wallet does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        bankBalance: 1500,
        cashBalance: 250,
        receivableBalance: 350,
      }),
    ).rejects.toBeInstanceOf(WalletNotFoundError);
  });

  it('should throw an error when any provided balance is invalid', async () => {
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

    await expect(
      sut.execute({
        userId: 'user-1',
        bankBalance: -1,
        cashBalance: 250,
        receivableBalance: 350,
      }),
    ).rejects.toBeInstanceOf(InvalidWalletBalanceError);
  });
});
