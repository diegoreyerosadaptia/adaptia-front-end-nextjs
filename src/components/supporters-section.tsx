import Image from "next/image"

export function SupportersSection() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-primary mb-12">Nos apoyan</h2>
        <div className="flex items-center justify-center gap-12 md:gap-16">
          <div className="flex-shrink-0">
            <Image
              src="/corfo-logo.png"
              alt="CORFO"
              width={350}
              height={220}
              className="h-35 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
          <div className="flex-shrink-0">
            <Image
              src="/udd-ventures-logo.webp"
              alt="UDD Ventures"
              width={180}
              height={50}
              className="h-25 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
