import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';

import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { PrismaPasswordResetTokenRepository } from '../repositories/prisma-password-reset-token.repository';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '../services/bcrypt-password-hasher.adapter';
import { CryptoResetTokenAdapter } from '../services/crypto-reset-token.adapter';

// Transactional: if changing the password fails, the link stays usable.
export function makeResetPasswordUseCase(): Pick<ResetPasswordUseCase, 'execute'> {
  return {
    execute: (input) =>
      withTransaction((tx) =>
        new ResetPasswordUseCase(
          new PrismaUserRepository(tx),
          new PrismaPasswordResetTokenRepository(tx),
          new CryptoResetTokenAdapter(),
          new BcryptPasswordHasherAdapter(),
        ).execute(input),
      ),
  };
}
