import { ZodError } from 'zod';

import { SetCategoryMonthlyLimitUseCase } from '@/modules/finance/application/use-cases/set-category-monthly-limit.use-case';
import { SetCategoryMonthlyLimitController } from '@/modules/finance/presentation/http/controllers/set-category-monthly-limit.controller';

const CATEGORY_ID = '6f1c1b2e-6d1a-4c1e-9b1a-0a1b2c3d4e5f';

describe('SetCategoryMonthlyLimitController', () => {
  function makeController() {
    const output = {
      id: CATEGORY_ID,
      name: 'Lazer',
      slug: 'lazer',
      monthlyLimit: 300,
    };
    const useCase = {
      execute: jest.fn().mockResolvedValue(output),
    } as unknown as jest.Mocked<SetCategoryMonthlyLimitUseCase>;

    return { controller: new SetCategoryMonthlyLimitController(useCase), useCase, output };
  }

  it('should set the monthly limit and return status 200', async () => {
    const { controller, useCase, output } = makeController();

    const response = await controller.handle({
      userId: 'user-id',
      params: { id: CATEGORY_ID },
      body: { monthlyLimit: 300 },
    });

    expect(useCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      categoryId: CATEGORY_ID,
      monthlyLimit: 300,
    });
    expect(response).toEqual({ statusCode: 200, body: output });
  });

  it('should pass null through to remove the goal', async () => {
    const { controller, useCase } = makeController();

    await controller.handle({
      userId: 'user-id',
      params: { id: CATEGORY_ID },
      body: { monthlyLimit: null },
    });

    expect(useCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ monthlyLimit: null }),
    );
  });

  it('should reject an invalid category id', async () => {
    const { controller, useCase } = makeController();

    await expect(
      controller.handle({
        userId: 'user-id',
        params: { id: 'not-a-uuid' },
        body: { monthlyLimit: 300 },
      }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
