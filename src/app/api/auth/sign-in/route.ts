import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';
import { makeSignInUseCase } from '@/modules/auth/infra/factories/make-sign-in-use-case';
import { SignInController } from '@/modules/auth/presentation/http/controllers/sign-in.controller';
import { signInSchema } from '@/modules/auth/presentation/http/schemas/sign-in.schema';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = signInSchema.parse(body);

    const signInUseCase = makeSignInUseCase();
    const controller = new SignInController(signInUseCase);

    const output = await controller.handle(input);

    const response = NextResponse.json(
      {
        user: output.user,
      },
      { status: 200 },
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: output.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: 'Dados de entrada inválidos',
          issues: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        {
          message: error.message,
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      {
        message: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}
