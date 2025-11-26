"use client";

import { useEffect, useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getGriByTemas } from "@/services/esg.service";

interface Props {
  temasPrioritarios: { tema: string }[];
  token: string;
}

function FormattedRequirement({ text }: { text: string }) {
  // Split by numbered items (e.g., "2.5.1", "2.6.1", etc.) or lettered items (a, b, c, d)
  const lines = text
    .split(/(?=\d+\.\d+\.?\d*\s)|(?=^[a-z]\.\s)/gm)
    .filter(line => line.trim().length > 0);

  return (
    <div className="space-y-2 py-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        // Check if it starts with a number or letter
        const isListItem = /^(\d+\.[\d.]*\s|[a-z]\.\s)/.test(trimmed);
        
        return (
          <div key={idx} className={isListItem ? "flex gap-2" : ""}>
            {isListItem ? (
              <>
                <span className="font-semibold shrink-0">
                  {trimmed.match(/^(\d+\.[\d.]*|[a-z]\.)/)?.[0]}
                </span>
                <span className="text-sm leading-relaxed">
                  {trimmed.replace(/^(\d+\.[\d.]*\s|[a-z]\.\s)/, '')}
                </span>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{trimmed}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}


export function GriTabs({ temasPrioritarios, token }: Props) {
  const temas = temasPrioritarios.map(t => t.tema);
  const [data, setData] = useState<any[]>([]);
  const [active, setActive] = useState(temas[0]);
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    async function load() {
      const response = await getGriByTemas(temas, token);
      
      setData(response?.gri ?? []);
      
      // Initialize pagination state for each tab
      const initialPages: Record<string, number> = {};
      response?.gri?.forEach((item: any) => {
        initialPages[item.tema] = 1;
      });
      setCurrentPage(initialPages);
    }
    load();
  }, []);
  

  if (!data || data.length === 0)
    return <p className="text-muted-foreground">Cargando contenidos GRI...</p>;

  const getPaginatedData = (contenidos: any[], tema: string) => {
    const page = currentPage[tema] || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return contenidos.slice(startIndex, endIndex);
  };

  const getTotalPages = (contenidos: any[]) => {
    return Math.ceil(contenidos.length / ITEMS_PER_PAGE);
  };

  const handlePageChange = (tema: string, newPage: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [tema]: newPage
    }));
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    
    <div className="w-full space-y-6">
            <div className="flex justify-between items-center mb-2">
        <h3
          className="text-lg font-semibold"
        >
          Métricas GRI
        </h3>
      </div>
      <p>Esta tabla enlista las métricas de los Estándares GRI (Global Reporting Initiative), el principal marco global para que las organizaciones reporten su desempeño en sostenibilidad (ambiental, social y de gobernanza), que resultan aplicables a tu empresa. Con estas métricas podrás reportar tus temas materiales de manera alineada y referenciada con GRI.</p>
      <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="inline-flex h-auto gap-2 bg-transparent p-0 mb-8 flex-wrap">
        {data.map((item) => (
          <TabsTrigger
            key={item.tema}
            value={item.tema}
            className="px-6 py-3 rounded-lg border-2 font-medium transition-all shadow-sm
                      text-[#163F6A]
                      border-[#CBDCDB]
                      bg-white
                      hover:border-[#CBDCDB]
                      hover:bg-[#F3F7F7]
                      data-[state=active]:bg-[#CBDCDB]
                      data-[state=active]:text-[#163F6A]
                      data-[state=active]:border-[#CBDCDB]"
          >
            {item.tema}
          </TabsTrigger>
        ))}
      </TabsList>

        {data.map((item) => {
          const totalPages = getTotalPages(item.contenidos);
          const currentPageNum = currentPage[item.tema] || 1;
          const paginatedData = getPaginatedData(item.contenidos, item.tema);
          
          return (
            <TabsContent key={item.tema} value={item.tema} className="mt-0">
              <div ref={contentRef} className="space-y-6">
                <div className="space-y-4">
                  {paginatedData.map((row: any, idx: number) => (
                    <Card key={idx} className="p-6 hover:shadow-lg transition-shadow border-slate-200">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        <div className="lg:col-span-5 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                                Estándar GRI
                              </p>
                              <p className="text-base font-bold text-slate-800">
                                {row.estandar_gri}
                              </p>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <p className="text-xs font-semibold uppercase tracking-wide mb-1">
                                # Contenido
                              </p>
                              <p className="text-base font-bold text-slate-800">
                                {row.numero_contenido}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-2">
                              Contenido
                            </p>
                            <p className="text-sm leading-relaxed text-slate-700">
                              {row.contenido}
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-7 border-l-0 lg:border-l-2 border-slate-200 lg:pl-6">
                          <p className="text-xs font-semibold uppercase tracking-wide mb-3">
                            Requerimientos
                          </p>
                          <div className="bg-slate-50 rounded-lg p-4">
                            <FormattedRequirement text={row.requerimiento} />
                          </div>
                        </div>

                      </div>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      Página {currentPageNum} de {totalPages} ({item.contenidos.length} elementos totales)
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(item.tema, currentPageNum - 1)}
                        disabled={currentPageNum === 1}
                        className="border-slate-300"
                      >
                        Anterior
                      </Button>
                      
                      {/* Page numbers */}
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          // Show first, last, current, and pages around current
                          const showPage = 
                            pageNum === 1 || 
                            pageNum === totalPages || 
                            Math.abs(pageNum - currentPageNum) <= 1;
                          
                          if (!showPage && pageNum === 2 && currentPageNum > 3) {
                            return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                          }
                          if (!showPage && pageNum === totalPages - 1 && currentPageNum < totalPages - 2) {
                            return <span key={pageNum} className="px-2 text-slate-400">...</span>;
                          }
                          if (!showPage) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPageNum === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(item.tema, pageNum)}
                              className={currentPageNum === pageNum ? "" : "border-slate-300"}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(item.tema, currentPageNum + 1)}
                        disabled={currentPageNum === totalPages}
                        className="border-slate-300"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
      <p>Nota: Para elaborar un reporte de sostenibilidad bajo los Estándares GRI debes seguir los pasos requeridos por la organización. Esta tabla es un resumen introductorio y no constituye, por sí sola, una base que garantice el cumplimiento de los Estándares GRI.</p>
    </div>
  );
}
