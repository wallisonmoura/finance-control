import {
  GeneratedResetToken,
  ResetTokenPort,
} from '@/modules/auth/domain/services/reset-token.port';

// Predictable tokens: token-1, token-2... hashed as "hashed:<token>".
export class FakeResetToken implements ResetTokenPort {
  private count = 0;

  generate(): GeneratedResetToken {
    this.count += 1;
    const token = `token-${this.count}`;

    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return `hashed:${token}`;
  }
}
