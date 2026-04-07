import Image from "next/image"

export function SupportersSection() {
  return (
    <section className="p-20">
      <div className="max-w-100 mx-auto px-4">
        <div className="flex flex-row items-center justify-center gap-16 flex-wrap">
          
          {/* CORFO */}
          <div className="flex items-center justify-center">
            <Image
              src="/logo_corfo2024_proyecto_apoyado_azul.jpg"
              alt="CORFO"
              width={110}
              height={36}
              className="w-auto h-auto duration-200"
            />
          </div>

          {/* UDD Ventures */}
          <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-lg font-semibold text-black tracking-wide uppercase">
              Acompañados por
            </p>
            <Image
              src="/udd-ventures-logo.webp"
              alt="UDD Ventures"
              width={50}
              height={40}
              className="w-auto h-auto duration-200"
            />
          </div>

        </div>
      </div>
    </section>
  )
}