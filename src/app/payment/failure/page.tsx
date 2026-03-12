import Link from "next/link"

export default function PaymentFailurePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-600">Pago no completado</h1>
        <p className="text-gray-600">
          No pudimos confirmar tu pago. Puedes intentarlo nuevamente.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg bg-adaptia-blue-primary px-4 py-2 text-white"
        >
          Volver
        </Link>
      </div>
    </main>
  )
}