import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
}).strict();

export type updateProfileSchema = z.infer<typeof updateProfileSchema>;
