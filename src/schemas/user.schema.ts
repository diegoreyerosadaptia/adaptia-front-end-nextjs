import { USER_ROLES } from '@/types/user.type';
import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email('El email no es válido'),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres').optional(),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres').optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional(),
  emailVerified: z.string().optional(),
  role: z.enum(USER_ROLES),
});
export type UserSchemaType = z.infer<typeof userSchema>;

export const deleteUserSchema = z.object({
  email: z
    .string()
    .email('El email no es válido')
    .min(1, 'El email es requerido'),
  confirmation: z.string().min(1, 'Ingrese la confirmación "Eliminar Usuario"'),
});
export type DeleteUserSchemaType = z.infer<typeof deleteUserSchema>;

export const updateProfileSchema = z.object({
  email: z.string().email('El email no es válido'),
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .optional(),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .optional(),
  username: z.string().min(1, 'El nombre de usuario es requerido').optional(),
  empresaId: z.string().nonempty('El campo es requerido'),
  role: z.enum(USER_ROLES),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .optional()
});
export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;

export const updateProfilePassword = z
  .object({
    currentPassword: z.string().min(8, {
      message: 'La contrasena debe tener al menos 8 caracteres',
    }),
    newPassword: z.string().min(8, {
      message: 'La contrasena debe tener al menos 8 caracteres',
    }),
    repeatNewPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  })
  .refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatNewPassword'],
  });
export type UpdateProfilePasswordType = z.infer<typeof updateProfilePassword>;
