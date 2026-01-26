import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Mic, MicOff, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres un asistente para un estudio creativo de producción musical. El usuario te dice: "${input}".

Tu trabajo es interpretar si quiere crear:
- Una SESIÓN (grabación, producción, mezcla, etc.)
- Una REUNIÓN (meeting con cliente, planeación, etc.)
- Un ENTREGABLE (demo, mix, master, etc.)

Responde SOLO con un JSON válido (sin markdown, sin código):
{
  "type": "session|meeting|deliverable|unknown",
  "title": "título sugerido",
  "description": "descripción corta",
  "friendly_response": "mensaje amigable para el usuario confirmando lo que entendiste"
}

Si no estás seguro, type debe ser "unknown".`,
        response_json_schema: {
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            friendly_response: { type: "string" }
          }
        }
      });

      const aiResponse = { role: "assistant", content: response.friendly_response };
      setMessages(prev => [...prev, aiResponse]);

      if (response.type !== "unknown") {
        const confirmation = confirm(`¿Quieres crear esto?\n\nTipo: ${response.type === 'session' ? 'Sesión' : response.type === 'meeting' ? 'Reunión' : 'Entregable'}\nTítulo: ${response.title}\nDescripción: ${response.description}`);
        
        if (confirmation) {
          if (response.type === 'session' || response.type === 'meeting') {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            
            await base44.entities.Session.create({
              type: response.type === 'session' ? 'Session' : 'Meeting',
              title: response.title,
              description: response.description,
              start_time: now.toISOString(),
              end_time: oneHourLater.toISOString(),
              status: 'Pending'
            });
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            setMessages(prev => [...prev, { role: "assistant", content: "✅ Creado exitosamente. Puedes editarlo desde el calendario para asignar artista y ajustar horarios." }]);
          } else if (response.type === 'deliverable') {
            const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            await base44.entities.Deliverable.create({
              deliverable_type: 'Demo',
              title: response.title,
              due_date_time: oneWeekLater.toISOString(),
              status: 'Pending',
              notes: response.description
            });
            queryClient.invalidateQueries({ queryKey: ['deliverables'] });
            setMessages(prev => [...prev, { role: "assistant", content: "✅ Entregable creado. Puedes editarlo para asignar artista y proyecto." }]);
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, hubo un error procesando tu solicitud." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-emerald-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-purple-600 rounded-t-2xl">
              <h3 className="font-bold text-white">Asistente Inteligente</h3>
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Dime qué necesitas crear: sesiones, reuniones o entregables
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe o usa el micrófono..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}