const mockScheduled: (() => unknown)[] = [];
const mockSendPasswordResetLink = jest.fn();

// after() runs work once the response is sent. Here the work is only queued:
// it runs when a test calls flushScheduled, never on its own.
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');

  return {
    ...actual,
    after: (work: () => unknown) => {
      mockScheduled.push(work);
    },
  };
});

jest.mock('@/modules/auth/infra/factories/make-password-reset-mailer', () => ({
  makePasswordResetMailer: () => ({ sendPasswordResetLink: mockSendPasswordResetLink }),
}));

import { POST } from '@/app/api/auth/password-reset/route';
import { PASSWORD_RESET_REQUEST_MESSAGE } from '@/modules/auth/constants/auth.constants';
import { PrismaRateLimiterAdapter } from '@/modules/auth/infra/services/prisma-rate-limiter.adapter';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestUser } from '../../../../helpers/database/create-test-user';

function makeRequest(body: unknown, ip = '203.0.113.20') {
  return new NextRequest('http://localhost:3000/api/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  });
}

async function flushScheduled() {
  for (const work of mockScheduled.splice(0)) {
    await work();
  }
}

async function cleanDatabase() {
  await prisma.passwordResetToken.deleteMany();
  await prisma.loginAttempt.deleteMany();
  await prisma.user.deleteMany();
}

describe('POST /api/auth/password-reset', () => {
  beforeEach(async () => {
    // Work queued by a test that did not flush is dropped, never run later.
    mockScheduled.splice(0);
    await cleanDatabase();
    mockSendPasswordResetLink.mockReset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('should answer the same for an existing and an unknown email', async () => {
    await createTestUser({ email: 'ana@example.com' });

    const existing = await POST(makeRequest({ email: 'ana@example.com' }));
    const unknown = await POST(makeRequest({ email: 'nobody@example.com' }, '203.0.113.21'));

    expect(existing.status).toBe(200);
    expect(unknown.status).toBe(200);
    await expect(existing.json()).resolves.toEqual({ message: PASSWORD_RESET_REQUEST_MESSAGE });
    await expect(unknown.json()).resolves.toEqual({ message: PASSWORD_RESET_REQUEST_MESSAGE });
  });

  it('should send the email after answering', async () => {
    await createTestUser({ email: 'ana@example.com', name: 'Ana' });

    await POST(makeRequest({ email: 'ana@example.com' }));
    expect(mockScheduled).toHaveLength(1);
    expect(mockSendPasswordResetLink).not.toHaveBeenCalled();
    await flushScheduled();

    expect(mockSendPasswordResetLink).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana@example.com',
        name: 'Ana',
        resetUrl: expect.stringMatching(/\/reset-password\?token=[A-Za-z0-9_-]{43,}$/),
      }),
    );
    expect(await prisma.passwordResetToken.count()).toBe(1);
  });

  it('should still answer 200 when sending fails, and log the error', async () => {
    await createTestUser({ email: 'ana@example.com' });
    mockSendPasswordResetLink.mockRejectedValueOnce(new Error('smtp down'));

    const response = await POST(makeRequest({ email: 'ana@example.com' }));
    await flushScheduled();

    expect(response.status).toBe(200);
    expect(console.error).toHaveBeenCalled();
  });

  it('should refuse unknown fields', async () => {
    const response = await POST(makeRequest({ email: 'ana@example.com', admin: true }));

    expect(response.status).toBe(400);
  });

  it('should answer 429 after too many requests from the same ip', async () => {
    for (let i = 0; i < 5; i += 1) {
      await POST(makeRequest({ email: `user${i}@example.com` }));
    }

    const response = await POST(makeRequest({ email: 'ana@example.com' }));

    expect(response.status).toBe(429);
  });

  it('should answer the standard 500 when the rate limiter fails', async () => {
    jest.spyOn(PrismaRateLimiterAdapter.prototype, 'isBlocked').mockRejectedValueOnce(new Error('db down'));

    const response = await POST(makeRequest({ email: 'ana@example.com' }));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ message: 'Erro interno do servidor.' });
  });
});
