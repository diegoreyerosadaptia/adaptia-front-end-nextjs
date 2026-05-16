"use server"

import { adminResetUserPassword } from "@/services/users.service"

export async function adminResetPasswordAction(
  userId: string,
  newPassword: string,
  repeatNewPassword: string,
  accessToken?: string,
) {
  try {
    return await adminResetUserPassword(userId, newPassword, repeatNewPassword, accessToken)
  } catch (error) {
    console.error(error)
    return { error: "Error inesperado al restablecer la contraseña" }
  }
}
