import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: Email.create(raw.email),
      passwordHash: raw.passwordHash,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
