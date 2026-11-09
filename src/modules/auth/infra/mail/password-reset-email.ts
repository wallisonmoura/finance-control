export interface PasswordResetEmail {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// The copy is fixed by the design: link valid for 1 hour, single use, and
// "ignore it" when the person did not ask.
export function buildPasswordResetEmail(input: { name: string; resetUrl: string }): PasswordResetEmail {
  const ignoreNotice = 'Se não foi você, ignore este e-mail — sua senha continua a mesma.';

  const text = [
    `Olá, ${input.name}.`,
    '',
    'Recebemos um pedido pra criar uma nova senha no Finance Control BR.',
    'Abra o link abaixo pra criar a nova senha. Ele vale por 1 hora e só funciona uma vez:',
    '',
    input.resetUrl,
    '',
    ignoreNotice,
  ].join('\n');

  const name = escapeHtml(input.name);
  const url = escapeHtml(input.resetUrl);

  const html = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;">
      <p style="margin:0 0 24px;font-size:20px;font-weight:bold;">Finance Control BR</p>
      <p style="margin:0 0 16px;">Olá, ${name}.</p>
      <p style="margin:0 0 24px;">Recebemos um pedido pra criar uma nova senha. O link vale por 1 hora e só funciona uma vez.</p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block;background:#020617;color:#f8fafc;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px;">Criar nova senha</a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#475569;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all;"><a href="${url}" style="color:#047857;">${url}</a></p>
      <p style="margin:0;font-size:13px;color:#475569;">${escapeHtml(ignoreNotice)}</p>
    </div>
  </body>
</html>`;

  return { subject: 'Criar uma nova senha', text, html };
}
