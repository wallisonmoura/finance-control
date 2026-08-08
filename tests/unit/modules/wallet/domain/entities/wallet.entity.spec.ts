import { Wallet } from '@/modules/wallet/domain/entities/wallet.entity';
import { InvalidWalletBalanceError } from '@/modules/wallet/domain/errors/invalid-wallet-balance.error';

describe('Wallet entity', () => {
  const makeWallet = () =>
    Wallet.create({
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      createdAt: new Date('2026-04-20T00:00:00.000Z'),
      updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    });

  it('should create a valid wallet', () => {
    const wallet = makeWallet();

    expect(wallet.id).toBe('wallet-1');
    expect(wallet.userId).toBe('user-1');
    expect(wallet.bankBalance).toBe(1000);
    expect(wallet.cashBalance).toBe(200);
    expect(wallet.receivableBalance).toBe(300);
    expect(wallet.createdAt).toEqual(new Date('2026-04-20T00:00:00.000Z'));
    expect(wallet.updatedAt).toEqual(new Date('2026-04-20T00:00:00.000Z'));
  });

  it('should correctly calculate the walletTotal', () => {
    const wallet = makeWallet();

    expect(wallet.getWalletTotal()).toBe(1500);
  });

  it('should throw an error when bankBalance is less than zero', () => {
    expect(() =>
      Wallet.create({
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: -1,
        cashBalance: 200,
        receivableBalance: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(InvalidWalletBalanceError);
  });

  it('should throw an error when cashBalance is less than zero', () => {
    expect(() =>
      Wallet.create({
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: 1000,
        cashBalance: -1,
        receivableBalance: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(InvalidWalletBalanceError);
  });

  it('should throw an error when receivableBalance is less than zero', () => {
    expect(() =>
      Wallet.create({
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(InvalidWalletBalanceError);
  });

  it('should throw an error when bankBalance is not a finite number', () => {
    expect(() =>
      Wallet.create({
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: Number.NaN,
        cashBalance: 200,
        receivableBalance: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow(InvalidWalletBalanceError);
  });

  it('should throw an error when userId is empty', () => {
    expect(() =>
      Wallet.create({
        id: 'wallet-1',
        userId: '   ',
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: 300,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should update the wallet balances', () => {
    const wallet = makeWallet();

    const updatedWallet = wallet.update({
      bankBalance: 1500,
      cashBalance: 250,
      receivableBalance: 350,
    });

    expect(updatedWallet.bankBalance).toBe(1500);
    expect(updatedWallet.cashBalance).toBe(250);
    expect(updatedWallet.receivableBalance).toBe(350);
    expect(updatedWallet.getWalletTotal()).toBe(2100);
  });

  it('should keep the previous values when update receives only part of the fields', () => {
    const wallet = makeWallet();

    const updatedWallet = wallet.update({
      cashBalance: 500,
    });

    expect(updatedWallet.bankBalance).toBe(1000);
    expect(updatedWallet.cashBalance).toBe(500);
    expect(updatedWallet.receivableBalance).toBe(300);
    expect(updatedWallet.getWalletTotal()).toBe(1800);
  });

  it('should return a new instance when updating the wallet', () => {
    const wallet = makeWallet();

    const updatedWallet = wallet.update({
      bankBalance: 1200,
    });

    expect(updatedWallet).not.toBe(wallet);
    expect(updatedWallet.updatedAt.getTime()).toBeGreaterThanOrEqual(
      wallet.updatedAt.getTime(),
    );
  });

  it('should return the base data in toJSON', () => {
    const wallet = makeWallet();

    expect(wallet.toJSON()).toEqual({
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 300,
      createdAt: new Date('2026-04-20T00:00:00.000Z'),
      updatedAt: new Date('2026-04-20T00:00:00.000Z'),
    });
  });
});
