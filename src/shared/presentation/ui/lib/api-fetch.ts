import { SESSION_ENDED_HEADER, SESSION_ENDED_URL } from '@/shared/presentation/http/session-ended';

import { navigateTo } from './navigate-to';

export const NETWORK_ERROR_MESSAGE =
  'Sem conexão com a internet. Verifique e tente novamente.';

// Only what the API services read from a response.
export type ApiFetchResponse = Pick<Response, 'ok' | 'status' | 'json'>;

/**
 * Same as fetch, but a lost connection (offline, weak 4G, Wi-Fi switch)
 * becomes a failed response carrying NETWORK_ERROR_MESSAGE. The services
 * already turn failed responses into `{ error }` with parseApiError, so every
 * form shows the message instead of failing silently. A 401 marked as
 * "session ended" also takes the user to the login.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<ApiFetchResponse> {
  let response: Response;

  try {
    response = await fetch(input, init);
  } catch {
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: NETWORK_ERROR_MESSAGE }),
    };
  }

  // The login ended (signed out by a password change or expired) while this
  // screen was open: go to the login notice. Only the marked 401s — a wrong
  // password is a 401 too, and the user stays on the form.
  if (response.status === 401 && response.headers?.get(SESSION_ENDED_HEADER) === '1') {
    navigateTo(SESSION_ENDED_URL);
  }

  return response;
}
