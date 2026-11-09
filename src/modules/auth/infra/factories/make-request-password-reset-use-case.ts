import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { resolveAppBaseUrl } from '../mail/resolve-app-base-url';
import { PrismaPasswordResetTokenRepository } from '../repositories/prisma-password-reset-token.repository';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { CryptoResetTokenAdapter } from '../services/crypto-reset-token.adapter';
import { makePasswordResetMailer } from './make-password-reset-mailer';

export function makeRequestPasswordResetUseCase(): RequestPasswordResetUseCase {
  return new RequestPasswordResetUseCase(
    new PrismaUserRepository(),
    new PrismaPasswordResetTokenRepository(),
    new CryptoResetTokenAdapter(),
    makePasswordResetMailer(),
    resolveAppBaseUrl(process.env),
  );
}
