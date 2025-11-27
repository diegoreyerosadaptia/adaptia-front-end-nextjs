// actions/organizations/create-organization.action.ts
'use server';

import { cuponSchema, CuponSchemaType } from '@/schemas/cupon.schema';
import { createCoupon as createCouponAPI } from '@/services/cupon.service'

export async function createCouponAction(values: CuponSchemaType, authToken?: string) {
  const parsed = cuponSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const org = await createCouponAPI(parsed.data);

    if (!org) {
      return { error: 'Error al crear cupon' };
    }

    // 👇 devolvemos info útil para decidir siguiente paso en el cliente
    return org;
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear la organizacion' };
  }
}
