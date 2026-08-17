import type {
  AuthApiResponse,
  GetCurrentUserResponse,
  SignInInput,
  SignUpInput,
} from '../types/auth-ui.types';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';

export async function signIn(
  input: SignInInput,
): Promise<AuthApiResponse<null>> {
  const response = await fetch('/api/auth/sign-in', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
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

export async function signUp(
  input: SignUpInput,
): Promise<AuthApiResponse<null>> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
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
    headers: {
      Accept: 'application/json',
    },
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
    headers: {
      Accept: 'application/json',
    },
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
