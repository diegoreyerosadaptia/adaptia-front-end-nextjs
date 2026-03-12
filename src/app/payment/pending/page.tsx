import Link from "next/link"

export default function PaymentPendingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-yellow-600">Pago pendiente</h1>
        <p className="text-gray-600">
          Tu pago todavía está siendo procesado. Te avisaremos cuando quede confirmado.
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