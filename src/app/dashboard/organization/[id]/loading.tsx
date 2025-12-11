import Image from "next/image"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-adaptia-blue-primary/10 via-white to-adaptia-green-primary/10">
      <div className="flex flex-col items-center gap-6 px-4 text-center">
        <Image
          src="/adaptia-logo.png"
          alt="Adaptia"
          width={260}
          height={80}
          className="w-64 h-auto animate-pulse"
          priority
        />

        {/* Loader “casero” */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-adaptia-blue-primary border-t-transparent animate-spin" />
          <span className="text-xl font-semibold text-adaptia-blue-primary">
            Cargando análisis ESG...
          </span>
        </div>

        <p className="max-w-md text-sm text-adaptia-blue-primary/80">
          Estamos preparando el análisis completo de doble materialidad de esta organización.
          Esto puede tomar solo unos segundos.
        </p>
      </div>
    </div>
  )
}
