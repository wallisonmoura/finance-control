import { PrismaClient } from '@prisma/client';

import { prisma } from '@/shared/infra/database/prisma/client';
import { PrismaTransactionClient } from '@/shared/infra/database/prisma/prisma-transaction-client';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { orNotFound } from '@/shared/infra/database/prisma/or-not-found';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly client: PrismaClient | PrismaTransactionClient = prisma) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.client.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });

    return PrismaUserMapper.toDomain(user);
  }

  async updateName(id: string, name: string): Promise<User> {
    const user = await orNotFound(
      this.client.user.update({
        where: { id },
        data: { name },
      }),
      () => new UserNotFoundError(id),
    );

    return PrismaUserMapper.toDomain(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await orNotFound(
      this.client.user.update({
        where: { id },
        data: { passwordHash },
      }),
      () => new UserNotFoundError(id),
    );
  }
}
