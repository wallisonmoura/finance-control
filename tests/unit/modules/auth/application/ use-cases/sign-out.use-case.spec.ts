import { SignOutUseCase } from '@/modules/auth/application/use-cases/sign-out.use-case';

describe('SignOutUseCase', () => {
  it('should complete without throwing', async () => {
    const useCase = new SignOutUseCase();

    await expect(useCase.execute()).resolves.toBeUndefined();
  });
});
