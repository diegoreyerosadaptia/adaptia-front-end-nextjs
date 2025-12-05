'use server';

import { createClient } from "@/lib/supabase/server";
import {
  newPasswordSchema,
  NewPasswordSchemaType,
} from "@/schemas/auth/new-password.schema";

export async function newPasswordAction(values: NewPasswordSchemaType) {
  try {
    const parsed = newPasswordSchema.safeParse(values);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0];

      return {
        error: {
          code: "VALIDATION_ERROR",
          message: firstError?.message ?? "Datos inválidos",
          field: firstError?.path?.[0],
        },
      };
    }

    const { password } = parsed.data;

    const supabase = await createClient();
      if (!supabase) {
        return { error: { message: "Supabase no configurado" } };
      }



    // 👇 Recomendado: opcionalmente validar que haya usuario en sesión
    const { data: userData, error: userErr } = await supabase.auth.getUser();

    if (userErr || !userData?.user) {
      return {
        error: {
          code: "NO_RECOVERY_SESSION",
          message:
            "Sesión de recuperación no válida o expirada. Volvé a solicitar el email de recuperación.",
        },
      };
    }

    const res = await supabase.auth.updateUser({
      password,
    });

    if (res.error) {
      return {
        error: {
          code: res.error.name ?? "UPDATE_PASSWORD_ERROR",
          message:
            res.error.message ?? "No se pudo actualizar la contraseña",
        },
      };
    }

    return {
      success: "✅ Contraseña actualizada correctamente",
    };
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: "Error inesperado",
      },
    };
  }
}
