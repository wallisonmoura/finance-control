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
    const email = `wallison-find-email-${Date.now()}@email.com`;

    const createdUser = await prisma.user.create({
      data: {
        name: 'Wallison',
        email,
        passwordHash,
      },
    });

    const user = await repository.findByEmail(email);

    expect(user).not.toBeNull();
    expect(user?.id).toBe(createdUser.id);
    expect(user?.name).toBe('Wallison');
    expect(user?.email.getValue()).toBe(email);
    expect(user?.passwordHash).toBe(passwordHash);
  });

  it('should return null when user is not found by email', async () => {
    const user = await repository.findByEmail('naoexiste@email.com');

    expect(user).toBeNull();
  });

  it('should find a user by id', async () => {
    const passwordHash = await hash('123456', 10);
    const email = `wallison-find-id-${Date.now()}@email.com`;

    const createdUser = await prisma.user.create({
      data: {
        name: 'Wallison',
        email,
        passwordHash,
      },
    });

    const user = await repository.findById(createdUser.id);

    expect(user).not.toBeNull();
    expect(user?.id).toBe(createdUser.id);
    expect(user?.email.getValue()).toBe(email);
  });

  it('should return null when user is not found by id', async () => {
    const user = await repository.findById(
      '11111111-1111-1111-1111-111111111111',
    );

    expect(user).toBeNull();
  });

  it('should create a user', async () => {
    const passwordHash = await hash('123456', 10);
    const email = `wallison-create-${Date.now()}@email.com`;

    const user = await repository.create({
      name: 'Wallison',
      email,
      passwordHash,
    });

    expect(user.id).toEqual(expect.any(String));
    expect(user.name).toBe('Wallison');
    expect(user.email.getValue()).toBe(email);
    expect(user.passwordHash).toBe(passwordHash);

    const persisted = await prisma.user.findUnique({ where: { email } });
    expect(persisted).not.toBeNull();
  });

  it('should update a user name', async () => {
    const passwordHash = await hash('123456', 10);
    const email = `wallison-update-name-${Date.now()}@email.com`;

    const createdUser = await prisma.user.create({
      data: { name: 'Wallison', email, passwordHash },
    });

    const user = await repository.updateName(createdUser.id, 'Wallison Moura');

    expect(user.id).toBe(createdUser.id);
    expect(user.name).toBe('Wallison Moura');

    const persisted = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    expect(persisted?.name).toBe('Wallison Moura');
  });

  it('should update a user password hash', async () => {
    const passwordHash = await hash('123456', 10);
    const newPasswordHash = await hash('654321', 10);
    const email = `wallison-update-password-${Date.now()}@email.com`;

    const createdUser = await prisma.user.create({
      data: { name: 'Wallison', email, passwordHash },
    });

    await repository.updatePassword(createdUser.id, newPasswordHash);

    const persisted = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    expect(persisted?.passwordHash).toBe(newPasswordHash);
  });
});
