import { prisma } from '@/shared/infra/database/prisma/client';

const EXPECTED_CATEGORY_SLUGS = [
  'combustivel',
  'alimentacao',
  'manutencao',
  'transporte',
  'moradia-aluguel',
  'energia',
  'agua',
  'internet-telefone',
  'compras-insumos',
  'taxas-impostos',
  'equipamentos',
  'marketing',
  'saude',
  'parcelas',
  'bebida-alcoolica',
  'bebida-nao-alcoolica',
  'emprestimo-pessoal',
  'assinaturas',
  'seguros',
  'cuidados-pessoais',
  'pet',
  'lazer-entretenimento',
  'vestuario',
  'educacao',
  'presentes',
  'cartao-credito',
  'outros',
];

describe('User auto-provisioning trigger', () => {
  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a default wallet when a user is inserted directly', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Trigger Test User',
        email: `trigger-wallet-${Date.now()}@example.com`,
        passwordHash: 'hashed-password',
      },
    });

    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
    });

    expect(wallets).toHaveLength(1);
    expect(wallets[0]).toMatchObject({
      name: 'Main Wallet',
      isDefault: true,
    });
    expect(Number(wallets[0].bankBalance)).toBe(0);
    expect(Number(wallets[0].cashBalance)).toBe(0);
    expect(Number(wallets[0].receivableBalance)).toBe(0);
  });

  it('should create the 27 default expense categories when a user is inserted directly', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Trigger Test User',
        email: `trigger-categories-${Date.now()}@example.com`,
        passwordHash: 'hashed-password',
      },
    });

    const categories = await prisma.expenseCategory.findMany({
      where: { userId: user.id },
    });

    expect(categories).toHaveLength(27);
    expect(categories.every((category) => category.isActive)).toBe(true);
    expect(categories.map((category) => category.slug).sort()).toEqual(
      [...EXPECTED_CATEGORY_SLUGS].sort(),
    );
  });
});
