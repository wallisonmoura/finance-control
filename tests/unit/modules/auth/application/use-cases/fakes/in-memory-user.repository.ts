import { User } from '@/modules/auth/domain/entities/user.entity';
import { Email } from '@/modules/auth/domain/value-objects/email.vo';
import {
  CreateUserData,
  UserRepository,
} from '@/modules/auth/domain/repositories/user.repository';

export class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[] = []) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email.getValue() === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = User.create({
      id: `user-${this.users.length + 1}`,
      name: data.name,
      email: Email.create(data.email),
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.users.push(user);

    return user;
  }
}
