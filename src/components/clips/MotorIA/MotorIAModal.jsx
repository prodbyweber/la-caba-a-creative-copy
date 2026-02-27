import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wand2, Film, Settings2, MessageSquare } from "lucide-react";
import LeftPanel from "./LeftPanel";
import AIChatPanel from "./AIChatPanel";
import PreviewPanel from "./PreviewPanel";

const TABS = [
  { id: "estilo", label: "Estilo", icon: Film },
  { id: "ajustes", label: "Ajustes", icon: Settings2 },
  { id: "ia", label: "IA Chat", icon: MessageSquare },
];

export default function MotorIAModal({ onClose, artistId }) {
  const [settings, setSettings] = useState({
    artistId: artistId || "",
    template: "mono_cinema",
    textSize: 60,
    position: "centro",
    primaryColor: "#FFFFFF",
    secondaryColor: "#FF6A00",
    shadow: true,
    glow: false,
    motionBlur: false,
    grain: false,
    animSpeed: "normal",
    letterSpacing: 4,
    opacity: 100,
    bgBlur: false,
    textLine1: "ARTISTA",
    textLine2: "Nuevo Sencillo",
    textLine3: "2026",
    videoUrl: null,
    stockIndex: null,
    subtitleTemplate: "impact_highlight",
    subtitleText: "Cada palabra que dices\ncuenta una historia\nque el mundo necesita escuchar",
    mode: "subtitles", // "subtitles" | "titles"
  });
  const [mobileTab, setMobileTab] = useState("estilo");

  const updateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col"
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.07] bg-[#0d0d0d] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-[#FF6A00]" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-wide">Motor de IA</span>
            <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/20 uppercase tracking-widest">
              Beta
            </span>
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="flex md:hidden items-center gap-1 bg-white/5 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                mobileTab === tab.id ? "bg-[#FF6A00] text-black" : "text-white/40"
              }`}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-[#ff7a1a] text-black text-sm font-bold transition-all">
            <Wand2 className="w-3.5 h-3.5" />
            Generar edición
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── Desktop Body ─── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left panel – Templates + Style */}
        <div className="w-[280px] flex-shrink-0 overflow-y-auto border-r border-white/[0.06] bg-[#0d0d0d]">
          <LeftPanel settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Center – Preview (main focus) */}
        <div className="flex-1 overflow-hidden bg-[#090909] flex items-center justify-center">
          <PreviewPanel settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Right – AI Chat */}
        <div className="w-[320px] flex-shrink-0 border-l border-white/[0.06] bg-[#0d0d0d] flex flex-col overflow-hidden">
          <AIChatPanel settings={settings} updateSettings={updateSettings} />
        </div>
      </div>

      {/* ─── Mobile Body ─── */}
      <div className="flex md:hidden flex-1 overflow-hidden flex-col">
        <AnimatePresence mode="wait">
          {mobileTab === "estilo" && (
            <motion.div key="estilo" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex-1 overflow-y-auto">
              <LeftPanel settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {mobileTab === "ajustes" && (
            <motion.div key="ajustes" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex-1 overflow-hidden">
              <PreviewPanel settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {mobileTab === "ia" && (
            <motion.div key="ia" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="flex-1 overflow-hidden flex flex-col">
              <AIChatPanel settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Mobile generate button */}
        <div className="p-4 border-t border-white/[0.06] bg-[#0d0d0d]">
          <button className="w-full py-3.5 rounded-2xl bg-[#FF6A00] hover:bg-[#ff7a1a] text-black font-bold text-sm transition-all flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generar edición
          </button>
        </div>
      </div>
    </motion.div>
  );
}