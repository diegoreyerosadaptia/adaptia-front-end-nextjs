import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"

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
        "Incluye contexto organizacional, matriz de doble materialidad, métricas clave (alineadas a GRI, S&P, GAIL, SASB, ODS) y una estrategia de sostenibilidad.",
    },
    {
      question: "¿Cuánto tarda el proceso?",
      answer: "24 horas hábiles desde la confirmación del pago.",
    },
    {
      question: "¿Adaptia reemplaza a una consultora?",
      answer:
        "No buscamos reemplazar, pero sí ofrecer una alternativa ágil y clara para empresas que buscan dar el primer paso de forma más rápida.",
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
        "Todas están alineadas a marcos reconocidos como GRI, SASB y los ODS, y se adaptan al país, industria y enfoque de tu empresa.",
    },
    {
      question: "¿Puedo actualizar el análisis más adelante?",
      answer:
        "Si quieres renovar o volver a analizar tu empresa deberás de generar un nuevo análisis desde tu cuenta y reenviar tu información. Ponte en contacto con nosotros para que te proporcionemos con un descuento de usuario activo. ",
    },
    {
      question: "¿Qué pasa si quiero ajustar los resultados de mi análisis?",
      answer:
        "Escríbenos. Nos aseguraremos de integrar los parámetros correctos para volver a correr nuestros agentes de IA. Solo recuerda que este análisis es objetivo y busca lograr transparencia y eliminar el error y la subjetividad humana.",
    },
  ]

  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">Preguntas frecuentes</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Sabemos que dar el primer paso hacia una estrategia de sostenibilidad puede generar dudas. Si no
              encuentras la respuesta que buscas, siempre puedes escribirnos por WhatsApp.
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
                  <AccordionTrigger className="text-left font-semibold text-card-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">{faq.answer}</AccordionContent>
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
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Escribir por WhatsApp
              </a>
            </Button>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/formulario">Solicitar análisis</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          asChild
          size="lg"
          className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-14 h-14"
        >
          <a
            href="https://wa.me/1234567890"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar por WhatsApp"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
          </a>
        </Button>
      </div>
    </main>
  )
}
