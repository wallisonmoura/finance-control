import { SignJWT } from 'jose';
import {
  TokenPayload,
  TokenService,
} from '../../domain/services/token.service';

export class JoseJwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = '7d',
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
}
