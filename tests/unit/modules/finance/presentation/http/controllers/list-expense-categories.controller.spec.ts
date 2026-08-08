import { ListExpenseCategoriesUseCase } from '@/modules/finance/application/use-cases/list-expense-categories.use-case';
import { ListExpenseCategoriesController } from '@/modules/finance/presentation/http/controllers/list-expense-categories.controller';

describe('ListExpenseCategoriesController', () => {
  it('should return status 200 with expense categories', async () => {
    const output = [
      {
        id: 'category-id',
        name: 'Combustivel',
        slug: 'combustivel',
      },
    ];

    const useCase = {
      execute: jest.fn().mockResolvedValue(output),
    } as unknown as jest.Mocked<ListExpenseCategoriesUseCase>;

    const controller = new ListExpenseCategoriesController(useCase);

    const response = await controller.handle({
      userId: 'user-id',
    });

    expect(useCase.execute).toHaveBeenCalledWith({ userId: 'user-id' });
    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });
});
