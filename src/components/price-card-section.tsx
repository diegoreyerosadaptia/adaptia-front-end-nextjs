"use client"

export function PricingByEmployeesSection() {
  return (
    <section className="w-full bg-[#CFE2E1] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FILA 1 */}
        <div className="grid gap-8 md:grid-cols-3 items-end">
          {/* Empresas micro */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]", // ✅ menos altura
              "px-8 md:px-10 py-10 md:py-12",
              // ✅ hover movimiento
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-2 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                1 - 9 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\nmicro"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$200</p>
              </div>
            </div>
          </div>

          {/* Empresas pequeñas */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]", // ✅ menos altura
              "px-8 md:px-10 py-10 md:py-12",
              "md:-translate-y-5",
              // ✅ hover movimiento
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-7 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                10-99 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\npequeñas"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$400</p>
              </div>
            </div>
          </div>

          {/* Empresas medianas */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]", // ✅ menos altura
              "px-8 md:px-10 py-10 md:py-12",
              "md:-translate-y-8",
              // ✅ hover movimiento
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-10 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                100 - 499 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\nmedianas"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$800</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10 md:h-16" />

        {/* FILA 2 */}
        <div className="grid gap-8 md:grid-cols-4 items-end">
          {/* Empresas nacionales */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]",
              "px-8 md:px-10 py-10 md:py-12",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-2 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                500-1000 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\nnacionales"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$1,200</p>
              </div>
            </div>
          </div>

          {/* Empresas regionales */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]",
              "px-8 md:px-10 py-10 md:py-12",
              "md:-translate-y-5",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-7 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                1000-5000 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\nregionales"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$1,400</p>
              </div>
            </div>
          </div>

          {/* Empresas internacionales */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]",
              "px-8 md:px-10 py-10 md:py-12",
              "md:-translate-y-8",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-10 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                5000 - 10,000 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas\ninternacionales"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$1,600</p>
              </div>
            </div>
          </div>

          {/* Empresas multi nacionales masivas */}
          <div
            className={[
              "relative rounded-[28px] bg-[#EAF6F6]",
              "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
              "border border-[#D7EAED] overflow-hidden",
              "min-h-[300px] md:min-h-[380px]",
              "px-8 md:px-10 py-10 md:py-12",
              "md:-translate-y-10",
              "transition-transform duration-300 ease-out",
              "hover:-translate-y-12 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
            ].join(" ")}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-7">
              <div className="rounded-full bg-[#58B4C8] px-6 py-2 text-white font-semibold text-sm md:text-base shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                +10,000 empleados
              </div>
            </div>

            <div className="pt-16 md:pt-20">
              <h3
                className="text-[#0B2F4A] font-extrabold leading-[1.05] tracking-tight text-[40px] md:text-[48px] lg:text-[52px]"
                style={{ whiteSpace: "pre-line" }}
              >
                {"Empresas multi\nnacionales\nmasivas"}
              </h3>

              <div className="mt-12 md:mt-16">
                <p className="text-[#0B2F4A] font-semibold text-lg md:text-xl opacity-90">Precio USD:</p>
                <p className="text-[#0B2F4A] font-extrabold text-4xl md:text-5xl">$2,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}