import { withTransaction } from '@/shared/infra/database/prisma/with-transaction';

import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case';
import { PrismaPasswordResetTokenRepository } from '../repositories/prisma-password-reset-token.repository';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { BcryptPasswordHasherAdapter } from '../services/bcrypt-password-hasher.adapter';
import { makeTokenService } from './make-token-service';

// Transactional: the new password and dropping the pending reset links are
// saved together, so a failure never leaves the password changed with an
// error shown to the user.
export function makeChangePasswordUseCase(): Pick<ChangePasswordUseCase, 'execute'> {
  return {
    execute: (input) =>
      withTransaction((tx) =>
        new ChangePasswordUseCase(
          new PrismaUserRepository(tx),
          new BcryptPasswordHasherAdapter(),
          new PrismaPasswordResetTokenRepository(tx),
          makeTokenService(),
        ).execute(input),
      ),
  };
}
