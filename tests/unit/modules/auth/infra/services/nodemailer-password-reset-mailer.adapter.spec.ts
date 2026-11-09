import nodemailer from 'nodemailer';

import { NodemailerPasswordResetMailerAdapter } from '@/modules/auth/infra/services/nodemailer-password-reset-mailer.adapter';

describe('NodemailerPasswordResetMailerAdapter', () => {
  it('should send the reset e-mail from the system sender', async () => {
    // jsonTransport builds the message without sending anything.
    const transporter = nodemailer.createTransport({ jsonTransport: true });
    const sendMail = jest.spyOn(transporter, 'sendMail');
    const adapter = new NodemailerPasswordResetMailerAdapter(
      transporter,
      '"Finance Control BR" <sistema@example.com>',
    );

    await adapter.sendPasswordResetLink({
      to: 'ana@example.com',
      name: 'Ana',
      resetUrl: 'https://app.example.com/reset-password?token=abc',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Finance Control BR" <sistema@example.com>',
        to: 'ana@example.com',
        subject: 'Criar uma nova senha',
        text: expect.stringContaining('https://app.example.com/reset-password?token=abc'),
        html: expect.stringContaining('Criar nova senha'),
      }),
    );
  });
});
