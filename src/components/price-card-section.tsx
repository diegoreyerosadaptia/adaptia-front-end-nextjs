"use client"

export function PricingByEmployeesSection() {
  const cards = [
    // ✅ escalera más alta
    { pill: "1 - 9 empleados", title: "Empresas\nmicro", price: "$200", lift: "md:translate-y-14" },
    { pill: "10-99 empleados", title: "Empresas\npequeñas", price: "$400", lift: "md:translate-y-8" },
    { pill: "100 - 499 empleados", title: "Empresas\nmedianas", price: "$800", lift: "md:translate-y-2" },
    { pill: "500-1000 empleados", title: "Empresas\nnacionales", price: "$1,200", lift: "md:-translate-y-4" },
    { pill: "1000-5000 empleados", title: "Empresas\nregionales", price: "$1,400", lift: "md:-translate-y-8" },
    { pill: "5000 - 10,000 empleados", title: "Empresas\ninternacionales", price: "$1,600", lift: "md:-translate-y-12" },
    { pill: "+10,000 empleados", title: "Empresas multi\nnacionales\nmasivas", price: "$2,000", lift: "md:-translate-y-16" },
  ]

  return (
    <section className="w-full bg-[#CFE2E1] py-19 md:py-25" style={{ backgroundColor: "#C2DA62" }}>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
        {/* ✅ más compacto para que entren 7 */}
        <div className="flex flex-wrap pt-10 justify-center items-end gap-4 md:gap-5">
          {cards.map((c, idx) => (
            <div
              key={idx}
              className={[
                "relative rounded-[24px] bg-white",
                "shadow-[0_10px_26px_rgba(11,47,74,0.12)]",
                "border border-[#D7EAED] overflow-hidden",
                "h-[250px] md:h-[270px]",
                "px-4 md:px-5 py-7 md:py-8",
                "w-[180px] sm:w-[180px] md:w-[180px] lg:w-[180px]",
                c.lift,
                "transition-all duration-300 ease-out",
                "hover:-translate-y-2 hover:shadow-[0_16px_34px_rgba(11,47,74,0.16)]",
              ].join(" ")}
            >
              {/* ✅ pill centrado */}
              <div className="absolute left-1/2 -translate-x-1/2 top-4">
                <div className="inline-flex justify-center text-center rounded-full bg-[#0B2F4A] px-3 py-1.5 text-white font-semibold text-[10px] md:text-[9px] shadow-[0_6px_14px_rgba(88,180,200,0.35)]">
                  {c.pill}
                </div>
              </div>

              <div className="pt-12">
                <h3
                  className="text-[#0B2F4A] font-extrabold leading-[1.08] tracking-tight text-[15px] sm:text-[16px] md:text-[17px]"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {c.title}
                </h3>

                <div className="mt-7">
                  <p className="text-[#0B2F4A] font-semibold text-[11px] md:text-xs opacity-90">
                    Precio USD:
                  </p>

                  {/* ✅ monto en verde */}
                  <p className="text-[#2E7D32] font-extrabold text-[12px] md:text-sm">
                    {c.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* espacio por escalera */}
        <div className="h-10 md:h-12" />
      </div>
    </section>
  )
}