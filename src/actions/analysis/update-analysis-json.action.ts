'use server';

import { updateAnalysisJson as updateAnalysisJsonAPI } from '@/services/esg.service';

export async function updateAnalysisJsonAction(id: string, body: any,  accessToken: string) {
  try {
    const success = await updateAnalysisJsonAPI(id, body, accessToken);
    if (!success) {
      return { error: 'Error al actualizar analisis' };
    }
    return { success: 'Analisis actualizado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al actualizar analisis' };
  }
}
