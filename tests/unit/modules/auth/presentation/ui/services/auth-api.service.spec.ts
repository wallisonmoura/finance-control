import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from '@/modules/auth/presentation/ui/services/auth-api.service';

const mockFetch = jest.fn();

global.fetch = mockFetch;

describe('AuthApiService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('signIn', () => {
    it('should call sign-in API and return data when request succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn(),
      });

      const result = await signIn({
        email: 'admin@financecontrol.com',
        password: '123456',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-in', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@financecontrol.com',
          password: '123456',
        }),
      });

      expect(result).toEqual({
        data: null,
      });
    });

    it('should return error message when sign-in API returns message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: 'Credenciais inválidas',
        }),
      });

      const result = await signIn({
        email: 'admin@financecontrol.com',
        password: 'wrong-password',
      });

      expect(result).toEqual({
        error: 'Credenciais inválidas',
      });
    });

    it('should return error field when sign-in API returns error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          error: 'Invalid request',
        }),
      });

      const result = await signIn({
        email: 'invalid-email',
        password: '',
      });

      expect(result).toEqual({
        error: 'Invalid request',
      });
    });

    it('should return fallback error when sign-in API error body cannot be parsed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      });

      const result = await signIn({
        email: 'admin@financecontrol.com',
        password: 'wrong-password',
      });

      expect(result).toEqual({
        error: 'Não foi possível concluir a operação.',
      });
    });

    it('should return fallback error when sign-in API returns empty error body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      const result = await signIn({
        email: 'admin@financecontrol.com',
        password: 'wrong-password',
      });

      expect(result).toEqual({
        error: 'Não foi possível concluir a operação.',
      });
    });
  });

  describe('signUp', () => {
    it('should call register API and return data when request succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn(),
      });

      const result = await signUp({
        name: 'Admin Local',
        email: 'admin@financecontrol.com',
        password: '12345678',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
          password: '12345678',
        }),
      });

      expect(result).toEqual({
        data: null,
      });
    });

    it('should return error message when register API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: 'E-mail já cadastrado',
        }),
      });

      const result = await signUp({
        name: 'Admin Local',
        email: 'admin@financecontrol.com',
        password: '12345678',
      });

      expect(result).toEqual({
        error: 'E-mail já cadastrado',
      });
    });
  });

  describe('signOut', () => {
    it('should call sign-out API and return data when request succeeds', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn(),
      });

      const result = await signOut();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      expect(result).toEqual({
        data: null,
      });
    });

    it('should return error message when sign-out API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: 'Não autenticado',
        }),
      });

      const result = await signOut();

      expect(result).toEqual({
        error: 'Não autenticado',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should call me API and return authenticated user when request succeeds', async () => {
      const authenticatedUserResponse = {
        user: {
          id: 'user-id',
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(authenticatedUserResponse),
      });

      const result = await getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
        },
      });

      expect(result).toEqual({
        data: authenticatedUserResponse,
      });
    });

    it('should return error message when me API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: 'Não autenticado',
        }),
      });

      const result = await getCurrentUser();

      expect(result).toEqual({
        error: 'Não autenticado',
      });
    });
  });
});
