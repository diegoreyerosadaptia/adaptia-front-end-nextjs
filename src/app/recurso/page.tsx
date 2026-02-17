import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SupportersSection } from "@/components/supporters-section"
import { Footer } from "@/components/footer"
import { PlayCircle, CheckCircle2 } from "lucide-react"

type VideoItem = {
  title: string
  description: string
  // Ideal: URL embed de YouTube (https://www.youtube.com/embed/VIDEO_ID)
  embedUrl: string
}

type StepItem = {
  number: number
  title: string
  bullets?: string[]
  paragraphs?: string[]
}

const VIDEOS: VideoItem[] = [
  {
    title: "¿Qué es Adaptia?",
    description: "Conoce qué hacemos y por qué Adaptia facilita el acceso a sostenibilidad corporativa.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_1",
  },
  {
    title: "¿Para quién está diseñada Adaptia?",
    description: "A quién ayuda, en qué casos aporta valor y cómo se adapta por país e industria.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_2",
  },
  {
    title: "Los pasos para generar tu análisis",
    description: "Te mostramos el flujo completo desde el registro hasta la entrega del análisis.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_3",
  },
  {
    title: "Introducción a Adaptia",
    description: "Una visión general del producto y de los resultados que vas a recibir.",
    embedUrl: "https://www.youtube.com/embed/VIDEO_ID_4",
  },
]

const STEPS: StepItem[] = [
  {
    number: 1,
    title: "Identificación y contextualización de la organización",
    paragraphs: [
      "Partimos de la información proporcionada en el registro: nombre, sitio web, país e industria.",
      "Con estos datos identificamos la organización y definimos el marco geográfico y sectorial sobre el cual se realizará el análisis.",
    ],
  },
  {
    number: 2,
    title: "Construcción del perfil organizacional",
    paragraphs: [
      "Generamos un perfil integral utilizando únicamente información pública disponible, como:",
    ],
    bullets: ["Sitio web oficial", "Artículos y publicaciones", "Reportes públicos", "Comunicaciones institucionales"],
  },
  {
    number: 3,
    title: "Clasificación sectorial basada en estándares internacionales",
    paragraphs: [
      "Determinamos la industria principal de operación utilizando la categorización del Materiality Map de S&P Global, una herramienta desarrollada a partir del Corporate Sustainability Assessment de S&P, que analiza más de 13,500 empresas a nivel global y define 62 industrias y 15 temas ESG base.",
      "Esta clasificación nos permite contextualizar el análisis dentro de una referencia global reconocida.",
    ],
  },
  {
    number: 4,
    title: "Evaluación de materialidad financiera",
    paragraphs: [
      "Con base en la industria identificada, analizamos el nivel de relevancia financiera de cada uno de los 15 temas ESG base definidos por S&P Global.",
      "Esto nos permite entender qué temas pueden impactar económicamente a la empresa según su sector.",
    ],
  },
  {
    number: 5,
    title: "Evaluación de materialidad ESG",
    paragraphs: [
      "Posteriormente realizamos una evaluación de impacto (positivo y negativo) utilizando variantes de análisis alineadas con procesos recomendados por estándares como GRI y SASB.",
      "Esto nos permite valorar cada tema desde una perspectiva ambiental, social y de gobernanza.",
      "Al combinar materialidad financiera y materialidad ESG, determinamos los 10 temas materiales prioritarios para la empresa dentro de una matriz de doble materialidad ESG.",
    ],
  },
  {
    number: 6,
    title: "Identificación de riesgos, oportunidades y acciones",
    paragraphs: ["Para cada uno de los 10 temas materiales:"],
    bullets: ["Identificamos riesgos operativos relevantes", "Identificamos oportunidades estratégicas", "Proponemos tres niveles de acción: inicial, moderada y estructural"],
  },
  {
    number: 7,
    title: "Definición de métricas e indicadores",
    paragraphs: [
      "Con base en el perfil de la empresa y su industria, identificamos métricas relevantes alineadas a estándares internacionales como GRI y SASB.",
      "Estas métricas permiten medir avances de manera estructurada y comparable.",
    ],
  },
  {
    number: 8,
    title: "Vinculación con Objetivos de Desarrollo Sostenible",
    paragraphs: [
      "Asociamos cada uno de los 10 temas materiales con el ODS más relevante, considerando la cercanía temática entre los temas ESG priorizados y los 17 Objetivos de Desarrollo Sostenible, sus metas e indicadores.",
      "Este paso facilita la alineación comunicacional y estratégica.",
    ],
  },
  {
    number: 9,
    title: "Análisis regulatorio contextual",
    paragraphs: [
      "Utilizando el mapa regulatorio desarrollado por la Global Alliance for Impact Lawyers (GAIL), identificamos las leyes y marcos normativos más relevantes en Latinoamérica según los temas materiales de la empresa.",
      "Esto permite anticipar riesgos regulatorios y oportunidades de cumplimiento.",
    ],
  },
  {
    number: 10,
    title: "Generación de la ruta de sostenibilidad",
    paragraphs: ["Finalmente, integramos todos los elementos anteriores en una ruta de sostenibilidad estructurada que:"],
    bullets: ["Prioriza los 10 temas materiales", "Resume riesgos y oportunidades clave", "Presenta acciones concretas recomendadas", "Ordena el avance en fases progresivas"],
  },
]

export default function RecursosPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mt-10 mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 text-balance">
              Recursos
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto text-pretty">
              Material breve y práctico para entender Adaptia, su metodología y cómo generar tu análisis.
            </p>
          </div>

          {/* Videos */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <PlayCircle className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-primary text-center">Videos</h2>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {VIDEOS.map((v) => (
                    <Card key={v.title} className="bg-card border-gray-200 hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-primary mb-2">{v.title}</h3>
                        <p className="text-muted-foreground text-pretty mb-4">{v.description}</p>

                        <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-black/5 aspect-video">
                          <iframe
                            className="absolute inset-0 h-full w-full"
                            src={v.embedUrl}
                            title={v.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Tip: si querés que el video no muestre “videos sugeridos”, puedo ayudarte a armar los parámetros del embed.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metodología */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-gray-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-primary text-center">Nuestra Metodología</h2>
                </div>

                <p className="text-lg text-muted-foreground text-center max-w-4xl mx-auto text-pretty mb-10">
                  En Adaptia desarrollamos un sistema de análisis que transforma un proceso tradicionalmente largo y costoso en uno ágil,
                  accesible y basado en estándares internacionales, ejecutado por agentes de inteligencia artificial entrenados bajo una
                  metodología estructurada.
                  <br /><br />
                  Este es el proceso que seguimos:
                </p>

                {/* ✅ Accordion estilo FAQ: solo “número + nombre”, contenido desplegable */}
                <Accordion type="single" collapsible className="space-y-4">
                  {STEPS.map((s) => (
                    <AccordionItem
                      key={s.number}
                      value={`step-${s.number}`}
                      className="bg-card border border-gray-200 rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold text-card-foreground hover:text-primary text-lg md:text-xl">
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                            {s.number}
                          </span>
                          <span>{s.title}</span>
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="text-muted-foreground text-pretty text-lg">
                        <div className="space-y-4 pt-2">
                          {s.paragraphs?.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}

                          {s.bullets?.length ? (
                            <ul className="list-disc pl-6 space-y-2">
                              {s.bullets.map((b) => (
                                <li key={b}>{b}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      <Footer />
    </main>
  )
}
