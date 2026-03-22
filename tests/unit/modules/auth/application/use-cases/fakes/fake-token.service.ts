import {
  TokenPayload,
  TokenService,
} from '@/modules/auth/domain/services/token.service';

export class FakeTokenService implements TokenService {
  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return `token-${payload.sub}`;
  }
}
