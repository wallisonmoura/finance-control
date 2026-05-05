import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
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

  it('deve retornar a wallet do usuário ao buscar por userId', async () => {
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

  it('deve retornar null quando o usuário não possuir wallet', async () => {
    const user = await createTestUser();

    const wallet = await repository.findByUserId(user.id);

    expect(wallet).toBeNull();
  });

  it('deve atualizar os saldos da wallet', async () => {
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
