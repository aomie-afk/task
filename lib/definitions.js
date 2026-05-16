import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Nama minimal 2 karakter.' })
    .trim(),
  email: z.string().email({ message: 'Masukkan email yang valid.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password minimal 8 karakter.' })
    .regex(/[a-zA-Z]/, { message: 'Mengandung setidaknya satu huruf.' })
    .regex(/[0-9]/, { message: 'Mengandung setidaknya satu angka.' })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Masukkan email yang valid.' }),
  password: z.string().min(1, { message: 'Password harus diisi.' }),
});
