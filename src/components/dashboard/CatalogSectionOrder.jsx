import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, X, Check } from "lucide-react";

// Default order: tracks first, then video, projects, photos
export const DEFAULT_SECTION_ORDER = ["tracks", "video", "projects", "photos"];

const SECTION_META = {
  tracks:   { label: "Tracks" },
  video:    { label: "Video" },
  projects: { label: "Proyectos" },
  photos:   { label: "Fotos" },
};

export default function CatalogSectionOrder({ order, onChange, onClose }) {
  const [items, setItems] = useState(order);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const handleDragStart = (idx) => setDragging(idx);
  const handleDragEnter = (idx) => setDragOver(idx);

  const handleDragEnd = () => {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      const next = [...items];
      const [moved] = next.splice(dragging, 1);
      next.splice(dragOver, 0, moved);
      setItems(next);
    }
    setDragging(null);
    setDragOver(null);
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...items];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setItems(next);
  };

  const moveDown = (idx) => {
    if (idx === items.length - 1) return;
    const next = [...items];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setItems(next);
  };

  const handleSave = () => {
    onChange(items);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: "#141416" }}
    >
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Orden</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors">
          <X className="w-3 h-3 text-white/30" />
        </button>
      </div>

      <div className="px-2 py-1.5 space-y-0.5">
        {items.map((key, idx) => (
          <div
            key={key}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab transition-colors select-none ${
              dragOver === idx ? "bg-white/10" : "hover:bg-white/[0.04]"
            }`}
          >
            <GripVertical className="w-3 h-3 text-white/20 flex-shrink-0" />
            <span className="flex-1 text-xs text-white/60">{SECTION_META[key]?.label}</span>
            <div className="flex flex-col gap-0.5 flex-shrink-0">
              <button
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                className="w-4 h-3 flex items-center justify-center disabled:opacity-20 hover:text-white text-white/30 transition-colors"
              >
                <svg viewBox="0 0 8 5" className="w-2 h-2 fill-current"><path d="M4 0L8 5H0z"/></svg>
              </button>
              <button
                onClick={() => moveDown(idx)}
                disabled={idx === items.length - 1}
                className="w-4 h-3 flex items-center justify-center disabled:opacity-20 hover:text-white text-white/30 transition-colors"
              >
                <svg viewBox="0 0 8 5" className="w-2 h-2 fill-current rotate-180"><path d="M4 0L8 5H0z"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-2 pb-2 pt-1 border-t border-white/[0.06] mt-1">
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-white/70 hover:text-white text-xs font-semibold transition-all"
        >
          <Check className="w-3 h-3" />
          Aplicar
        </button>
      </div>
    </motion.div>
  );
}