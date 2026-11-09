import { createHash, randomBytes } from 'node:crypto';

import {
  GeneratedResetToken,
  ResetTokenPort,
} from '../../domain/services/reset-token.port';

// 32 random bytes: unguessable. A plain SHA-256 is enough to store it (no
// salt or slow hash needed): the token is random, not a password.
export class CryptoResetTokenAdapter implements ResetTokenPort {
  generate(): GeneratedResetToken {
    const token = randomBytes(32).toString('base64url');

    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
