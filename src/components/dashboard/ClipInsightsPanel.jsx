import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, TrendingUp, TrendingDown, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const defaultMetrics = {
  views: 124000,
  engagement_rate: 8.5,
  likes: 10540,
  comments: 342,
  shares: 1250,
  saves: 2100,
  watch_time: 89.5,
  completion_rate: 72,
  new_followers: 234,
  growth_trend: "+42%"
};

export default function ClipInsightsPanel({ clip, isOpen, onClose }) {
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !interpretation && !loading) {
      generateInsights();
    }
  }, [isOpen]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const metricsData = clip.metrics || defaultMetrics;
      
      const prompt = `Eres un experto en análisis de contenido digital para artistas musicales. 
      
He aquí las métricas de rendimiento de un clip publicado:
- Visualizaciones: ${metricsData.views?.toLocaleString() || 'N/A'}
- Tasa de engagement: ${metricsData.engagement_rate || 0}%
- Me gusta: ${metricsData.likes?.toLocaleString() || 'N/A'}
- Comentarios: ${metricsData.comments?.toLocaleString() || 'N/A'}
- Compartidos: ${metricsData.shares?.toLocaleString() || 'N/A'}
- Guardados: ${metricsData.saves?.toLocaleString() || 'N/A'}
- Tiempo de visionado promedio: ${metricsData.watch_time || 0}%
- Tasa de finalización: ${metricsData.completion_rate || 0}%
- Nuevos seguidores: ${metricsData.new_followers?.toLocaleString() || 'N/A'}
- Tendencia de crecimiento: ${metricsData.growth_trend || 'N/A'}

Por favor, proporciona un análisis en lenguaje simple (apto para cualquier persona, no solo expertos en datos):

1. **Resumen de Rendimiento**: Una frase corta explicando si este clip está funcionando bien o no.

2. **¿Qué significa esto?**: Explica en términos simples qué indican estas métricas sobre cómo la audiencia está reaccionando.

3. **Etapas de Éxito**:
   - Atracción: ¿El contenido está atrapando a las personas? (basado en visualizaciones)
   - Retención: ¿Están viendo todo el video? (basado en tasa de finalización)
   - Interacción: ¿Están respondiendo al contenido? (basado en likes, comentarios, compartidos)
   - Crecimiento: ¿Está ganando nuevos seguidores? (basado en nuevos followers)

4. **Recomendación**: Una recomendación específica basada en los datos para mejorar futuros clips.

Usa un tono amigable y motivador. Explica cada métrica como si hablaras con un amigo que quiere entender cómo le está yendo su contenido.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setInterpretation(response);
    } catch (err) {
      console.error("Error generating insights:", err);
      setError("Error al generar análisis. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{clip?.title || "Análisis de Clip"}</h2>
                <p className="text-sm text-gray-500">Insights de rendimiento interpretados</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader className="w-8 h-8 animate-spin text-purple-400 mb-4" />
                  <p className="text-gray-400">Analizando tu contenido...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                  {error}
                </div>
              ) : interpretation ? (
                <div className="space-y-6">
                  {/* Metrics Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Eye, label: "Vistas", value: (clip?.metrics?.views || defaultMetrics.views).toLocaleString(), color: "text-blue-400" },
                      { icon: Heart, label: "Me gusta", value: (clip?.metrics?.likes || defaultMetrics.likes).toLocaleString(), color: "text-red-400" },
                      { icon: MessageCircle, label: "Comentarios", value: (clip?.metrics?.comments || defaultMetrics.comments).toLocaleString(), color: "text-yellow-400" },
                      { icon: Share2, label: "Compartidos", value: (clip?.metrics?.shares || defaultMetrics.shares).toLocaleString(), color: "text-green-400" }
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${stat.color}`} />
                            <span className="text-xs text-gray-500">{stat.label}</span>
                          </div>
                          <p className="text-lg font-bold">{stat.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Interpretation */}
                  <div className="prose prose-invert max-w-none text-sm">
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      {interpretation.split('\n\n').map((section, idx) => (
                        <div key={idx}>
                          {section.includes('**') ? (
                            <div>
                              {section.split('\n').map((line, lineIdx) => (
                                <div key={lineIdx}>
                                  {line.includes('**') ? (
                                    <p className="font-semibold text-white mt-3 mb-2">
                                      {line.replace(/\*\*/g, '')}
                                    </p>
                                  ) : line.trim() ? (
                                    <p className="mb-2">{line}</p>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>{section}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 flex items-center gap-3">
                    {(clip?.metrics?.growth_trend || defaultMetrics.growth_trend).includes('+') ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">Tendencia de Crecimiento</p>
                      <p className="text-xs text-gray-400">{clip?.metrics?.growth_trend || defaultMetrics.growth_trend}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all"
              >
                Cerrar
              </button>
              {!interpretation && !loading && (
                <button
                  onClick={generateInsights}
                  className="flex-1 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Analizar
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}