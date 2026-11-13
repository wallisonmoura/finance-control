jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

import { redirect } from 'next/navigation';

import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { requireActiveSession } from '@/modules/auth/presentation/server/require-active-session';
import { SESSION_ENDED_URL } from '@/shared/presentation/http/session-ended';

const getAuthenticatedUserIdMock = getAuthenticatedUserId as jest.MockedFunction<
  typeof getAuthenticatedUserId
>;

describe('requireActiveSession', () => {
  afterEach(() => jest.clearAllMocks());

  // The proxy only lets private pages through with a cookie, so no session
  // here means a login signed out or expired.
  it('should redirect to the session-ended route when there is no valid session', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue(null);

    await expect(requireActiveSession()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(SESSION_ENDED_URL);
  });

  it('should return the user id otherwise', async () => {
    getAuthenticatedUserIdMock.mockResolvedValue('user-1');

    await expect(requireActiveSession()).resolves.toBe('user-1');
    expect(redirect).not.toHaveBeenCalled();
  });
});
