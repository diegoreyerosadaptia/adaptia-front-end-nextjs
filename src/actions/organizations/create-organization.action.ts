// actions/organizations/create-organization.action.ts
'use server';

import { organizationSchema, OrganizationSchemaType } from '@/schemas/organization.schema';
import { createOrganization as createOrganizationAPI } from '@/services/organization.service'

export async function createOrganizationAction(values: OrganizationSchemaType, authToken: string) {
  const parsed = organizationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const org = await createOrganizationAPI(parsed.data, authToken);

    if (!org) {
      return { error: 'Error al crear la organizacion' };
    }

    // 👇 devolvemos info útil para decidir siguiente paso en el cliente
    return {
      success: true,
      orgId: org.id,
      organization: org,
      claimToken: org.claimToken ?? null, // presente si fue “huérfana”
    };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear la organizacion' };
  }
}
