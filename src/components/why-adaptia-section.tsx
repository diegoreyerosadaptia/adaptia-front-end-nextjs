import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, Scale, FileX, Clock } from "lucide-react"

export function WhyAdaptiaSection() {
  const stats = [
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Greenwashing",
      stat: "+50%",
      description:
        "de las empresas que reportan ESG solo publican datos positivos, generando desconfianza en el mercado.",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      statColor: "text-red-700",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Negocios y ESG",
      stat: "70%",
      description: "de las 500 empresas más grandes reportan criterios ESG, frente a solo 15% de las PYMES.",
      bgColor: "bg-adaptia-blue-light/10",
      borderColor: "border-adaptia-blue-light",
      iconColor: "text-adaptia-blue-primary",
      statColor: "text-adaptia-blue-primary",
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: "Regulación en LATAM",
      stat: "30%",
      description:
        "de los reguladores financieros en la región ya exigen reportes ESG. Países como Colombia, México y Chile ya cuentan con taxonomías verdes activas.",
      bgColor: "bg-adaptia-green-light/10",
      borderColor: "border-adaptia-green-light",
      iconColor: "text-adaptia-green-primary",
      statColor: "text-adaptia-green-primary",
    },
    {
      icon: <FileX className="w-8 h-8" />,
      title: "Complejidad técnica",
      stat: "+600",
      description: "marcos de reporte ESG existen actualmente, creando confusión y complejidad para las empresas.",
      bgColor: "bg-adaptia-yellow/10",
      borderColor: "border-adaptia-yellow",
      iconColor: "text-adaptia-green-dark",
      statColor: "text-adaptia-green-dark",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Barrera de entrada",
      stat: "$20,000 USD",
      description:
        "Es el costo promedio inicial para un estudio de doble materialidad. Un paso complejo, lento y costoso.",
      bgColor: "bg-adaptia-gray-light/20",
      borderColor: "border-adaptia-gray-medium",
      iconColor: "text-adaptia-green-medium",
      statColor: "text-adaptia-green-medium",
    },
  ]

  return (
    <section id="por-que-adaptia" className="py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-adaptia-blue-primary mb-6 text-balance font-sans">¿Por qué Adaptia?</h2>
          <p className="text-xl text-adaptia-blue-primary/80 max-w-3xl mx-auto text-pretty font-sans">
            Deja atrás el greenwashing. Toma decisiones con datos.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {stats.map((item, index) => (
            <Card
              key={index}
              className="card-brand hover:shadow-adaptia-lg transition-all duration-500 transform hover:-translate-y-2 group w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-adaptia-blue-primary/10 to-adaptia-green-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <div className="text-adaptia-blue-primary group-hover:text-adaptia-green-primary transition-colors duration-300">{item.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-adaptia-blue-primary text-lg mb-2">{item.title}</h3>
                    <div className="text-4xl font-bold text-adaptia-green-primary mb-3">{item.stat}</div>
                  </div>
                </div>
                <p className="text-adaptia-blue-primary/70 text-pretty leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
