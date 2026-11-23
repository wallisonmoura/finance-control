import { jwtVerify, SignJWT } from 'jose';
import {
  TokenPayload,
  TokenPort,
  VerifiedTokenPayload,
} from '../../domain/services/token.port';
import { toVerifiedTokenPayload } from './to-verified-token-payload';

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

  async verifyAccessToken(token: string): Promise<VerifiedTokenPayload> {
    const secretKey = new TextEncoder().encode(this.secret);

    const { payload } = await jwtVerify(token, secretKey);

    return toVerifiedTokenPayload(payload);
  }
}
