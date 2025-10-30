'use server';

import {
  registerSchema,
  RegisterSchemaType,
} from '@/schemas/auth/register.schema';
import { registerUser } from '@/services/auth.service';


export async function registerAction({
  values,
  isVerified,
}: {
  values: RegisterSchemaType;
  isVerified: boolean;
}) {
  try {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return { error: 'Invalid fields' };
    }

    const { email, password, role, orgId, claimToken } =
      validatedFields.data;

    const userData = {
      email,
      password,
      role,
      orgId,
      claimToken
    };

    const user = await registerUser(userData);

    if ('error' in user) {
        return { error: user.error };
      }
      

    if (!user) {
      return { error: 'Error al crear usuario' };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al registrar usuario' };
  }
}
