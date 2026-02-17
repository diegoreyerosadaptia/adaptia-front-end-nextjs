import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SupportersSection } from "@/components/supporters-section"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Linkedin, ArrowLeft } from "lucide-react"
import Image from "next/image"

export default function EquipoPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mt-10 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">Sobre nosotros</h1>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-primary mb-6 text-center">
                  Lo que buscamos
                </h2>

                <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto text-pretty">
                  En Adaptia tenemos como propósito facilitar el acceso a herramientas de sostenibilidad para cualquier empresa, sin importar su tamaño o nivel de experiencia. Buscamos transformar un proceso tradicionalmente complejo, técnico y costoso en una experiencia clara, objetiva y accesible, impulsada por inteligencia artificial.
                  <br /><br />
                  Nuestra visión es que más organizaciones en Latinoamérica puedan tomar decisiones informadas y accionables en sostenibilidad desde etapas tempranas, sin depender exclusivamente de procesos largos o consultorías inaccesibles. Creemos que la sostenibilidad no debe ser un privilegio de grandes corporativos, sino una infraestructura disponible para todas las empresas que quieran crecer con impacto y responsabilidad.
                  <br /><br />
                  Puedes leer más de nuestra visión en este artículo escrito por TECHLA.
                </p>

                {/* ✅ Imagen centrada + link debajo */}
                <div className="mt-8 flex flex-col items-center">
                  <a
                    href="https://techla.pro/2026/01/08/adaptia-la-nueva-plataforma-que-busca-democratizar-la-sostenibilidad-empresarial-con-ia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full max-w-5xl"
                  >
                    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <Image
                        src="/articulo.png"
                        alt="Artículo de TECHLA sobre Adaptia"
                        width={1600}
                        height={800}
                        className="w-full h-auto"
                        priority={false}
                      />
                    </div>
                  </a>

                  <a
                    href="https://techla.pro/2026/01/08/adaptia-la-nueva-plataforma-que-busca-democratizar-la-sostenibilidad-empresarial-con-ia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80 text-center"
                  >
                    Leer el artículo en TECHLA →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team members */}
          <div className="mb-16">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-primary mb-8">Equipo</h2>
              <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300 max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                      src="/Foto-perfil-Diego-2025.jpg"
                      alt="Foto de Diego Reyeros"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  </div>
                  <CardTitle className="text-2xl text-primary">Diego Reyeros</CardTitle>
                  <p className="text-primary font-semibold">Fundador</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4 text-pretty">
                  Especialista en ESG, empresas de triple impacto, innovación y sostenibilidad. Top Voice en LinkedIn en Sostenibilidad y Co-fundador y Ex-Director de Makesense Américas. 
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 mx-auto bg-transparent"
                    asChild
                  >
                    <Link href="https://www.linkedin.com/in/diego-reyeros/" target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-center text-primary mb-8">Nuestro consejo consultivo</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                        <img
                          src="/Foto-perfil-Adriana.jpeg"
                          alt="Foto de Adriana Mata"
                          className="w-full h-full object-cover"
                        />
                      </div>

                    </div>
                    <CardTitle className="text-2xl text-primary">Adriana Mata</CardTitle>
                    <p className="text-primary font-semibold">Consejera y socia</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                    Directora y Co-fundadora de Agile Impacts y Cuantix, ingeniera y experta en medición de impacto y tecnología para sostenibilidad. Cartier Women's Initiative Fellow.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-transparent"
                      asChild
                    >
                      <Link href="https://www.linkedin.com/in/adrianamata/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                          src="/Foto-Perfil-Pau.jpeg"
                          alt="Foto de Adriana Mata"
                          className="w-full h-50 object-cover"
                        />
                    </div>
                    </div>
                    <CardTitle className="text-2xl text-primary">Paulina Macias</CardTitle>
                    <p className="text-primary font-semibold">Consejera - Sostenibilidad corporativa</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                    Directora de Sostenibilidad en Chevez Ruiz Zamarripa, Co-host de Inercia Podcast y Top Voice de LinkedIn en Sostenibilidad. 
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-transparent"
                      asChild
                    >
                      <Link
                        href="https://www.linkedin.com/in/paulinamaciasromero/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                      <img
                        src="/Foto-perfil-Slaven.jpeg"
                        alt="Foto de Slaven Ilic"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    </div>
                    <CardTitle className="text-2xl text-primary">Saven Ilic</CardTitle>
                    <p className="text-primary font-semibold">Consejero - Relaciones con inversionistas</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">Investor Relations en Sigdo Koppers</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-transparent"
                      asChild
                    >
                      <Link href="https://www.linkedin.com/in/slavenilic/" target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                      <img
                        src="/Foto-perfil-Antonio.jpg"
                        alt="Foto de Slaven Ilic"
                        className="w-full h-50 object-cover"
                      />
                    </div>

                    </div>
                    <CardTitle className="text-2xl text-primary">Antonio Vizcaya</CardTitle>
                    <p className="text-primary font-semibold">Consejero - Estándares ASG</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                    Strategy Manager en 17 Sport, Profesor de Sostenibilidad Corporativa en la UNAM y Top Voice de LinkedIn en Sostenibilidad. 
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-transparent"
                      asChild
                    >
                      <Link
                        href="https://www.linkedin.com/in/antonio-vizcaya-abdo-5773769b/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                        src="/Foto-Leslie-2.png"
                        alt="Foto de Slaven Ilic"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    </div>
                    <CardTitle className="text-2xl text-primary">Leslie Lamadrid</CardTitle>
                    <p className="text-primary font-semibold">Consejera - Comunicación Corporativa</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                    Directora de Comunicación, Veolia México. 
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 mx-auto bg-transparent"
                      asChild
                    >
                      <Link
                        href="https://www.linkedin.com/in/leslie-lamadrid-communication/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

        </div>
      </div>

      <SupportersSection />
      <Footer />
    </main>
  )
}
