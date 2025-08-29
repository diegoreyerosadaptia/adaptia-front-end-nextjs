import Image from "next/image"

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with brand colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#013f6e] via-[#4333a0] to-[#49a333] opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ae4abc]/20 via-transparent to-[#013f6e]/30"></div>

      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-[#49a333]/20 blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-[#013f6e]/20 blur-xl"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 rounded-full bg-[#ae4abc]/15 blur-lg"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGOS_Adaptia_Final-01-W9Ppp6bwfKOw0Iu3qFSgQVyoGPp83N.png"
            alt="Adaptia Logo"
            width={400}
            height={200}
            className="mx-auto"
            priority
          />
        </div>

        {/* Main message */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#013f6e] leading-tight text-balance">
            ¡Hola! Estamos construyendo el futuro de la sostenibilidad corporativa.
          </h1>

          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed text-pretty">
              Pronto podrás generar un análisis de doble materialidad ESG y una estrategia de sostenibilidad para tu
              empresa en <span className="font-semibold text-[#49a333]">24 horas</span> con Adaptia.
            </p>
          </div>

          {/* Contact section */}
          <div className="mt-12 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#013f6e]/20 shadow-lg">
            <p className="text-lg text-gray-600 mb-4">Si quieres ser de los primeros usuarios, escríbenos a:</p>
            <a
              href="mailto:diego@adaptianow.com"
              className="inline-flex items-center gap-2 text-xl font-semibold text-[#013f6e] hover:text-[#49a333] transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                />
              </svg>
              diego@adaptianow.com
            </a>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-semibold text-[#013f6e] mb-6">Nos apoyan</h2>
            <div className="flex items-center justify-center gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <Image
                  src="/corfo-logo.png"
                  alt="CORFO"
                  width={120}
                  height={60}
                  className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="/udd-ventures-logo.webp"
                  alt="UDD Ventures"
                  width={140}
                  height={40}
                  className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#49a333] rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-[#013f6e] rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-[#ae4abc] rounded-full animate-pulse delay-200"></div>
            </div>
            <span className="text-sm text-gray-500 font-medium">En construcción</span>
          </div>
        </div>
      </div>
    </div>
  )
}
