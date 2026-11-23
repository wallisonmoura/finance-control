import { VerifiedTokenPayload } from '../../domain/services/token.port';

// The claims of a token whose signature and expiry were already verified.
type VerifiedClaims = {
  sub?: unknown;
  email?: unknown;
  iat?: unknown;
};

// Kept out of the jose adapter so it can be tested (jose does not load under
// Jest). `iat` is required: it is compared with the last password change, and
// every login issued here sets it (setIssuedAt).
export function toVerifiedTokenPayload(claims: VerifiedClaims): VerifiedTokenPayload {
  if (!claims.sub || !claims.email || typeof claims.iat !== 'number') {
    throw new Error('Token inválido.');
  }

  return {
    sub: String(claims.sub),
    email: String(claims.email),
    issuedAt: claims.iat,
  };
}
