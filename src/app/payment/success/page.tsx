import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-green-600">Pago recibido</h1>
        <p className="text-gray-600">
          Tu pago fue registrado correctamente. Ya estamos preparando tu análisis.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded-lg bg-adaptia-blue-primary px-4 py-2 text-white"
        >
          Ir al dashboard
        </Link>
      </div>
    </main>
  )
}