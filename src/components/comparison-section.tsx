import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Clock, DollarSign, Cpu, Users } from "lucide-react"

export function ComparisonSection() {
  const comparisons = [
    {
      feature: "Tiempo de entrega",
      icon: <Clock className="w-6 h-6" />,
      adaptia: "24 horas hábiles",
      traditional: "6-9 meses",
      adaptiaGood: true,
    },
    {
      feature: "Costo",
      icon: <DollarSign className="w-6 h-6" />,
      adaptia: "$2,000 USD",
      traditional: "+$30,000 USD",
      adaptiaGood: true,
    },
    {
      feature: "Uso de tecnología",
      icon: <Cpu className="w-6 h-6" />,
      adaptia: "Agentes de IA, referencias industriales, diseñado por expertos",
      traditional: "Procesos totalmente manuales",
      adaptiaGood: true,
    },
    {
      feature: "Inversión de tiempo",
      icon: <Users className="w-6 h-6" />,
      adaptia: "5 minutos",
      traditional: "Decenas de horas (entrevistas, documentos, recolección de métricas)",
      adaptiaGood: true,
    },
  ]

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-adaptia-blue-primary mb-6 text-balance">
            ¿Cómo se compara Adaptia con consultoras tradicionales?
          </h2>
          <p className="text-lg text-adaptia-green-medium max-w-4xl mx-auto text-pretty">
            Muchas empresas enfrentan altos costos, procesos lentos y complejidad técnica al desarrollar estrategias de
            sostenibilidad y ESG. Adaptia resuelve ese cuello de botella con un enfoque ágil, automatizado y validado.
          </p>
        </div>

        <div className="space-y-6">
          {comparisons.map((item, index) => (
            <Card
              key={index}
              className="card-brand hover:shadow-adaptia-lg transition-all duration-500 transform hover:-translate-y-1 overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-adaptia-blue-primary/5 to-adaptia-green-primary/5 border-b border-adaptia-gray-light/30 flex items-center justify-center">
                <CardTitle className="flex items-center gap-3 text-adaptia-blue-primary">
                  <div className="p-2 bg-adaptia-blue-primary/10 rounded-lg border border-adaptia-blue-primary/20">{item.icon}</div>
                  {item.feature}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Adaptia Column */}
                  <div className="p-6 bg-gradient-to-br from-adaptia-green-primary/5 to-adaptia-blue-light/5 border-r border-adaptia-gray-light/30 md:border-r md:border-b-0 border-b">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-adaptia-green-primary rounded-full flex-shrink-0 mt-1">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-adaptia-blue-primary mb-2">Adaptia</h4>
                        <p className="text-adaptia-green-medium text-pretty leading-relaxed">{item.adaptia}</p>
                      </div>
                    </div>
                  </div>

                  {/* Traditional Column */}
                  <div className="p-6 bg-gradient-to-br from-red-50/50 to-orange-50/30">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-500 rounded-full flex-shrink-0 mt-1">
                        <X className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">Consultoría tradicional</h4>
                        <p className="text-red-600/80 text-pretty leading-relaxed">{item.traditional}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
