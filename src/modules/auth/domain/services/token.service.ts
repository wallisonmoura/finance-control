export interface TokenPayload {
  sub: string;
  email: string;
}

export interface TokenService {
  generateAccessToken(payload: TokenPayload): Promise<string>;
}
