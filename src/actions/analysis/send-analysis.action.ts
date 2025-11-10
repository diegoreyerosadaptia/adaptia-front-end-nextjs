'use server';

import { sendAnalysis as sendAnalysisAPI } from '@/services/organization.service';

export async function sendAnalysisAction(id: string, accessToken: string) {
  try {
    const success = await sendAnalysisAPI(id, accessToken);
    if (!success) {
      return { error: 'Error al enviar analisis' };
    }
    return { success: 'Analisis enviado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al enviar analisis' };
  }
}
