'use server';

import {
  registerSchema,
  RegisterSchemaType,
} from '@/schemas/auth/register.schema';
import { registerUser } from '@/services/auth.service';
import { claimOrg } from '@/services/organization.service'; // 👈 importa el helper

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

    const { email, password, role, orgId, claimToken } = validatedFields.data;

    const userData = {
      email,
      password,
      role,
      orgId,
      claimToken,
      // si usás isVerified en tu backend, lo podés pasar también
      // isVerified,
    };

    const user = await registerUser(userData);

    if ('error' in user) {
      return { error: user.error };
    }

    if (!user) {
      return { error: 'Error al crear usuario' };
    }

    // ✅ Si viene orgId + claimToken, reclamamos la organización
    if (orgId && claimToken) {
      try {
        await claimOrg(user.id, orgId, claimToken);
        console.log(
          `✅ Organización ${orgId} reclamada correctamente con token ${claimToken}`,
        );
      } catch (err) {
        console.error('❌ Error al reclamar organización:', err);
        // si querés que esto corte el registro, podrías hacer:
        // return { error: 'Error al vincular la organización al usuario' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al registrar usuario' };
  }
}
