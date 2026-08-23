import { UpdateUserProfileInput } from '@/modules/auth/application/dtos/update-user-profile.input';
import { UpdateUserProfileOutput } from '@/modules/auth/application/dtos/update-user-profile.output';
import { UpdateUserProfileUseCase } from '@/modules/auth/application/use-cases/update-user-profile.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { updateProfileSchema } from '../schemas/update-profile.schema';

export class UpdateUserProfileController implements Controller<
  HttpRequest,
  UpdateUserProfileOutput
> {
  constructor(
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<UpdateUserProfileOutput>> {
    const { name } = updateProfileSchema.parse(request.body);

    const input: UpdateUserProfileInput = {
      userId: request.userId!,
      name,
    };

    const output = await this.updateUserProfileUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
