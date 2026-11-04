import { compare, hash } from 'bcryptjs';
import { PasswordHasherPort } from '../../domain/services/password-hasher.port';

const SALT_ROUNDS = 10;

export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  async compare(plainText: string, passwordHash: string): Promise<boolean> {
    return compare(plainText, passwordHash);
  }

  async hash(plainText: string): Promise<string> {
    return hash(plainText, SALT_ROUNDS);
  }
}
