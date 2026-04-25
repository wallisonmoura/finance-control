import { GetWalletInput } from '@/modules/wallet/application/dtos/get-wallet.input';
import { WalletOutput } from '@/modules/wallet/application/dtos/wallet.output';
import { GetWalletUseCase } from '@/modules/wallet/application/use-cases/get-wallet.use-case';
import { GetWalletController } from '@/modules/wallet/presentation/http/controllers/get-wallet.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';

describe('GetWalletController', () => {
  let useCase: jest.Mocked<GetWalletUseCase>;
  let controller: GetWalletController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetWalletUseCase>;

    controller = new GetWalletController(useCase);
  });

  it('deve chamar o GetWalletUseCase com o input correto', async () => {
    const output: WalletOutput = {
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 25,
      walletTotal: 175,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = {
      userId: 'user-1',
    };

    await controller.handle(request);

    const expectedInput: GetWalletInput = {
      userId: 'user-1',
    };

    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 200 com a wallet', async () => {
    const output: WalletOutput = {
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 100,
      cashBalance: 50,
      receivableBalance: 25,
      walletTotal: 175,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-1',
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });
});
