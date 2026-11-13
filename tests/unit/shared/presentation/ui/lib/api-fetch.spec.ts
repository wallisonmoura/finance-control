jest.mock('@/shared/presentation/ui/lib/navigate-to', () => ({ navigateTo: jest.fn() }));

import { apiFetch, NETWORK_ERROR_MESSAGE } from '@/shared/presentation/ui/lib/api-fetch';
import { navigateTo } from '@/shared/presentation/ui/lib/navigate-to';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';
import { SESSION_ENDED_HEADER, SESSION_ENDED_URL } from '@/shared/presentation/http/session-ended';

// jsdom has no Response; this keeps what apiFetch reads.
function makeServerResponse(status: number, headers: Record<string, string> = {}) {
  return {
    ok: status < 400,
    status,
    headers: { get: (name: string) => headers[name] ?? null },
    json: async () => ({ message: 'x' }),
  };
}

describe('apiFetch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock;
  });

  it('should pass the request through and return the server response', async () => {
    const serverResponse = { ok: true, json: async () => ({ id: 'x' }) };
    fetchMock.mockResolvedValueOnce(serverResponse);

    const response = await apiFetch('/api/debts', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledWith('/api/debts', { method: 'GET' });
    expect(response).toBe(serverResponse);
  });

  it('should turn a connection failure into a failed response with the no-connection message', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const response = await apiFetch('/api/debts', { method: 'GET' });

    expect(response.ok).toBe(false);
    await expect(parseApiError(response as Response)).resolves.toBe(NETWORK_ERROR_MESSAGE);
  });

  it('should explain the failure in plain words', () => {
    expect(NETWORK_ERROR_MESSAGE).toBe('Sem conexão com a internet. Verifique e tente novamente.');
  });

  // Signed out on another device or expired, with this screen still open.
  it('should go to the session-ended route on a marked 401', async () => {
    fetchMock.mockResolvedValueOnce(makeServerResponse(401, { [SESSION_ENDED_HEADER]: '1' }));

    const response = await apiFetch('/api/wallet', { method: 'PUT' });

    expect(navigateTo).toHaveBeenCalledWith(SESSION_ENDED_URL);
    expect(response.status).toBe(401);
  });

  // e.g. wrong current password in Account: the user stays on the screen.
  it('should not navigate on an unmarked 401', async () => {
    fetchMock.mockResolvedValueOnce(makeServerResponse(401));

    await apiFetch('/api/auth/me/password', { method: 'PUT' });

    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('should not navigate on other errors', async () => {
    fetchMock.mockResolvedValueOnce(makeServerResponse(500, { [SESSION_ENDED_HEADER]: '1' }));

    await apiFetch('/api/wallet', { method: 'GET' });

    expect(navigateTo).not.toHaveBeenCalled();
  });
});
