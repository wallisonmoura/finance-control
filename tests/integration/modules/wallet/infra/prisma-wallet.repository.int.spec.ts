import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { WalletNotFoundError } from '@/modules/wallet/domain/errors/wallet-not-found.error';
import { PrismaWalletRepository } from '@/modules/wallet/infra/repositories/prisma-wallet.repository';
import { prisma } from '@/shared/infra/database/prisma/client';
import { createTestUser } from '../../../../helpers/database/create-test-user';
import { createTestWallet } from '../../../../helpers/database/create-test-wallet';

describe('PrismaWalletRepository', () => {
  let repository: PrismaWalletRepository;

  beforeAll(async () => {
    repository = new PrismaWalletRepository();
  });

  beforeEach(async () => {
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should return the user wallet when searching by userId', async () => {
    const user = await createTestUser();

    await createTestWallet({
      userId: user.id,
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 25,
    });

    const wallet = await repository.findByUserId(user.id);

    expect(wallet).not.toBeNull();
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet?.userId).toBe(user.id);
    expect(wallet?.bankBalance).toBe(100);
    expect(wallet?.cashBalance).toBe(50);
    expect(wallet?.receivableBalance).toBe(25);
    expect(wallet?.getWalletTotal()).toBe(175);
  });

  it('should return null when the user has no wallet', async () => {
    const user = await createTestUser();

    const wallet = await repository.findByUserId(user.id);

    expect(wallet).toBeNull();
  });

  describe('writes that find nothing', () => {
    async function readWallet(userId: string) {
      const persisted = await createTestWallet({ userId, bankBalance: 10 });

      return { persisted, wallet: (await repository.findByUserId(userId))! };
    }

    it('should throw not found when the wallet was deleted after being read', async () => {
      const user = await createTestUser();
      const { persisted, wallet } = await readWallet(user.id);
      await prisma.wallet.delete({ where: { id: persisted.id } });

      await expect(repository.update(wallet)).rejects.toBeInstanceOf(WalletNotFoundError);
    });

    it("should not update another user's wallet", async () => {
      const user = await createTestUser();
      const otherUser = await createTestUser();
      const { persisted, wallet } = await readWallet(user.id);
      const foreign = Wallet.create({ ...wallet.toJSON(), userId: otherUser.id, bankBalance: 999 });

      await expect(repository.update(foreign)).rejects.toBeInstanceOf(WalletNotFoundError);

      const stored = await prisma.wallet.findUnique({ where: { id: persisted.id } });
      expect(Number(stored?.bankBalance)).toBe(10);
    });
  });

  it('should update the wallet balances', async () => {
    const user = await createTestUser();

    const persistedWallet = await createTestWallet({
      userId: user.id,
      bankBalance: 10,
      cashBalance: 20,
      receivableBalance: 30,
    });

    const wallet = Wallet.create({
      id: persistedWallet.id,
      userId: persistedWallet.userId,
      bankBalance: Number(persistedWallet.bankBalance),
      cashBalance: Number(persistedWallet.cashBalance),
      receivableBalance: Number(persistedWallet.receivableBalance),
      createdAt: persistedWallet.createdAt,
      updatedAt: persistedWallet.updatedAt,
    });

    const updatedWallet = wallet.update({
      bankBalance: 100,
      cashBalance: 200,
      receivableBalance: 300,
    });

    const result = await repository.update(updatedWallet);

    expect(result).toBeInstanceOf(Wallet);
    expect(result.id).toBe(persistedWallet.id);
    expect(result.userId).toBe(user.id);
    expect(result.bankBalance).toBe(100);
    expect(result.cashBalance).toBe(200);
    expect(result.receivableBalance).toBe(300);
    expect(result.getWalletTotal()).toBe(600);

    const walletInDatabase = await prisma.wallet.findUnique({
      where: {
        id: persistedWallet.id,
      },
    });

    expect(Number(walletInDatabase?.bankBalance)).toBe(100);
    expect(Number(walletInDatabase?.cashBalance)).toBe(200);
    expect(Number(walletInDatabase?.receivableBalance)).toBe(300);
  });
});
