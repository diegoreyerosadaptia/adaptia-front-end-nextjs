import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { ArrowLeft, Mail, MessageCircle } from "lucide-react"
import { Footer } from "@/components/footer"

function renderAnswer(answer: string) {
  return answer
    .trim()
    .split(/\n\s*\n/g) // separa por párrafos (línea en blanco)
    .map((block, i) => (
      <p key={i} className="mb-4 last:mb-0">
        {block.trim()}
      </p>
    ))
}


export default function FaqPage() {
  const faqs = [
    {
      question: "¿Qué necesito para solicitar el análisis?",
      answer: "Solo necesitas completar nuestro formulario con información general de tu empresa y realizar el pago. No es necesario que tengas experiencia previa en sostenibilidad.",
    },
    {
      question: "¿Qué es un análisis de sostenibilidad (doble materialidad ESG)?",
      answer:
        "Es un análisis que identifica los temas de sostenibilidad más importantes para tu empresa. Considera tanto cómo tu empresa impacta en el entorno (por ejemplo, en lo ambiental, social y en su gobernanza) como los riesgos y oportunidades que estos temas pueden generar para tu negocio. A este enfoque también se le conoce como doble materialidad ESG.",
    },
    {
      question: "¿Qué incluye el análisis de Adaptia?",
      answer:
        "Incluye un resumen del contexto de tu empresa, una priorización de los temas de sostenibilidad más relevantes, métricas recomendadas para empezar a medir tu desempeño, riesgos y oportunidades clave, y una ruta clara de acción para avanzar de forma progresiva.",
    },
    {
      question: "¿Cuánto tarda el proceso?",
      answer: "Recibirás tu análisis en un plazo máximo de 24 horas hábiles desde la confirmación del pago.",
    },
    {
      question: "¿Adaptia reemplaza a una consultora?",
      answer:
        "No. Adaptia ofrece una forma ágil y estructurada de realizar tu primer análisis de sostenibilidad. Puede ayudarte a comenzar más rápido y con mayor claridad. Para la implementación detallada o proyectos más complejos, puedes trabajar con consultoras especializadas que tomen este análisis como punto de partida.",
    },
    {
      question: "¿Qué tipo de empresas pueden usar Adaptia?",
      answer:
        "Empresas de cualquier tamaño e industria que quieran avanzar en sostenibilidad, ya sea por convicción, para cumplir regulaciones o por requerimientos de clientes, inversionistas o mercados. Nuestros análisis usas parámetros y bases de datos Latinoamericanas, así que de momento solo realizamos análisis para países en LATAM y en Español. ",
    },
    {
      question: "¿Qué pasa después de recibir el análisis?",
      answer:
        "Podrás revisar tus resultados en el dashboard, descargar el análisis y comenzar a implementar tu ruta de acción. Además, ofrecemos una llamada complementaria de interpretación para ayudarte a entender mejor los resultados y resolver dudas. Si necesitas apoyo adicional, también podemos conectarte con aliados especializados para acompañarte en la implementación.",
    },
    {
      question: "¿Qué tan válidas son las métricas y referencias?",
      answer:
        "Las métricas y recomendaciones se basan en estándares internacionales de sostenibilidad y mejores prácticas reconocidas. Integramos los marcos de SASB, GRI, ODS, S&P y GAIL. Se adaptan al país, la industria y el contexto de tu empresa para ofrecer resultados relevantes y consistentes.",
    },
    {
      question: "¿Puedo actualizar el análisis más adelante?",
      answer:
        "Sí. Puedes generar un nuevo análisis más adelante a un costo reducido para reflejar cambios en tu empresa o medir avances en tu desempeño.",
    },
    {
      question: "¿Qué pasa si quiero ajustar los resultados de mi análisis?",
      answer:
        "Si consideras que algún resultado no refleja adecuadamente tu contexto, puedes escribirnos. Revisaremos la información y, si es necesario, ajustaremos los parámetros para generar una nueva versión del análisis. Nuestro enfoque busca mantener objetividad y transparencia en la evaluación inicial.",
    },
    {
      question: "¿Cuál es la huella ambiental de un análisis de Adaptia?",
      answer: `Cada análisis completo de Adaptia utiliza en promedio 17,500 tokens. Esto se traduce en una huella ambiental muy baja. En términos simples, por cada análisis:
    
    Huella de CO₂e: aproximadamente 13 gramos
    - Equivalente a enviar 1–2 correos electrónicos con adjunto.
    - Similar a tener un refrigerador doméstico encendido por 10–12 minutos.
    
    Consumo de energía: alrededor de 0.088 kWh
    - Equivalente al consumo de una laptop durante 5–7 minutos.
    - Similar a la energía necesaria para calentar agua para ⅛ de taza de té.
    
    Uso de agua: entre 0.42 y 0.64 litros
    - Equivalente al agua asociada a producir 1–2 hojas impresas tamaño carta.
    - Aproximadamente medio vaso de agua.
    
    Para reducir nuestra huella, seguimos mejorando la eficiencia del pipeline para disminuir la cantidad de tokens necesarios en cada análisis.`,
      preserveLines: true,
    },    
    {
      question: "¿Cómo protegen los datos de mi organización?",
      answer:
        "Adaptia utiliza exclusivamente los datos que tu organización proporciona —así como la información generada durante el análisis— para elaborar el estudio contratado. Estos datos no se comparten, no se venden y no se usan para fines distintos a los establecidos en el servicio. Cada análisis es independiente y nunca se mezcla ni se agrega información entre distintas organizaciones./nToda la información se almacena en Supabase (PostgreSQL). El acceso está protegido mediante autenticación con tokens JWT y validación en cada solicitud. Además, todas las conexiones entre la aplicación, el servidor y la base de datos utilizan HTTPS y TLS, garantizando la encriptación, la integridad y la protección de tus datos en todo momento.",
    },
    {
      question: "¿Qué hacen con los datos de mi organización? ",
      answer:
        "Toda la información proporcionada por tu organización se considera confidencial y será tratada como tal. Adaptia solo podrá divulgar datos cuando exista una obligación legal expresa o el consentimiento escrito por parte de la empresa usuaria de nuestra plataforma. De manera agregada y anónima, Adaptia podrá utilizar metadatos de la plataforma para realizar análisis macro de tendencias por industria, país, temas de sostenibilidad o entorno regulatorio. Estos análisis nunca incluyen información identificable ni datos individuales de una empresa en particular que haya usado nuestra plataforma. Esta información se utilizará para generar reporte de la mano de aliados estratégicos con el fin de generar conocimiento para la industria de sostenibilidad.",
    },
    {
      question: "¿Al usar Adaptia, me otorgan licencia sobre la tecnología?",
      answer:
        "La contratación del servicio te da acceso a los resultados de tu análisis, pero no implica la entrega ni cesión de la tecnología, metodologías o modelos utilizados por Adaptia. Toda la propiedad intelectual sigue siendo exclusiva de Adaptia.",
    },
{
  question: "¿Tienen un glosario de todos los términos técnicos que usan en Adaptia?",
  answer: `¡Claro! Aquí te dejamos un glosario de algunos términos clave para iniciar tu camino en la sostenibilidad corporativa.

Sostenibilidad: Forma de gestionar una empresa considerando su impacto ambiental, social y económico en el largo plazo.

ESG (Environmental, Social and Governance): Enfoque que evalúa el desempeño ambiental, social y de gobernanza de una empresa. Las siglas en Español son ASG (ambiental, social y gobernanza). Sin embargo, en LATAM el uso de las siglas en Inglés es común.

Análisis de sostenibilidad: Evaluación estructurada que identifica los temas más relevantes para que una empresa gestione y mejore su impacto.

Materialidad financiera: Evaluación de riesgos y oportunidades de sostenibilidad que pueden impactar los resultados económicos de la empresa.

Materialidad de impacto: Evaluación del impacto que la empresa genera en el medio ambiente y la sociedad.

Doble materialidad ESG: Enfoque que analiza tanto cómo la empresa impacta al entorno como cómo los temas ambientales y sociales pueden afectar sus finanzas.

Matriz de materialidad: Visual que prioriza los temas más relevantes para la empresa según materialidad ESG y financiera.

Ruta de sostenibilidad: Plan estructurado con acciones recomendadas para avanzar progresivamente en sostenibilidad.

Indicadores o métricas: Datos que permiten medir el desempeño de la empresa en temas específicos (por ejemplo, emisiones o diversidad).

Riesgos ESG: Factores ambientales, sociales o de gobernanza que pueden generar pérdidas financieras, legales o reputacionales.

Oportunidades ESG: Iniciativas o mejoras en sostenibilidad que pueden generar crecimiento, eficiencia o ventaja competitiva.

GRI (Global Reporting Initiative): Estándar internacional para reportar información de sostenibilidad.

SASB (Sustainability Accounting Standards Board): Marco que define qué temas de sostenibilidad son relevantes por industria desde una perspectiva financiera.

ODS (Objetivos de Desarrollo Sostenible): 17 objetivos globales definidos por la ONU para promover desarrollo sostenible.

S&P Materiality Map: Herramienta que identifica los temas de sostenibilidad más relevantes por industria.

GAIL (Global Alliance for Impact Lawyers): Red internacional de abogados y expertos legales que promueve marcos jurídicos que faciliten la inversión de impacto y la sostenibilidad empresarial. Sus lineamientos ayudan a integrar criterios legales y regulatorios en estrategias de sostenibilidad.

Regulación ESG: Normativas nacionales o internacionales relacionadas con sostenibilidad y reporte corporativo.

Huella de carbono: Medición de las emisiones de gases de efecto invernadero generadas directa o indirectamente por una empresa.

Gobernanza: Estructura y prácticas de toma de decisiones dentro de una organización.

Greenwashing: Práctica de comunicar acciones de sostenibilidad de manera exagerada o engañosa.

Grupos de interés: Personas o entidades que pueden verse afectadas por la actividad de una empresa, como empleados, clientes o comunidades.

Transparencia: Práctica de comunicar de forma clara y verificable el desempeño de la empresa.

Objetividad metodológica: Uso de criterios estructurados y estándares reconocidos para reducir sesgos en el análisis.`
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
              Sabemos que dar el primer paso hacia una ruta de sostenibilidad puede generar dudas. 
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
                    <AccordionContent className="text-muted-foreground text-pretty text-lg leading-relaxed">
                      {renderAnswer(faq.answer)}
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

        </div>
      </div>
      <Footer />
    </main>
  )
}
