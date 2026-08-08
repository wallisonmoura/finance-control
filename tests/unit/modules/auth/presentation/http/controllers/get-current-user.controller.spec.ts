import { GetCurrentUserInput } from '@/modules/auth/application/dtos/get-current-user.input';
import { GetCurrentUserOutput } from '@/modules/auth/application/dtos/get-current-user.output';
import { GetCurrentUserUseCase } from '@/modules/auth/application/use-cases/get-current-user.use-case';
import { GetCurrentUserController } from '@/modules/auth/presentation/http/controllers/get-current-user.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';

describe('GetCurrentUserController', () => {
  let useCase: jest.Mocked<GetCurrentUserUseCase>;
  let controller: GetCurrentUserController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCurrentUserUseCase>;

    controller = new GetCurrentUserController(useCase);
  });

  it('should call GetCurrentUserUseCase with the correct input', async () => {
    const output: GetCurrentUserOutput = {
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = { userId: 'user-1' };

    await controller.handle(request);

    const expectedInput: GetCurrentUserInput = { userId: 'user-1' };

    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 200 with the authenticated user', async () => {
    const output: GetCurrentUserOutput = {
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({ userId: 'user-1' });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });
});
