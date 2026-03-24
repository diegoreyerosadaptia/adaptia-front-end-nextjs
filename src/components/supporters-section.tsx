import Image from "next/image"

export function SupportersSection() {
  return (
    <section className="p-20">
      <div className="max-w-xs mx-auto px-4">
        <div className="flex flex-col items-center gap-40">

          {/* CORFO — rotado 90° para que el texto quede en vertical */}
          <div style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}>
            <Image
              src="/logo_corfo2024_proyecto_apoyado_azul.jpg"
              alt="CORFO"
              width={150}
              height={66}
              className="w-auto duration-200"
            />
          </div>

          {/* UDD Ventures */}
          <div style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} className="flex flex-col items-center">
            <p className="pb-0 text-xs font-medium text-black tracking-wide uppercase">
              Acompañados por
            </p>
            <Image
              src="/udd-ventures-logo.webp"
              alt="UDD Ventures"
              width={100}
              height={40}
              className="w-auto p-0 duration-200"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
