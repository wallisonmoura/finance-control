import { SignInInput } from '@/modules/auth/application/dtos/sign-in.input';
import { SignInOutput } from '@/modules/auth/application/dtos/sign-in.output';
import { SignInUseCase } from '@/modules/auth/application/use-cases/sign-in.use-case';
import { SignInController } from '@/modules/auth/presentation/http/controllers/sign-in.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';
import { ZodError } from 'zod';

describe('SignInController', () => {
  let useCase: jest.Mocked<SignInUseCase>;
  let controller: SignInController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SignInUseCase>;

    controller = new SignInController(useCase);
  });

  it('should call SignInUseCase with the correct input', async () => {
    const output: SignInOutput = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = {
      body: {
        email: 'admin@financecontrol.com',
        password: '123456',
      },
    };

    await controller.handle(request);

    const expectedInput: SignInInput = {
      email: 'admin@financecontrol.com',
      password: '123456',
    };

    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 200 with the user and access token for the cookie', async () => {
    const output: SignInOutput = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        name: 'Admin',
        email: 'admin@financecontrol.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      body: {
        email: 'admin@financecontrol.com',
        password: '123456',
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: { user: output.user },
      accessToken: 'token-123',
    });
  });

  it('should throw an error when the payload is invalid', async () => {
    const request: HttpRequest = {
      body: {
        email: 'email-invalido',
        password: '',
      },
    };

    await expect(controller.handle(request)).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
