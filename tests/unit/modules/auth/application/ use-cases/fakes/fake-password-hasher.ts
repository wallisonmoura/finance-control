import { PasswordHasher } from '@/modules/auth/domain/services/password-hasher';

export class FakePasswordHasher implements PasswordHasher {
  async compare(plainText: string, hash: string): Promise<boolean> {
    return plainText === hash;
  }
}
