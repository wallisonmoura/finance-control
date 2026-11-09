import { PasswordResetMailerPort } from '@/modules/auth/domain/services/password-reset-mailer.port';

export class FakePasswordResetMailer implements PasswordResetMailerPort {
  readonly sent: { to: string; name: string; resetUrl: string }[] = [];

  async sendPasswordResetLink(input: { to: string; name: string; resetUrl: string }): Promise<void> {
    this.sent.push(input);
  }
}
