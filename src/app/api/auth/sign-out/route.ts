import { makeSignOutUseCase } from '@/modules/auth/infra/factories/make-sign-out-use-case';
import { SignOutController } from '@/modules/auth/presentation/http/controllers/sign-out.controller';
import { NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE_NAME = 'fc_access_token';

export async function POST() {
  try {
    const signOutUseCase = makeSignOutUseCase();
    const controller = new SignOutController(signOutUseCase);

    await controller.handle();

    const response = NextResponse.json(
      {
        message: 'Signed out successfully',
      },
      { status: 200 },
    );

    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message: 'Erro interno do servidor',
      },
      { status: 500 },
    );
  }
}
