import { ChangePasswordUseCase } from '@/modules/auth/application/use-cases/change-password.use-case';
import { ChangePasswordController } from '@/modules/auth/presentation/http/controllers/change-password.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';
import { ZodError } from 'zod';

describe('ChangePasswordController', () => {
  let useCase: jest.Mocked<ChangePasswordUseCase>;
  let controller: ChangePasswordController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ChangePasswordUseCase>;

    controller = new ChangePasswordController(useCase);
  });

  it('should call ChangePasswordUseCase with the correct input', async () => {
    useCase.execute.mockResolvedValue(undefined);

    const request: HttpRequest = {
      userId: 'user-1',
      body: {
        currentPassword: 'current-password',
        newPassword: 'new-password-123',
      },
    };

    await controller.handle(request);

    expect(useCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
    });
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 200 with a success message', async () => {
    useCase.execute.mockResolvedValue(undefined);

    const response = await controller.handle({
      userId: 'user-1',
      body: {
        currentPassword: 'current-password',
        newPassword: 'new-password-123',
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: { message: 'Senha alterada com sucesso.' },
    });
  });

  it('should throw an error when the payload is invalid', async () => {
    const request: HttpRequest = {
      userId: 'user-1',
      body: { currentPassword: '', newPassword: '123' },
    };

    await expect(controller.handle(request)).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
