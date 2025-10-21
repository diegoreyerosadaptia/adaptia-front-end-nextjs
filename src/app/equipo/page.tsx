import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SupportersSection } from "@/components/supporters-section"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Linkedin, ArrowLeft } from "lucide-react"

export default function EquipoPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="text-primary hover:text-primary/80">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">Equipo y metodología</h1>
          </div>

          {/* Mission */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-primary mb-6 text-center">Lo que buscamos</h2>
                <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto text-pretty">
                  Adaptia tiene como propósito facilitar el acceso a herramientas de sostenibilidad para cualquier
                  empresa, sin importar su tamaño o nivel de experiencia. Queremos que más organizaciones puedan tomar
                  decisiones informadas y accionables, sin depender de procesos largos o costosos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Methodology */}
          <Card className="bg-card border-gray-200 mb-16">
            <CardHeader>
              <CardTitle className="text-3xl text-center text-primary">Nuestra metodología</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                Usamos inteligencia artificial para analizar los datos proporcionados por cada organización, cruzándolos
                con estándares internacionales como GRI, SASB, GAIL, S&P y los ODS. A partir de esta base, identificamos
                impactos relevantes, priorizamos temas materiales y sugerimos una estrategia práctica y adaptada a la
                realidad de cada empresa. Nuestro objetivo es facilitar un primer paso claro, riguroso y accionable en
                sostenibilidad, sin procesos largos ni complejos.
              </p>
            </CardContent>
          </Card>

          {/* Team members */}
          <div className="mb-16">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center text-primary mb-8">Fundador</h2>
              <Card className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300 max-w-2xl mx-auto">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">DR</span>
                  </div>
                  <CardTitle className="text-2xl text-primary">Diego Reyeros</CardTitle>
                  <p className="text-primary font-semibold">Fundador</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4 text-pretty">
                    Especialista en ESG, empresas de triple impacto, innovación y sostenibilidad. Top Voice en LinkedIn
                    en Sostenibilidad y Fundador y Ex-Director de Makesense Américas.
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
                      <span className="text-4xl font-bold text-primary">AM</span>
                    </div>
                    <CardTitle className="text-2xl text-primary">Adriana Mata</CardTitle>
                    <p className="text-primary font-semibold">Consejera y socia</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Directora y Co-fundadora de Agile Impacts y Cuantix, ingeniera y experta en medición de impacto y
                      tecnología para sostenibilidad. Cartier Women's Initiative Fellow.
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
                      <span className="text-4xl font-bold text-primary">PM</span>
                    </div>
                    <CardTitle className="text-2xl text-primary">Paulina Macias</CardTitle>
                    <p className="text-primary font-semibold">Consejera - Sostenibilidad corporativa</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Directora de Sostenibilidad en Chevez Ruiz Zamarripa, Co-host de Inercia Podcast y Top Voice de
                      LinkedIn en Sostenibilidad.
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
                      <span className="text-4xl font-bold text-primary">SI</span>
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
                      <span className="text-4xl font-bold text-primary">AV</span>
                    </div>
                    <CardTitle className="text-2xl text-primary">Antonio Vizcaya</CardTitle>
                    <p className="text-primary font-semibold">Consejero - Estándares ASG</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4 text-pretty">
                      Strategy Manager en 17 Sport, Profesor de Sostenibilidad Corporativa en la UNAM y Top Voice de
                      LinkedIn en Sostenibilidad.
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
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/formulario">Solicitar análisis</Link>
            </Button>
          </div>
        </div>
      </div>

      <SupportersSection />
      <Footer />
    </main>
  )
}
