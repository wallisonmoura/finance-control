import { prisma } from '@/shared/infra/database/prisma/client';
import { User } from '../../domain/entities/user.entity';
import {
  CreateUserData,
  UserRepository,
} from '../../domain/repositories/user.repository';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return PrismaUserMapper.toDomain(user);
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });

    return PrismaUserMapper.toDomain(user);
  }
}
