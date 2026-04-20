'use server'

import { addMemberToOrg } from '@/services/organization.service'

export async function addMemberAction(orgId: string, userId: string, authToken: string) {
  try {
    const result = await addMemberToOrg(orgId, userId, authToken)
    if (!result) return { error: 'No se pudo agregar el miembro' }
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al agregar miembro' }
  }
}
