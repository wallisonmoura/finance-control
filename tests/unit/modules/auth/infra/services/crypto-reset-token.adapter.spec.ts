import { CryptoResetTokenAdapter } from '@/modules/auth/infra/services/crypto-reset-token.adapter';

describe('CryptoResetTokenAdapter', () => {
  const adapter = new CryptoResetTokenAdapter();

  it('should generate a long url-safe token and its hash', () => {
    const { token, tokenHash } = adapter.generate();

    expect(token).toMatch(/^[A-Za-z0-9_-]{43,}$/);
    expect(tokenHash).toBe(adapter.hash(token));
    expect(tokenHash).not.toBe(token);
  });

  it('should generate a different token each time', () => {
    expect(adapter.generate().token).not.toBe(adapter.generate().token);
  });
});
