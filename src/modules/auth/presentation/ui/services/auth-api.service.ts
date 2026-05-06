import type {
  AuthApiResponse,
  GetCurrentUserResponse,
  SignInInput,
} from '../types/auth-ui.types';

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    return (
      body.message || body.error || 'Não foi possível concluir a operação.'
    );
  } catch {
    return 'Não foi possível concluir a operação.';
  }
}

export async function signIn(
  input: SignInInput,
): Promise<AuthApiResponse<null>> {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  return {
    data: null,
  };
}

export async function signOut(): Promise<AuthApiResponse<null>> {
  const response = await fetch('/api/auth/sign-out', {
    method: 'POST',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  return {
    data: null,
  };
}

export async function getCurrentUser(): Promise<
  AuthApiResponse<GetCurrentUserResponse>
> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return {
      error: await parseApiError(response),
    };
  }

  const data = (await response.json()) as GetCurrentUserResponse;

  return {
    data,
  };
}
