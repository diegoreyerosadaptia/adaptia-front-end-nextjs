import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Rocket, Users, HandHeart, Briefcase } from "lucide-react"

export function TargetAudienceSection() {
  const audiences = [
    {
      icon: <Building className="w-8 h-8" />,
      title: "Empresas grandes",
      description:
        "Que quieren acelerar sus rutas ESG o aplicarlas también a proveedores de su cadena de valor.",
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Startups y scaleups",
      description:
        "Que necesitan mostrar una ruta de sostenibilidad clara para levantar inversión.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Empresas chicas y medianas",
      description:
        "Que deben cumplir con requerimientos de sostenibilidad exigidos por sus clientes grandes.",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Consultoras de sostenibilidad",
      description:
        "Que buscan eficientar el primer paso de análisis para sus clientes corporativos.",
    },
    {
      icon: <HandHeart className="w-8 h-8" />,
      title: "Organizaciones de apoyo",
      description:
        "Como cámaras empresariales, agencias de desarrollo, aceleradoras y fondos de inversión que acompañan a empresas en procesos de cumplimiento y crecimiento sostenible.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 text-balance">
            ¿Para quién está diseñado Adaptia?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {audiences.map((audience, index) => {
            const isLast = index === audiences.length - 1
            const isOdd = audiences.length % 2 !== 0

            return (
              <Card
                key={index}
                className={`bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300 ${
                  isLast && isOdd ? "md:col-span-2 md:max-w-md md:mx-auto" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      <div className="text-primary">{audience.icon}</div>
                    </div>
                    <CardTitle className="text-xl text-card-foreground">
                      {audience.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-pretty">
                    {audience.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
