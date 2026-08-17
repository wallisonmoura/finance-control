import { SignUpInput } from '@/modules/auth/application/dtos/sign-up.input';
import { SignUpOutput } from '@/modules/auth/application/dtos/sign-up.output';
import { SignUpUseCase } from '@/modules/auth/application/use-cases/sign-up.use-case';
import { SignUpController } from '@/modules/auth/presentation/http/controllers/sign-up.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';
import { ZodError } from 'zod';

describe('SignUpController', () => {
  let useCase: jest.Mocked<SignUpUseCase>;
  let controller: SignUpController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<SignUpUseCase>;

    controller = new SignUpController(useCase);
  });

  it('should call SignUpUseCase with the correct input', async () => {
    const output: SignUpOutput = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        name: 'Nova Usuária',
        email: 'nova@email.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = {
      body: {
        name: 'Nova Usuária',
        email: 'nova@email.com',
        password: '12345678',
      },
    };

    await controller.handle(request);

    const expectedInput: SignUpInput = {
      name: 'Nova Usuária',
      email: 'nova@email.com',
      password: '12345678',
    };

    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('should return 201 with the user and access token for the cookie', async () => {
    const output: SignUpOutput = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        name: 'Nova Usuária',
        email: 'nova@email.com',
      },
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      body: {
        name: 'Nova Usuária',
        email: 'nova@email.com',
        password: '12345678',
      },
    });

    expect(response).toEqual({
      statusCode: 201,
      body: { user: output.user },
      accessToken: 'token-123',
    });
  });

  it('should throw an error when the payload is invalid', async () => {
    const request: HttpRequest = {
      body: {
        name: '',
        email: 'email-invalido',
        password: '123',
      },
    };

    await expect(controller.handle(request)).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
