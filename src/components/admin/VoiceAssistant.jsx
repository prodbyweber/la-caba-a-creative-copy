import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Mic, MicOff, Send, Loader2, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BRAND_ORANGE = "#ff5833";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  // Cargar artistas para detección automática
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
  });

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-submit cuando termina de escuchar
        setTimeout(() => {
          document.getElementById('va-form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }, 300);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Detectar artista mencionado en el texto
  const detectArtist = (text) => {
    if (!artists.length) return null;
    const lower = text.toLowerCase();
    return artists.find(a => {
      const stageLower = a.stageName?.toLowerCase() || "";
      const legalLower = a.legalName?.toLowerCase() || "";
      return (stageLower && lower.includes(stageLower)) || (legalLower && lower.includes(legalLower));
    }) || null;
  };

  // Detectar proyecto mencionado en el texto
  const detectProject = (text) => {
    if (!projects.length) return null;
    const lower = text.toLowerCase();
    return projects.find(p => p.title && lower.includes(p.title.toLowerCase())) || null;
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    addMessage("user", trimmed);
    setInput("");
    setIsProcessing(true);

    const detectedArtist = detectArtist(trimmed);
    const detectedProject = detectProject(trimmed);

    const artistContext = artists.length
      ? `Artistas registrados: ${artists.map(a => `"${a.stageName}"${a.legalName ? ` (${a.legalName})` : ''}`).join(', ')}.`
      : "";

    const projectContext = projects.length
      ? `Proyectos registrados: ${projects.map(p => p.title).join(', ')}.`
      : "";

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres el asistente IA de Cabaña Creative, un estudio musical profesional.
${artistContext}
${projectContext}

El usuario dice: "${trimmed}"

Detecta si quiere crear:
- "session": sesión de grabación, producción, mezcla, estudio
- "meeting": reunión, videollamada, consulta
- "deliverable": entregable, demo, mix, master, stems
- "revision": revisión, feedback, corrección, cambios
- "unknown": cualquier otra cosa

Extrae también:
- El artista mencionado (por nombre artístico o real)
- El proyecto mencionado
- Fecha y hora si se menciona (formato ISO, zona horaria Europe/Madrid)
- Duración en horas si se menciona
- Plataforma si se menciona (Studio, Online, External)

Responde SOLO JSON válido:
{
  "type": "session|meeting|deliverable|revision|unknown",
  "session_type": "Session|Meeting|StudioWork",
  "title": "título concreto y descriptivo",
  "description": "descripción detallada",
  "artist_name": "nombre exacto del artista o null",
  "artist_id": "ID del artista si lo detectas o null",
  "project_name": "nombre del proyecto o null",
  "date_iso": "2026-03-28T10:00:00 o null",
  "duration_hours": 2,
  "location": "Studio|Online|External",
  "friendly_response": "respuesta amigable confirmando lo que entendiste, mencionando artista y fecha si los detectaste"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            session_type: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            artist_name: { type: "string" },
            artist_id: { type: "string" },
            project_name: { type: "string" },
            date_iso: { type: "string" },
            duration_hours: { type: "number" },
            location: { type: "string" },
            friendly_response: { type: "string" }
          }
        }
      });

      addMessage("assistant", response.friendly_response);

      if (response.type === "unknown") {
        setIsProcessing(false);
        return;
      }

      // Resolver artista: primero del LLM, luego del detector local
      const resolvedArtist = detectedArtist ||
        (response.artist_name ? artists.find(a =>
          a.stageName?.toLowerCase() === response.artist_name?.toLowerCase() ||
          a.legalName?.toLowerCase() === response.artist_name?.toLowerCase()
        ) : null);

      // Resolver proyecto
      const resolvedProject = detectedProject ||
        (response.project_name ? projects.find(p =>
          p.title?.toLowerCase() === response.project_name?.toLowerCase()
        ) : null);

      // Calcular fechas
      const startDate = response.date_iso ? new Date(response.date_iso) : new Date();
      const durationMs = (response.duration_hours || 1) * 60 * 60 * 1000;
      const endDate = new Date(startDate.getTime() + durationMs);

      setPendingAction({
        ai: response,
        resolvedArtist,
        resolvedProject,
        startDate,
        endDate,
      });

      const artistStr = resolvedArtist ? ` con **${resolvedArtist.stageName}**` : "";
      const projectStr = resolvedProject ? ` — Proyecto: ${resolvedProject.title}` : "";
      const dateStr = response.date_iso
        ? ` el ${startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
        : "";

      addMessage("assistant", `📋 Resumen:\n**${response.title}**${artistStr}${projectStr}${dateStr}\n\n¿Confirmo y sincronizo con Google Calendar?`);
      setPendingAction(prev => ({ ...prev, awaitingConfirm: true }));

    } catch (error) {
      addMessage("assistant", "Lo siento, hubo un error procesando tu solicitud.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { ai, resolvedArtist, resolvedProject, startDate, endDate } = pendingAction;
    setPendingAction(null);
    setIsProcessing(true);

    addMessage("assistant", "⏳ Creando y sincronizando...");

    try {
      if (ai.type === 'session' || ai.type === 'meeting') {
        const sessionData = {
          type: ai.session_type || (ai.type === 'meeting' ? 'Meeting' : 'Session'),
          title: ai.title,
          description: ai.description,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: 'Pending',
          location: ai.location || 'Studio',
          ...(resolvedArtist && { artist_id: resolvedArtist.id }),
          ...(resolvedProject && { project_id: resolvedProject.id }),
        };

        const created = await base44.entities.Session.create(sessionData);

        // Sincronizar con Google Calendar
        try {
          const gcalRes = await base44.functions.invoke('createGoogleCalendarEvent', {
            session: {
              ...sessionData,
              artist_name: resolvedArtist?.stageName || ai.artist_name,
              project_name: resolvedProject?.title || ai.project_name,
            }
          });

          if (gcalRes?.data?.google_event_id) {
            await base44.entities.Session.update(created.id, {
              google_event_id: gcalRes.data.google_event_id,
              google_event_link: gcalRes.data.google_event_link,
              source: 'cabana'
            });
          }
        } catch (gcalErr) {
          // No bloquear si Google Calendar falla
        }

        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        addMessage("assistant", `✅ ¡Listo! Sesión "${ai.title}" creada${resolvedArtist ? ` para ${resolvedArtist.stageName}` : ''} y sincronizada con Google Calendar.`);

      } else if (ai.type === 'deliverable') {
        const oneWeek = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        await base44.entities.Deliverable.create({
          deliverable_type: 'Demo',
          title: ai.title,
          due_date_time: oneWeek.toISOString(),
          status: 'Pending',
          notes: ai.description,
          ...(resolvedArtist && { artist_id: resolvedArtist.id }),
          ...(resolvedProject && { project_id: resolvedProject.id }),
        });
        queryClient.invalidateQueries({ queryKey: ['deliverables'] });
        addMessage("assistant", `✅ Entregable "${ai.title}" creado${resolvedArtist ? ` para ${resolvedArtist.stageName}` : ''}.`);

      } else if (ai.type === 'revision') {
        await base44.entities.Revision.create({
          request_text: ai.title,
          revision_type: 'Mix',
          severity: 'Medium',
          status: 'Open',
          timecode: '00:00',
          ...(resolvedArtist && { artist_id: resolvedArtist.id }),
          ...(resolvedProject && { project_id: resolvedProject.id }),
        });
        queryClient.invalidateQueries({ queryKey: ['revisions'] });
        addMessage("assistant", `✅ Revisión "${ai.title}" registrada.`);
      }

    } catch (error) {
      addMessage("assistant", "❌ Error al crear. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setPendingAction(null);
    addMessage("assistant", "Cancelado. ¿En qué más puedo ayudarte?");
  };

  const hasSpeechSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-50"
        style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #e04420)` }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        <Zap className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[540px] bg-[#111113] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BRAND_ORANGE}, #c73b1a)` }}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-white text-sm">Asistente Cabaña</h3>
                  <p className="text-white/70 text-[10px]">Voz · Tareas · Google Calendar</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-10 px-4">
                  <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: BRAND_ORANGE }} />
                  <p className="text-white/40 text-sm">Dime qué necesitas.</p>
                  <p className="text-white/25 text-xs mt-1">Ej: "Sesión de grabación con JLY el lunes a las 10"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-white/8 text-white/90 border border-white/5 rounded-bl-sm'
                    }`}
                    style={msg.role === 'user' ? { background: BRAND_ORANGE } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Confirm / Cancel buttons */}
              {pendingAction?.awaitingConfirm && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ background: BRAND_ORANGE }}
                  >
                    ✓ Confirmar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isProcessing}
                    className="flex-1 py-2 rounded-xl bg-white/8 border border-white/10 text-white/60 text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white/8 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: BRAND_ORANGE }} />
                    <span className="text-white/50 text-sm">Procesando...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              id="va-form"
              onSubmit={handleSubmit}
              className="p-3 border-t border-white/8 flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${
                      isListening
                        ? 'text-white animate-pulse'
                        : 'bg-white/8 text-white/50 hover:bg-white/12 hover:text-white'
                    }`}
                    style={isListening ? { background: BRAND_ORANGE } : {}}
                    title={isListening ? "Detener" : "Hablar"}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Escuchando..." : "Escribe o usa el micrófono..."}
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none transition-colors"
                  style={{ '--tw-ring-color': BRAND_ORANGE }}
                  disabled={isListening}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !input.trim()}
                  className="p-2.5 rounded-xl text-white flex-shrink-0 disabled:opacity-30 transition-all"
                  style={{ background: BRAND_ORANGE }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}