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

    const { email } = validatedForm.data;

    const supabase = await createClient();
    if (!supabase) {
        return { error: { message: "Supabase no configurado" } };
      }

    // ✅ 1) Chequeo de usuario en tu tabla local
    // Cambiá "users" y/o el campo si tu esquema es distinto
    const { data: existingUser, error: userErr } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("Error buscando usuario local:", userErr);
      return { error: "Error al verificar el usuario" };
    }

    if (!existingUser) {
      return { error: "No se encontró un usuario con ese email" };
    }

    // ✅ 2) Envío email Supabase
    const redirectTo =
    "https://adaptia-front-end-nextjs.vercel.app/auth/new-password"
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
    if (error) {
      console.error("Supabase resetPasswordForEmail error:", error);
      return { error: "Error al enviar el email de recuperación" };
    }

    return {
      success: "Email de recuperación enviado. Revisa tu bandeja de entrada.",
    };
  } catch (error) {
    console.error("Error al resetear la contraseña:", error);
    return { error: "Error inesperado" };
  }
}
