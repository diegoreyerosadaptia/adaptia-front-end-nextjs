import { Clock, DollarSign, Cpu, Users } from "lucide-react"

export function ComparisonSection() {
  const comparisons = [
    {
      feature: "Tiempo de entrega",
      icon: <Clock className="w-5 h-5" />,
      adaptia: "24 horas hábiles",
      traditional: "6-9 meses",
    },
    {
      feature: "Costo",
      icon: <DollarSign className="w-5 h-5" />,
      adaptia: "Desde $200 hasta $2,000 USD. ",
      traditional: "+ $20,000 USD",
    },
    {
      feature: "Uso de tecnología",
      icon: <Cpu className="w-5 h-5" />,
      adaptia: "Agentes de IA, referencias industriales, diseñado por expertos",
      traditional: "Procesos totalmente manuales",
    },
    {
      feature: "Inversión de tiempo",
      icon: <Users className="w-5 h-5" />,
      adaptia: "5 minutos",
      traditional: "+100 horas por parte de la empresa para entrevistas, documentación, recolección de métricas, etc.",
    },
  ]

  return (
    <section id="comparacion" className="py-20 bg-gradient-to-b from-white to-adaptia-gray-light/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-adaptia-blue-primary mb-4 text-balance">
            ¿Cómo se compara Adaptia con consultoras tradicionales?
          </h2>
          <p className="text-lg text-adaptia-green-medium max-w-4xl mx-auto text-pretty">
Ofrecemos una alternativa a los altos costos, procesos lentos y complejidad técnica al desarrollar estrategias de sostenibilidad y ESG. Adaptia facilita el proceso con un enfoque ágil, automatizado y validado..
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-xl border border-adaptia-gray-medium/30 shadow-adaptia">
              <table className="min-w-full divide-y divide-adaptia-gray-medium/30">
                <thead>
                  <tr className="bg-adaptia-blue-primary">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Característica</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white bg-adaptia-green-primary/20">
                      Adaptia
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Consultoría tradicional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adaptia-gray-medium/30 bg-white">
                  {comparisons.map((item, index) => (
                    <tr key={index} className="hover:bg-adaptia-gray-light/20 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 text-adaptia-blue-primary font-medium">
                          <div className="flex-shrink-0">{item.icon}</div>
                          <span>{item.feature}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm bg-adaptia-green-primary/5">
                        <span className="text-adaptia-green-dark font-medium">{item.adaptia}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-adaptia-blue-primary/70">{item.traditional}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
