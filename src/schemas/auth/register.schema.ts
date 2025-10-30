import { USER_ROLES } from '@/types/user.type';
import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('El email no es válido'),
    firstName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede tener más de 50 caracteres').optional(),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede tener más de 50 caracteres').optional(),
    role: z.enum(USER_ROLES),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
      confirmPassword: z.string(),
    orgId: z.string().optional(),
    claimToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
