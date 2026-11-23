import { toVerifiedTokenPayload } from '@/modules/auth/infra/services/to-verified-token-payload';

// The jose adapter cannot load under Jest (pure ESM), so the reading of a
// verified token's claims lives here, where it can be tested.
describe('toVerifiedTokenPayload', () => {
  it('should read the subject, email and issued-at time in seconds', () => {
    expect(
      toVerifiedTokenPayload({ sub: 'user-1', email: 'user@email.com', iat: 1_763_000_000 }),
    ).toEqual({ sub: 'user-1', email: 'user@email.com', issuedAt: 1_763_000_000 });
  });

  // Without iat a login cannot be compared with the last password change, so
  // it would survive a password change: refuse it.
  it.each([
    ['iat is missing', { sub: 'user-1', email: 'user@email.com' }],
    ['iat is not a number', { sub: 'user-1', email: 'user@email.com', iat: '1763000000' }],
    ['sub is missing', { email: 'user@email.com', iat: 1_763_000_000 }],
    ['email is missing', { sub: 'user-1', iat: 1_763_000_000 }],
  ])('should refuse a token when %s', (_case, payload) => {
    expect(() => toVerifiedTokenPayload(payload)).toThrow('Token inválido.');
  });
});
