import { hash } from 'bcryptjs';

import { PrismaUserRepository } from '@/modules/auth/infra/repositories/prisma-user.repository';
import { prisma } from '@/shared/infra/database/prisma/client';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    repository = new PrismaUserRepository();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should find a user by email', async () => {
    const passwordHash = await hash('123456', 10);

    const createdUser = await prisma.user.create({
      data: {
        name: 'Wallison',
        email: 'wallison@email.com',
        passwordHash,
      },
    });

    const user = await repository.findByEmail('wallison@email.com');

    expect(user).not.toBeNull();
    expect(user?.id).toBe(createdUser.id);
    expect(user?.name).toBe('Wallison');
    expect(user?.email.getValue()).toBe('wallison@email.com');
    expect(user?.passwordHash).toBe(passwordHash);
  });

  it('should return null when user is not found by email', async () => {
    const user = await repository.findByEmail('naoexiste@email.com');

    expect(user).toBeNull();
  });

  it('should find a user by id', async () => {
    const passwordHash = await hash('123456', 10);

    const createdUser = await prisma.user.create({
      data: {
        name: 'Wallison',
        email: 'wallison@email.com',
        passwordHash,
      },
    });

    const user = await repository.findById(createdUser.id);

    expect(user).not.toBeNull();
    expect(user?.id).toBe(createdUser.id);
    expect(user?.email.getValue()).toBe('wallison@email.com');
  });

  it('should return null when user is not found by id', async () => {
    const user = await repository.findById(
      '11111111-1111-1111-1111-111111111111',
    );

    expect(user).toBeNull();
  });
});
