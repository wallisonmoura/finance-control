import { UpdateUserProfileOutput } from '@/modules/auth/application/dtos/update-user-profile.output';
import { UpdateUserProfileUseCase } from '@/modules/auth/application/use-cases/update-user-profile.use-case';
import { UpdateUserProfileController } from '@/modules/auth/presentation/http/controllers/update-user-profile.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';
import { ZodError } from 'zod';

describe('UpdateUserProfileController', () => {
  let useCase: jest.Mocked<UpdateUserProfileUseCase>;
  let controller: UpdateUserProfileController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateUserProfileUseCase>;

    controller = new UpdateUserProfileController(useCase);
  });

  it('should call UpdateUserProfileUseCase with the correct input', async () => {
    const output: UpdateUserProfileOutput = {
      user: { id: 'user-1', name: 'Wallison Moura', email: 'wallison@email.com' },
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = {
      userId: 'user-1',
      body: { name: 'Wallison Moura' },
    };

    await controller.handle(request);

    expect(useCase.execute).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Wallison Moura',
    });
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 200 with the updated user', async () => {
    const output: UpdateUserProfileOutput = {
      user: { id: 'user-1', name: 'Wallison Moura', email: 'wallison@email.com' },
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-1',
      body: { name: 'Wallison Moura' },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('should throw an error when the payload is invalid', async () => {
    const request: HttpRequest = {
      userId: 'user-1',
      body: { name: '' },
    };

    await expect(controller.handle(request)).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
