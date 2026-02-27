import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Wand2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TEMPLATES } from "./templates";

const INITIAL_MSG = {
  role: "assistant",
  content: "Describe la estética de tu proyecto musical y crearé el estilo visual perfecto para tus clips.\n\nEjemplo: trap oscuro, R&B minimalista, pop vibrante..."
};

const SUGGESTIONS = [
  "Trap oscuro con estética monocromática",
  "Pop latinx vibrante y colorido",
  "R&B nostálgico, tonos cálidos",
  "Electrónica minimalista, alta moda",
];

export default function AIChatPanel({ settings, updateSettings }) {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    try {
      const templateList = Object.values(TEMPLATES).map((t) => `${t.id}: ${t.name} — ${t.desc}`).join("\n");
      const r = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres un director creativo de alto nivel para artistas musicales. El usuario describe su estética. 
Analiza y recomienda el mejor estilo visual para sus clips de redes sociales.
Plantillas disponibles: ${templateList}
Descripción del artista: "${content}"
Responde en español de forma concisa y con personalidad creativa.`,
        response_json_schema: {
          type: "object",
          properties: {
            template_id: { type: "string", description: "ID exacto de la plantilla (uno de: mono_cinema, editorial_noir, impact_subtitles, triple_layer, fashion_glitch)" },
            primary_color: { type: "string", description: "Color primario en hex" },
            secondary_color: { type: "string", description: "Color de acento en hex" },
            anim_speed: { type: "string", description: "slow, normal o fast" },
            vision_line: { type: "string", description: "Una frase poética breve que define la visión visual" },
            reasoning: { type: "string", description: "Breve explicación de por qué esta plantilla y colores" }
          }
        }
      });

      const templateKey = Object.keys(TEMPLATES).includes(r.template_id) ? r.template_id : "mono_cinema";
      updateSettings({
        template: templateKey,
        primaryColor: r.primary_color || settings.primaryColor,
        secondaryColor: r.secondary_color || settings.secondaryColor,
        animSpeed: ["slow", "normal", "fast"].includes(r.anim_speed) ? r.anim_speed : "normal",
      });

      const tplName = TEMPLATES[templateKey]?.name || templateKey;
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: r.reasoning || "",
        vision: r.vision_line,
        applied: { template: tplName, primary: r.primary_color, secondary: r.secondary_color, speed: r.anim_speed }
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error al procesar. Inténtalo de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-white">Dirección Creativa IA</p>
          <p className="text-[9px] text-white/30">Powered by Motor IA</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 border border-[#FF6A00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Wand2 className="w-3 h-3 text-[#FF6A00]" />
              </div>
            )}
            <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
              <div className={`rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#FF6A00]/12 border border-[#FF6A00]/20 text-white/85 rounded-br-sm"
                  : "bg-[#1c1c1c] border border-white/[0.05] text-white/70 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
              {/* Applied card */}
              {msg.applied && (
                <div className="bg-[#0f1a0f] border border-[#FF6A00]/20 rounded-xl px-3 py-2.5 w-full space-y-2">
                  {msg.vision && (
                    <p className="text-[11px] italic text-white/50">"{msg.vision}"</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-bold uppercase text-white/30 tracking-widest">Aplicado:</span>
                    <span className="text-[10px] bg-white/8 px-2 py-0.5 rounded-full text-white/60 border border-white/8">{msg.applied.template}</span>
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: msg.applied.primary }} />
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: msg.applied.secondary }} />
                    </div>
                    <span className="text-[10px] text-white/40 capitalize">{msg.applied.speed}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#FF6A00]/70">
                    <Wand2 className="w-3 h-3" />
                    <span>Estilo aplicado al preview</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-3 h-3 text-[#FF6A00]" />
            </div>
            <div className="bg-[#1c1c1c] border border-white/[0.05] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 0.18, 0.36].map((d, i) => (
                <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.9, repeat: Infinity, delay: d }}
                  className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]/50" />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only at start) */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-white/50 hover:border-[#FF6A00]/40 hover:text-white/80 hover:bg-[#FF6A00]/5 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
        <div className="flex gap-2 items-end bg-[#1a1a1a] border border-white/[0.08] rounded-2xl px-3 py-2 focus-within:border-[#FF6A00]/40 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Describe la estética..."
            rows={1}
            className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/20 focus:outline-none resize-none leading-relaxed"
            style={{ minHeight: "20px", maxHeight: "80px" }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="w-7 h-7 rounded-xl bg-[#FF6A00] hover:bg-[#ff7a1a] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}