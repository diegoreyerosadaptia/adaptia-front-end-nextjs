'use server';


import { UpdateOrganizationSchemaType } from '@/schemas/organization.schema';
import { updateOrganization as updateOrganizationAPI } from '@/services/organization.service'

export async function updateOrganizationAction(
  id: string,
  values: Partial<UpdateOrganizationSchemaType>,
  authToken: string
) {
  try {
    const success = await updateOrganizationAPI(id, values, authToken);
    if (!success) {
      return { error: 'Error al editar organizacion' };
    }
    return { success: 'organizacion editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar organizacion' };
  }
}
