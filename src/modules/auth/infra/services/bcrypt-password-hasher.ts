import { compare } from 'bcryptjs';
import { PasswordHasher } from '../../domain/services/password-hasher';

export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return compare(plainText, hash);
  }
}
