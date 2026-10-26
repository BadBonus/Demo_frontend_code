import { z } from 'zod';

export const registerUserSchema = z
  .object({
    nickname: z
      .string()
      .min(2, 'Минимум 2 символа')
      .max(30, 'Максимум 30 символов')
      .regex(/^[a-zA-Z0-9_]+$/, 'Используйте латиницу, цифры или подчёркивание'),
    email: z.string().email('Неккоректный имейл'),
    password: z.string().min(8, 'Минимум 8 символов'),
    // .regex(/[a-z]/, "Нужна хотя бы одна строчная буква")
    // .regex(/[A-Z]/, "Нужна хотя бы одна заглавная буква")
    // .regex(/[0-9]/, "Нужна хотя бы одна цифра"),
    confirmPassword: z.string().min(8, 'Пароли не совпадают'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type TRegisterUserSchema = z.output<typeof registerUserSchema>;
