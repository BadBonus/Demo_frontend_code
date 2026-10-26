import * as z from 'zod';

export const loginUserSchema = z.object({
  email: z.string().email('Некоректный имейл'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export type TLoginUserSchema = z.infer<typeof loginUserSchema>;
