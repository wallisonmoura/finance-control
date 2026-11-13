import { ResolveSessionUseCase } from '../../application/use-cases/resolve-session.use-case';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { makeTokenService } from './make-token-service';

export function makeResolveSessionUseCase(): ResolveSessionUseCase {
  return new ResolveSessionUseCase(makeTokenService(), new PrismaUserRepository());
}
