'use server'

import { removeMemberFromOrg } from '@/services/organization.service'

export async function removeMemberAction(orgId: string, userId: string, authToken: string) {
  try {
    const result = await removeMemberFromOrg(orgId, userId, authToken)
    if (!result) return { error: 'No se pudo eliminar el miembro' }
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al eliminar miembro' }
  }
}
