'use server';

import { deleteOrganization as deleteOrganizationAPI } from '@/services/organization.service';

export async function ddeleteOrganizationAction(id: string, accessToken: string) {
  try {
    const success = await deleteOrganizationAPI(id, accessToken);
    if (!success) {
      return { error: 'Error al eliminar la organizacion' };
    }
    return { success: 'Organizacion eliminada exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar la organizacion' };
  }
}
