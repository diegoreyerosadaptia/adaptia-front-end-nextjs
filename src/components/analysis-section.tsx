import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Target, BarChart, Lightbulb, PhoneCall } from "lucide-react"

export function AnalysisSection() {
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Contexto base de tu organización",
      description: "Una lectura inicial de cómo tu empresa impacta y se ve impactada por aspectos ESG (ambientales, sociales y de gobernanza). Incluye riesgos y oportunidades de negocio",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Métricas recomendadas: ",
      description: "Sugerencias de métricas ESG con las que puedes medir tus impactos. Incluye referencias a los marcos de: SASB, GRI, ODS y S&P.",
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Priorización de impactos clave ",
      description: "Identificamos los 10 temas más relevantes para tu empresa con un enfoque de doble materialidad (financiera y de sostenibilidad). Recibirás una matriz de doble materialidad ESG. ",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Ruta de sostenibilidad ",
      description: "Un plan de acción con sugerencias iniciales, moderadas y estructurales para fortalecer tus 10 temas prioritarios.",
    },
        {
      icon: <PhoneCall className="w-8 h-8" />,
      title: "Llamada de interpretación",
      description: "Una llamada complementaria con uno de nuestros expertos en sostenibilidad para ayudarte a interpretar los resultados de tu análisis.",
    },
  ]

  return (
    <section id="que-incluye" className="py-20 relative bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-adaptia-blue-primary mb-6 text-balance">¿Qué incluye tu análisis?</h2>
          <p className="text-lg text-adaptia-blue-primary/70 max-w-4xl mx-auto text-pretty font-heading">
          Cuando tu análisis esté listo recibirás un dashboard interactivo con:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="card-brand hover:shadow-adaptia-lg transition-all duration-500 transform hover:-translate-y-1 group">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-adaptia-blue-primary/10 to-adaptia-green-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <div className="text-adaptia-blue-primary group-hover:text-adaptia-green-primary transition-colors duration-300">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl text-adaptia-blue-primary text-balance group-hover:text-adaptia-green-primary transition-colors duration-300 font-heading">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-adaptia-blue-primary/70 text-pretty leading-relaxed font-heading">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced visual separator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-adaptia-gray-light to-transparent"></div>
          <div className="mx-4 w-3 h-3 bg-adaptia-green-primary rounded-full"></div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-adaptia-gray-light to-transparent"></div>
        </div>
      </div>
    </section>
  )
}
