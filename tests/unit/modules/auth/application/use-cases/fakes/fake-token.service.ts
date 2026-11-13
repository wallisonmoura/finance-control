import {
  TokenPayload,
  TokenPort,
  VerifiedTokenPayload,
} from '@/modules/auth/domain/services/token.port';

export class FakeTokenService implements TokenPort {
  constructor(
    private readonly issuedAt: () => number = () => Math.floor(Date.now() / 1000),
  ) {}

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return `token-${payload.sub}`;
  }

  async verifyAccessToken(token: string): Promise<VerifiedTokenPayload> {
    if (!token.startsWith('token-')) {
      throw new Error('Token inválido.');
    }

    return {
      sub: token.replace('token-', ''),
      email: 'fake@email.com',
      issuedAt: this.issuedAt(),
    };
  }
}
