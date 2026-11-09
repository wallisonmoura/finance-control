import nodemailer from 'nodemailer';

import { makePasswordResetMailer } from '@/modules/auth/infra/factories/make-password-reset-mailer';

const message = { to: 'ana@example.com', name: 'Ana', resetUrl: 'https://app.example.com/reset-password?token=abc' };

describe('makePasswordResetMailer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should fail only when sending if the mail variables are missing', async () => {
    delete process.env.MAIL_SMTP_USER;
    delete process.env.MAIL_SMTP_APP_PASSWORD;

    const mailer = makePasswordResetMailer();

    await expect(mailer.sendPasswordResetLink(message)).rejects.toThrow(
      'Password reset mail is not configured',
    );
  });

  // A hung SMTP connection must fail fast with a log line, not hold the
  // background work until the serverless function is killed.
  it('should give up on Gmail within 10 seconds', () => {
    process.env.MAIL_SMTP_USER = 'sistema@example.com';
    process.env.MAIL_SMTP_APP_PASSWORD = 'app-password';
    const createTransport = jest.spyOn(nodemailer, 'createTransport');

    makePasswordResetMailer();

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
      }),
    );
  });
});
