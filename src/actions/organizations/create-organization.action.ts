'use server';

import { organizationSchema, OrganizationSchemaType } from '@/schemas/organization.schema';
import { createOrganization as createOrganizationAPI } from '@/services/organization.service'

export async function createOrganizationAction(values: OrganizationSchemaType) {
  const validatedFields = organizationSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const note = await createOrganizationAPI(validatedFields.data);

    if (!note) {
      return { error: 'Error al crear la organizacion' };
    }
    return { success: 'organizacion creada exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear la organizacion' };
  }
}
