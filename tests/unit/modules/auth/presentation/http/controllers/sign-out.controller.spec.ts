import { SignOutUseCase } from '@/modules/auth/application/use-cases/sign-out.use-case';
import { SignOutController } from '@/modules/auth/presentation/http/controllers/sign-out.controller';

describe('SignOutController', () => {
  let useCase: jest.Mocked<SignOutUseCase>;
  let controller: SignOutController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SignOutUseCase>;

    controller = new SignOutController(useCase);
  });

  it('should call SignOutUseCase', async () => {
    await controller.handle();

    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 200 with a success message', async () => {
    const response = await controller.handle();

    expect(response).toEqual({
      statusCode: 200,
      body: { message: 'Signed out successfully' },
    });
  });
});
