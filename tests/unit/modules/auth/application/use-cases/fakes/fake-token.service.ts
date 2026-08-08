import {
  TokenPayload,
  TokenService,
} from '@/modules/auth/domain/services/token.port';

export class FakeTokenService implements TokenService {
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return `token-${payload.sub}`;
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    return {
      sub: token.replace('token-for-', ''),
      email: 'fake@email.com',
    };
  }
}
