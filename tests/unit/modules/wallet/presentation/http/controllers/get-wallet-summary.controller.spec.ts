import { GetWalletSummaryOutput } from '@/modules/wallet/application/dtos/get-wallet-summary.output';
import { GetWalletInput } from '@/modules/wallet/application/dtos/get-wallet.input';
import { GetWalletSummaryUseCase } from '@/modules/wallet/application/use-cases/get-wallet-summary.use-case';
import { GetWalletSummaryController } from '@/modules/wallet/presentation/http/controllers/get-wallet-summary.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';

describe('GetWalletSummaryController', () => {
  let useCase: jest.Mocked<GetWalletSummaryUseCase>;
  let controller: GetWalletSummaryController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetWalletSummaryUseCase>;

    controller = new GetWalletSummaryController(useCase);
  });

  it('deve chamar o GetWalletSummaryUseCase com o input correto', async () => {
    const output: GetWalletSummaryOutput = {
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: 100,
        cashBalance: 50,
        receivableBalance: 25,
        walletTotal: 175,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
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

  it('deve retornar 200 com o summary da wallet', async () => {
    const output: GetWalletSummaryOutput = {
      wallet: {
        id: 'wallet-1',
        userId: 'user-1',
        bankBalance: 100,
        cashBalance: 50,
        receivableBalance: 25,
        walletTotal: 175,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
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
