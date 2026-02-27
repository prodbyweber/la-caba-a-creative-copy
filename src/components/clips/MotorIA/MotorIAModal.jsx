import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import LeftPanel from "./LeftPanel";
import AIChatPanel from "./AIChatPanel";
import PreviewPanel from "./PreviewPanel";

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
  });

  const updateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#0b0b0b]">
        <div className="flex items-center gap-3">
          <span className="text-lg">🎬</span>
          <span className="font-semibold text-white tracking-wide">Motor de IA</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 uppercase tracking-widest ml-1">
            Beta
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left */}
        <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-white/[0.06] bg-[#0b0b0b]">
          <LeftPanel settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Center Chat */}
        <div className="flex-1 overflow-hidden bg-[#0f0f0f] border-r border-white/[0.06]">
          <AIChatPanel settings={settings} updateSettings={updateSettings} />
        </div>

        {/* Right Preview */}
        <div className="w-[380px] flex-shrink-0 overflow-hidden bg-[#0b0b0b]">
          <PreviewPanel settings={settings} updateSettings={updateSettings} />
        </div>
      </div>
    </motion.div>
  );
}