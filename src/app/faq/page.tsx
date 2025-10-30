import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { ArrowLeft, Mail, MessageCircle } from "lucide-react"

export default function FaqPage() {
  const faqs = [
    {
      question: "¿Qué necesito para solicitar el análisis?",
      answer: "Solo necesitas completar nuestro formulario con información general de tu empresa y realizar el pago.",
    },
    {
      question: "¿Qué es la doble materialidad?",
      answer:
        "Es un enfoque que considera tanto los impactos que tu empresa genera en el entorno (materialidad de impacto) como los riesgos y oportunidades de sostenibilidad que pueden afectar tus finanzas (materialidad financiera).",
    },
    {
      question: "¿Qué incluye el análisis de Adaptia?",
      answer:
        "Incluye contexto organizacional, matriz de doble materialidad, métricas clave (alineadas a GRI, S&P, GAIL, SASB, ODS), riesgos y oportunidades y una estrategia de sostenibilidad.",
    },
    {
      question: "¿Cuánto tarda el proceso?",
      answer: "24 horas hábiles desde la confirmación del pago.",
    },
    {
      question: "¿Adaptia reemplaza a una consultora?",
      answer:
        "No buscamos reemplazar, pero sí ofrecer una alternativa ágil y clara para empresas que buscan dar el primer paso de forma más rápida. Buscamos ser una herramienta para también apoyar el trabajo de consultoras especializadas. ",
    },
    {
      question: "¿Qué tipo de empresas pueden usar Adaptia?",
      answer:
        "Empresas de cualquier tamaño e industria que busquen avanzar en sostenibilidad, ya sea por convicción, por cumplir regulaciones o por exigencias de clientes o inversionistas.",
    },
    {
      question: "¿Qué pasa después de recibir el análisis?",
      answer:
        "Te podremos dar recomendaciones de como implementar tu estrategia de sostenibilidad de la mano de nuestros aliados de impacto.",
    },
    {
      question: "¿Qué tan válidas son las métricas y referencias?",
      answer:
        "Todas están alineadas a organizaciones reconocidos como GRI, SASB, S&P  y los ODS, y se adaptan al país, industria y enfoque de tu empresa.",
    },
    {
      question: "¿Puedo actualizar el análisis más adelante?",
      answer:
        "Sí. Podrás generar un nuevo análisis a un costo reducido.",
    },
    {
      question: "¿Qué pasa si quiero ajustar los resultados de mi análisis?",
      answer:
        "Escríbenos. Nos aseguraremos de integrar los parámetros correctos para volver a correr nuestros agentes de IA. Solo recuerda que este análisis es objetivo y busca lograr transparencia y eliminar el error y la subjetividad humana durante la evaluación inicial.",
    },
  ]

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mt-10 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">Preguntas frecuentes</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Sabemos que dar el primer paso hacia una estrategia de sostenibilidad puede generar dudas. 
              Si no encuentras la respuesta que buscas, siempre puedes escribirnos por WhatsApp.
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="mb-12">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card border border-gray-200 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-card-foreground hover:text-primary text-xl">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty text-lg">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">¿Tienes más preguntas?</h3>
            <p className="text-green-700 mb-6 max-w-2xl mx-auto text-pretty">
              Nuestro equipo está disponible para resolver cualquier duda adicional que tengas sobre el proceso.
            </p>
            <Button asChild className="bg-green-500 hover:bg-green-600 text-white">
              <a
                href="https://wa.me/56935027636"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>

          <div className="mt-5 h-55 item-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-800 mb-4">O escríbenos a: </h3>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto text-pretty">
            diego@adaptianow.com
            </p>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/formulario">Solicitar análisis</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
