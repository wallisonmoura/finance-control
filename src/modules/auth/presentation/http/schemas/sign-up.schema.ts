import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

export type signUpSchema = z.infer<typeof signUpSchema>;
