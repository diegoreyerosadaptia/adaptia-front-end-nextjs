import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-combo-blue-green py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left side - LinkedIn button */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="text-white text-lg font-heading font-semibold">
              Conecta con nosotros
            </h3>
            <Button
              asChild
              className="bg-white text-adaptia-blue-primary hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 px-6 py-3"
            >
              <a
                href="https://www.linkedin.com/company/adaptianow/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Síguenos en LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
            </Button>
          </div>

          {/* Right side - Logo and copyright */}
          <div className="flex flex-col items-center md:items-end">
            <div className="relative w-24 h-24">
              <Image
                src="/LOGOS_Adaptia_Final-08.png"
                alt="Adaptia Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/80 text-sm font-heading">
                © {new Date().getFullYear()} Adaptia. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
