import { ZodError } from 'zod';

import { SetIncomeGoalsUseCase } from '@/modules/finance/application/use-cases/set-income-goals.use-case';
import { SetIncomeGoalsController } from '@/modules/finance/presentation/http/controllers/set-income-goals.controller';

describe('SetIncomeGoalsController', () => {
  function makeController() {
    const useCase = {
      execute: jest.fn().mockResolvedValue({ revenueTarget: 6000, profitTarget: null }),
    } as unknown as jest.Mocked<SetIncomeGoalsUseCase>;

    return { controller: new SetIncomeGoalsController(useCase), useCase };
  }

  it('should save the goals of the authenticated user and return status 200', async () => {
    const { controller, useCase } = makeController();

    const response = await controller.handle({
      userId: 'user-id',
      body: { revenueTarget: 6000, profitTarget: null },
    });

    expect(useCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      revenueTarget: 6000,
      profitTarget: null,
    });
    expect(response).toEqual({
      statusCode: 200,
      body: { revenueTarget: 6000, profitTarget: null },
    });
  });

  it('should reject a body without both fields', async () => {
    const { controller, useCase } = makeController();

    await expect(
      controller.handle({ userId: 'user-id', body: { revenueTarget: 6000 } }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
