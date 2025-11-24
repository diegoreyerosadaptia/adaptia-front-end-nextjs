import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Target, BarChart, Lightbulb } from "lucide-react"

export function AnalysisSection() {
  const features = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Contexto base de tu organización",
      description: "Descripción inicial del contexto de sostenibilidad de la empresa con riesgos y oportunidades ESG.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Matriz de doble materialidad (financiera y ESG)",
      description: "Con una priorización automática de los 10 temas prioritarios para la empresa.",
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Recomendaciones de métricas y cómo medirlas",
      description: "Lista de métricas ESG específicas vinculadas a SASB, GRI, ODS y S&P con las que puedes medir tus temas materiales.",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Estrategia de sostenibilidad con acciones concretas",
      description: "Un plan de acción con tres niveles de recomendaciones de acciones corporativas para mejorar los 10 temas materiales en un nivel inicial, moderado y estructural.",
    },
  ]

  return (
    <section id="que-incluye" className="py-20 relative bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-adaptia-blue-primary mb-6 text-balance">¿Qué incluye tu análisis?</h2>
          <p className="text-lg text-adaptia-blue-primary/70 max-w-4xl mx-auto text-pretty font-heading">
          Cuando tu análisis esté listo recibirás un correo con instrucciones para ingresar a tu cuenta en donde encontrarás un dashboard interactivo con:
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
