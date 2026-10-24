export const NETWORK_ERROR_MESSAGE =
  'Sem conexão com a internet. Verifique e tente novamente.';

// Only what the API services read from a response.
export type ApiFetchResponse = Pick<Response, 'ok' | 'json'>;

/**
 * Same as fetch, but a lost connection (offline, weak 4G, Wi-Fi switch)
 * becomes a failed response carrying NETWORK_ERROR_MESSAGE. The services
 * already turn failed responses into `{ error }` with parseApiError, so every
 * form shows the message instead of failing silently.
 */
export async function apiFetch(
  input: string,
  init?: RequestInit,
): Promise<ApiFetchResponse> {
  try {
    return await fetch(input, init);
  } catch {
    return {
      ok: false,
      json: async () => ({ message: NETWORK_ERROR_MESSAGE }),
    };
  }
}
