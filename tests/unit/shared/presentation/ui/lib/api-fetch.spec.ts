import { apiFetch, NETWORK_ERROR_MESSAGE } from '@/shared/presentation/ui/lib/api-fetch';
import { parseApiError } from '@/shared/presentation/ui/lib/parse-api-error';

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
});
