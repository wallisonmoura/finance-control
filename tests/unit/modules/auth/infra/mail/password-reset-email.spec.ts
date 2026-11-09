import { buildPasswordResetEmail } from '@/modules/auth/infra/mail/password-reset-email';

const RESET_URL = 'https://app.example.com/reset-password?token=abc';

describe('buildPasswordResetEmail', () => {
  it('should use the agreed subject', () => {
    expect(buildPasswordResetEmail({ name: 'Ana', resetUrl: RESET_URL }).subject).toBe(
      'Criar uma nova senha',
    );
  });

  it.each(['text', 'html'] as const)('should put the link, the 1 hour limit and the ignore notice in the %s body', (part) => {
    const body = buildPasswordResetEmail({ name: 'Ana', resetUrl: RESET_URL })[part];

    expect(body).toContain('Ana');
    expect(body).toContain('1 hora');
    expect(body).toContain('Se não foi você, ignore este e-mail — sua senha continua a mesma.');
    expect(body).toContain(part === 'html' ? RESET_URL.replace('&', '&amp;') : RESET_URL);
  });

  it('should have a "Criar nova senha" button in the html', () => {
    expect(buildPasswordResetEmail({ name: 'Ana', resetUrl: RESET_URL }).html).toMatch(
      /<a [^>]*href="https:\/\/app\.example\.com\/reset-password\?token=abc"[^>]*>\s*Criar nova senha\s*<\/a>/,
    );
  });

  // The name comes from the user; it must not inject markup.
  it('should escape the name and the link in the html', () => {
    const { html } = buildPasswordResetEmail({
      name: '<script>x</script>',
      resetUrl: 'https://app.example.com/reset-password?token=a"b&c',
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('token=a&quot;b&amp;c');
  });
});
