'use server';

import { createClient } from "@/lib/supabase/server";
import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from "@/schemas/auth/reset-password.schema";

export async function resetPasswordAction(values: ResetPasswordSchemaType) {
  try {
    const validatedForm = resetPasswordSchema.safeParse(values);

    if (!validatedForm.success) {
      return { error: "Email no válido" };
    }

    const emailNormalized = validatedForm.data.email.trim().toLowerCase();

    const supabase = await createClient();

    const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
    const redirectTo = `${base}/auth/new-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(emailNormalized, {
      redirectTo,
    });

    if (error) {
      console.error("Supabase resetPasswordForEmail error:", error);
      return { error: "Error al procesar la solicitud" };
    }

    return {
      success: "Te enviamos un enlace de recuperación.",
    };
  } catch (error) {
    console.error("Error al resetear la contraseña:", error);
    return { error: "Error inesperado" };
  }
}