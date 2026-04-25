import { UpdateWalletBalancesInput } from '@/modules/wallet/application/dtos/update-wallet-balances.input';
import { WalletOutput } from '@/modules/wallet/application/dtos/wallet.output';
import { UpdateWalletBalancesUseCase } from '@/modules/wallet/application/use-cases/update-wallet-balances.use-case';
import { UpdateWalletBalancesController } from '@/modules/wallet/presentation/http/controllers/update-wallet-balances.controller';
import { HttpRequest } from '@/shared/presentation/http/http.types';
import { ZodError } from 'zod';

describe('UpdateWalletBalancesController', () => {
  let useCase: jest.Mocked<UpdateWalletBalancesUseCase>;
  let controller: UpdateWalletBalancesController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateWalletBalancesUseCase>;

    controller = new UpdateWalletBalancesController(useCase);
  });

  it('deve chamar o UpdateWalletBalancesUseCase com o input correto', async () => {
    const output: WalletOutput = {
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 200,
      cashBalance: 100,
      receivableBalance: 50,
      walletTotal: 350,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    useCase.execute.mockResolvedValue(output);

    const request: HttpRequest = {
      userId: 'user-1',
      body: {
        bankBalance: 200,
        cashBalance: 100,
        receivableBalance: 50,
      },
    };

    await controller.handle(request);

    const expectedInput: UpdateWalletBalancesInput = {
      userId: 'user-1',
      bankBalance: 200,
      cashBalance: 100,
      receivableBalance: 50,
    };

    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);
    expect(useCase.execute).toHaveBeenCalledTimes(1);
  });

  it('deve retornar 200 com a wallet atualizada', async () => {
    const output: WalletOutput = {
      id: 'wallet-1',
      userId: 'user-1',
      bankBalance: 200,
      cashBalance: 100,
      receivableBalance: 50,
      walletTotal: 350,
      createdAt: new Date('2026-04-01T00:00:00.000Z'),
      updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-1',
      body: {
        bankBalance: 200,
        cashBalance: 100,
        receivableBalance: 50,
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('deve lançar erro quando o payload for inválido', async () => {
    const request: HttpRequest = {
      userId: 'user-1',
      body: {
        bankBalance: -1,
        cashBalance: 100,
        receivableBalance: 50,
      },
    };

    await expect(controller.handle(request)).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
