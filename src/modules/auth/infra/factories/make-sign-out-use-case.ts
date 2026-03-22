import { SignOutUseCase } from '../../application/use-cases/sign-out.use-case';

export function makeSignOutUseCase(): SignOutUseCase {
  return new SignOutUseCase();
}
