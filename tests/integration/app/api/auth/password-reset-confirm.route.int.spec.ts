import { POST } from '@/app/api/auth/password-reset/confirm/route';
import { AUTH_COOKIE_NAME } from '@/modules/auth/constants/auth.constants';
import { CryptoResetTokenAdapter } from '@/modules/auth/infra/services/crypto-reset-token.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';

const resetToken = new CryptoResetTokenAdapter();

function makeRequest(body: unknown, ip = '203.0.113.30') {
  return new NextRequest('http://localhost:3000/api/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  });
}

async function createLink(userId: string) {
  const { token, tokenHash } = resetToken.generate();
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  return token;
}

async function cleanDatabase() {
  await prisma.passwordResetToken.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.user.deleteMany();
}

describe('POST /api/auth/password-reset/confirm', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should change the password with a valid link and not log the user in', async () => {
    const user = await createTestUser({ passwordHash: 'old-hash' });
    const token = await createLink(user.id);

    const response = await POST(makeRequest({ token, newPassword: 'nova-senha-123' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: 'Senha alterada. Entre com a nova senha.',
    });
    expect(response.cookies.get(AUTH_COOKIE_NAME)).toBeUndefined();
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(stored.passwordHash).not.toBe('old-hash');
  });

  it('should answer 400 with the expired message for an invalid link', async () => {
    const response = await POST(makeRequest({ token: 'nope', newPassword: 'nova-senha-123' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: 'Este link expirou ou já foi usado.' });
  });

  it('should refuse a new password shorter than 8 characters', async () => {
    const response = await POST(makeRequest({ token: 'any', newPassword: 'curta' }));

    expect(response.status).toBe(400);
  });

  it('should answer 429 after too many attempts from the same ip', async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest({ token: `guess-${i}`, newPassword: 'nova-senha-123' }));
    }

    const response = await POST(makeRequest({ token: 'guess', newPassword: 'nova-senha-123' }));

    expect(response.status).toBe(429);
  });
});
