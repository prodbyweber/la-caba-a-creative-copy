import React, { useState, useEffect } from "react";
import { GripVertical, Eye, EyeOff } from "lucide-react";

const DEFAULT_SECTIONS = [
  { key: "explorar",    label: "Explorar" },
  { key: "creadores",   label: "Creadores" },
  { key: "whatwedo",   label: "¿Qué hacemos?" },
  { key: "choosepath", label: "Elige tu camino" },
  { key: "footer",     label: "Footer" },
];

export default function SectionsOrderEditor({ config, onSave }) {
  const [sections, setSections] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    const savedOrder = config?.sections_order || [];
    const savedEnabled = config?.sections_enabled || {};
    
    // Build list from saved order, adding any missing sections at the end
    const ordered = savedOrder.length > 0
      ? savedOrder.map(k => DEFAULT_SECTIONS.find(s => s.key === k)).filter(Boolean)
      : [...DEFAULT_SECTIONS];
    
    // Add any new sections not yet in saved order
    DEFAULT_SECTIONS.forEach(s => {
      if (!ordered.find(o => o.key === s.key)) ordered.push(s);
    });

    setSections(ordered.map(s => ({
      ...s,
      enabled: savedEnabled[s.key] !== false,
    })));
  }, [config]);

  const handleDragStart = (e, idx) => {
    setDragging(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(idx);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragging === null || dragging === idx) return;
    const next = [...sections];
    const [moved] = next.splice(dragging, 1);
    next.splice(idx, 0, moved);
    setSections(next);
    setDragging(null);
    setDragOver(null);
    save(next);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  const toggleEnabled = (key) => {
    const next = sections.map(s => s.key === key ? { ...s, enabled: !s.enabled } : s);
    setSections(next);
    save(next);
  };

  const save = (list) => {
    const sections_order = list.map(s => s.key);
    const sections_enabled = {};
    list.forEach(s => { sections_enabled[s.key] = s.enabled; });
    onSave({ sections_order, sections_enabled });
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/30 mb-3">Arrastra para reordenar. Usa el ojo para mostrar/ocultar.</p>
      {sections.map((section, idx) => (
        <div
          key={section.key}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none
            ${dragging === idx ? "opacity-40 scale-[0.98]" : ""}
            ${dragOver === idx && dragging !== idx ? "border-white/30 bg-white/[0.08]" : "border-white/[0.08] bg-white/[0.03]"}
          `}
        >
          <GripVertical className="w-4 h-4 text-white/20 flex-shrink-0" />
          <span className="flex-1 text-sm font-medium text-white/70">{section.label}</span>
          <span className="text-[10px] text-white/20 font-mono">{idx + 1}</span>
          <button
            onClick={() => toggleEnabled(section.key)}
            className={`p-1.5 rounded-lg transition-colors ${section.enabled ? "text-emerald-400 hover:bg-emerald-500/10" : "text-white/20 hover:bg-white/[0.05]"}`}
            title={section.enabled ? "Visible" : "Oculta"}
          >
            {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      ))}
    </div>
  );
}