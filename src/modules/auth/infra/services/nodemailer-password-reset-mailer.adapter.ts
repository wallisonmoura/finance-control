import type { Transporter } from 'nodemailer';

import {
  PasswordResetLinkMessage,
  PasswordResetMailerPort,
} from '../../domain/services/password-reset-mailer.port';
import { buildPasswordResetEmail } from '../mail/password-reset-email';

export class NodemailerPasswordResetMailerAdapter implements PasswordResetMailerPort {
  constructor(
    private readonly transporter: Transporter,
    private readonly from: string,
  ) {}

  async sendPasswordResetLink(message: PasswordResetLinkMessage): Promise<void> {
    const email = buildPasswordResetEmail({ name: message.name, resetUrl: message.resetUrl });

    await this.transporter.sendMail({
      from: this.from,
      to: message.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  }
}
