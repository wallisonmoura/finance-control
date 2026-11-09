import { z } from 'zod';

// Same rule as sign-up. The confirmation field stays in the form.
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Link inválido'),
    newPassword: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  })
  .strict();
