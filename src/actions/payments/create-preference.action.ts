'use server';



import { paymentSchema, PaymentSchemaType } from '@/schemas/payment.schema';
import { mercadopagoPayment as mercadopagoPaymentAPI } from '@/services/payment.service';

export async function createPreferenceAction(values: PaymentSchemaType) {
  const validatedFields = paymentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const payment = await mercadopagoPaymentAPI(validatedFields.data);

    if (!payment?.checkoutUrl || !payment?.sandboxUrl ) {
      return { error: 'Error al obtener link de pago' };
    }
    return {
      success: true,
      url: payment.sandboxUrl,
    };
  } catch (error) {
    console.error(error);
    return { error: 'Error al procesar el pago' };
  }
}
