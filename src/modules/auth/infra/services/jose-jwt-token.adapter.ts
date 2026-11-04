import { jwtVerify, SignJWT } from 'jose';
import {
  TokenPayload,
  TokenPort,
} from '../../domain/services/token.port';

export class JoseJwtTokenAdapter implements TokenPort {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const secretKey = new TextEncoder().encode(this.secret);

    return new SignJWT({
      email: payload.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.expiresIn)
      .sign(secretKey);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    const secretKey = new TextEncoder().encode(this.secret);

    const { payload } = await jwtVerify(token, secretKey);

    if (!payload.sub || !payload.email) {
      throw new Error('Token inválido.');
    }

    return {
      sub: String(payload.sub),
      email: String(payload.email),
    };
  }
}
