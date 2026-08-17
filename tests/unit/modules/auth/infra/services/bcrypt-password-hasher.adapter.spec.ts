import { compare } from 'bcryptjs';

import { BcryptPasswordHasher } from '@/modules/auth/infra/services/bcrypt-password-hasher.adapter';

describe('BcryptPasswordHasher', () => {
  it('should hash a plain text password', async () => {
    const sut = new BcryptPasswordHasher();

    const hash = await sut.hash('123456');

    expect(hash).not.toBe('123456');
    expect(await compare('123456', hash)).toBe(true);
  });
});
