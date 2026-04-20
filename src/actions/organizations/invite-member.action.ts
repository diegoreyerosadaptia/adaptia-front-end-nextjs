'use server'

import { inviteMemberByEmail } from '@/services/organization.service'

export async function inviteMemberAction(orgId: string, email: string, authToken: string) {
  try {
    const result = await inviteMemberByEmail(orgId, email, authToken)
    if (!result) return { error: 'No se pudo enviar la invitación' }
    return { success: true, status: result.status }
  } catch (error) {
    console.error(error)
    return { error: 'Error al enviar invitación' }
  }
}
