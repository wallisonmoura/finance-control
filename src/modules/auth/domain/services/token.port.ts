export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenPort {
  generateAccessToken(payload: TokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<TokenPayload>;
}
