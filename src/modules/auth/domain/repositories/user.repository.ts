import { User } from '../entities/user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  updateName(id: string, name: string): Promise<User>;
  // Saves the new hash together with the change moment (see
  // User.acceptsSessionIssuedAt): every password change signs out older logins.
  updatePassword(id: string, passwordHash: string, changedAt: Date): Promise<void>;
}
