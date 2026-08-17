import { PasswordHasher } from '@/modules/auth/domain/services/password-hasher.port';

export class FakePasswordHasher implements PasswordHasher {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return plainText === hash;
  }

  async hash(plainText: string): Promise<string> {
    return `hashed-${plainText}`;
  }
}
