import nodemailer from 'nodemailer';

import { PasswordResetMailerPort } from '../../domain/services/password-reset-mailer.port';
import { NodemailerPasswordResetMailerAdapter } from '../services/nodemailer-password-reset-mailer.adapter';

const SENDER_NAME = 'Finance Control BR';

// Nodemailer waits up to 2 minutes by default; fail fast with a log line instead.
const SMTP_TIMEOUT_MS = 10_000;

// Gmail SMTP with an app password. Without the variables (CI, tests, a
// machine without the secret) the app still works: only sending fails, with
// a clear error in the log.
export function makePasswordResetMailer(): PasswordResetMailerPort {
  const user = process.env.MAIL_SMTP_USER;
  const appPassword = process.env.MAIL_SMTP_APP_PASSWORD;

  if (!user || !appPassword) {
    return {
      sendPasswordResetLink: async () => {
        throw new Error('Password reset mail is not configured');
      },
    };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass: appPassword },
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });

  return new NodemailerPasswordResetMailerAdapter(transporter, `"${SENDER_NAME}" <${user}>`);
}
