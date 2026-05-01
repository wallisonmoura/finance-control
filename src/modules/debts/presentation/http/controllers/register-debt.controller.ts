import { DebtOutput } from '@/modules/debts/application/dto/debt.output';
import { RegisterDebtUseCase } from '@/modules/debts/application/use-cases/register-debt.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import {
  registerDebtSchema,
  RegisterDebtSchemaData,
} from '../schemas/register-debt.schema';
import { RegisterDebtInput } from '@/modules/debts/application/dto/register-debt.input';

export class RegisterDebtController implements Controller<
  HttpRequest,
  DebtOutput
> {
  constructor(private readonly registerDebtUseCase: RegisterDebtUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<DebtOutput>> {
    const data: RegisterDebtSchemaData = registerDebtSchema.parse(request.body);

    const input: RegisterDebtInput = {
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      type: data.type,
      notes: data.notes,
    };

    const output = await this.registerDebtUseCase.execute(input);

    return {
      statusCode: 201,
      body: output,
    };
  }
}
