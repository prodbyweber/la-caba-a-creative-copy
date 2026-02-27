import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TEMPLATES } from "./templates";

const INITIAL_MSG = {
  role: "assistant",
  content: `Describe la estética que buscas o sube un vídeo para comenzar.\n\nEjemplo: *Trap oscuro, fashion film, estilo R&B nocturno.*`
};

export default function AIChatPanel({ settings, updateSettings }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const templateList = Object.values(TEMPLATES).map((t) => `${t.number} ${t.name}: ${t.desc}`).join("\n");
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres un director creativo de alto nivel especializado en identidad visual para artistas musicales.
El usuario describe la estética de su proyecto musical. Responde de forma concisa y cinematográfica.
Sugiere:
1. Una de estas plantillas (elige la mejor): \n${templateList}
2. Colores primario y secundario (hex)
3. Estilo de animación (slow/normal/fast)
4. Pairing tipográfico (tipografías web seguras)
5. Una frase poética breve sobre la visión

Responde en español, formato claro sin markdown excesivo.
La descripción del artista: "${userMsg.content}"`,
        response_json_schema: {
          type: "object",
          properties: {
            template_id: { type: "string" },
            primary_color: { type: "string" },
            secondary_color: { type: "string" },
            anim_speed: { type: "string" },
            font_note: { type: "string" },
            vision: { type: "string" },
            summary: { type: "string" }
          }
        }
      });

      const r = result;
      const templateKey = Object.keys(TEMPLATES).find((k) =>
        TEMPLATES[k].name.toLowerCase().includes((r.template_id || "").toLowerCase()) ||
        k === r.template_id
      ) || "mono_cinema";

      // Auto-apply suggestions
      updateSettings({
        template: templateKey,
        primaryColor: r.primary_color || settings.primaryColor,
        secondaryColor: r.secondary_color || settings.secondaryColor,
        animSpeed: ["slow", "normal", "fast"].includes(r.anim_speed) ? r.anim_speed : settings.animSpeed,
      });

      const aiContent = `**Plantilla sugerida:** ${TEMPLATES[templateKey]?.name || templateKey}\n\n**Colores:** ${r.primary_color} / ${r.secondary_color}\n\n**Ritmo:** ${r.anim_speed}\n\n${r.font_note ? `**Tipografía:** ${r.font_note}\n\n` : ""}*${r.vision || r.summary || ""}*`;
      setMessages((prev) => [...prev, { role: "assistant", content: aiContent, applied: true }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "No pude procesar tu solicitud. Inténtalo de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#FF6A00]" />
        <span className="text-sm font-semibold text-white">Dirección Creativa IA</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0">
                  <span className="text-[10px]">🎬</span>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-white/90 rounded-br-sm"
                    : "bg-[#181818] border border-white/[0.06] text-white/75 rounded-bl-sm"
                }`}
              >
                {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                {msg.applied && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex gap-2 flex-wrap">
                    <button
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    >
                      🎥 Previsualizar con stock
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/30 text-[#FF6A00] hover:bg-[#FF6A00]/20 transition-all"
                    >
                      🎬 Aplicar a mi vídeo
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px]">🎬</span>
            </div>
            <div className="flex gap-1 px-4 py-3 bg-[#181818] border border-white/[0.06] rounded-2xl rounded-bl-sm">
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d }}
                  className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]/60"
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-white/[0.05]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Describe la estética del proyecto..."
            rows={2}
            className="flex-1 bg-[#181818] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/40 resize-none transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-[#FF6A00] hover:bg-[#ff7a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}