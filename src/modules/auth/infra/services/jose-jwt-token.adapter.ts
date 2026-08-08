import { jwtVerify, SignJWT } from 'jose';
import {
  TokenPayload,
  TokenService,
} from '../../domain/services/token.port';
import { AUTH_TOKEN_EXPIRES_IN } from '../../constants/auth.constants';

export class JoseJwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = AUTH_TOKEN_EXPIRES_IN,
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
