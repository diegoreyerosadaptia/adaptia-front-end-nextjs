'use server';

import { updateStatusPaymentAnalysis as updateStatusPaymentAnalysisAPI } from '@/services/organization.service';

export async function updateStatusPaymentAnalysisAction(id: string, accessToken: string) {
  try {
    const success = await updateStatusPaymentAnalysisAPI(id, accessToken);
    if (!success) {
      return { error: 'Error al actualizar analisis' };
    }
    return { success: 'Analisis actualizado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al actualizar analisis' };
  }
}
