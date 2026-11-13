export interface TokenPayload {
  sub: string;
  email: string;
}

// What a verified login carries: `issuedAt` is the JWT `iat`, in whole seconds,
// compared with the last password change (User.acceptsSessionIssuedAt).
export type VerifiedTokenPayload = TokenPayload & { issuedAt: number };

export interface TokenPort {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<VerifiedTokenPayload>;
}
