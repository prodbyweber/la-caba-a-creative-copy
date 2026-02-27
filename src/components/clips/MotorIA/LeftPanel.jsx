import React, { useRef } from "react";
import { Upload, ChevronDown } from "lucide-react";
import { TEMPLATES } from "./templates";
import { base44 } from "@/api/base44Client";

const Label = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 mb-1.5">{children}</p>
);

const Select = ({ value, onChange, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#181818] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
  </div>
);

const Slider = ({ label, value, onChange, min = 0, max = 100 }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <Label>{label}</Label>
      <span className="text-[10px] text-[#FF6A00]">{value}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 rounded-full appearance-none bg-white/10 accent-[#FF6A00] cursor-pointer"
    />
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/50">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-[#FF6A00]" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${value ? "left-4.5 left-[18px]" : "left-0.5"}`} />
    </button>
  </div>
);

export default function LeftPanel({ settings, updateSettings }) {
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateSettings({ videoUrl: url, stockIndex: null });
  };

  return (
    <div className="p-4 space-y-5">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/60 pt-1">Proyecto</p>

      {/* Video Upload */}
      <div>
        <Label>Vídeo</Label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          className="border border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-[#FF6A00]/40 transition-colors group"
        >
          <Upload className="w-5 h-5 text-white/20 group-hover:text-[#FF6A00]/60 mx-auto mb-1.5 transition-colors" />
          <p className="text-[11px] text-white/30">Arrastra o haz clic</p>
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>
      </div>

      {/* Template */}
      <div>
        <Label>Plantilla</Label>
        <Select value={settings.template} onChange={(v) => updateSettings({ template: v })}>
          {Object.values(TEMPLATES).map((t) => (
            <option key={t.id} value={t.id}>{t.number} – {t.name}</option>
          ))}
        </Select>
      </div>

      {/* Text inputs */}
      <div className="space-y-2">
        <Label>Texto</Label>
        {["textLine1", "textLine2", "textLine3"].map((key, i) => (
          <input
            key={key}
            value={settings[key]}
            onChange={(e) => updateSettings({ [key]: e.target.value })}
            placeholder={["Línea principal", "Línea secundaria", "Micro texto"][i]}
            className="w-full bg-[#181818] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
          />
        ))}
      </div>

      {/* Position */}
      <div>
        <Label>Posición</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {["Arriba", "Centro", "Abajo"].map((pos) => (
            <button
              key={pos}
              onClick={() => updateSettings({ position: pos.toLowerCase() })}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                settings.position === pos.toLowerCase()
                  ? "bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]"
                  : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Color primario</Label>
          <div className="flex items-center gap-2 bg-[#181818] border border-white/[0.08] rounded-lg px-2 py-1.5">
            <input type="color" value={settings.primaryColor} onChange={(e) => updateSettings({ primaryColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
            <span className="text-[11px] text-white/40 font-mono">{settings.primaryColor}</span>
          </div>
        </div>
        <div>
          <Label>Color secundario</Label>
          <div className="flex items-center gap-2 bg-[#181818] border border-white/[0.08] rounded-lg px-2 py-1.5">
            <input type="color" value={settings.secondaryColor} onChange={(e) => updateSettings({ secondaryColor: e.target.value })} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0" />
            <span className="text-[11px] text-white/40 font-mono">{settings.secondaryColor}</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <Slider label="Tamaño texto" value={settings.textSize} onChange={(v) => updateSettings({ textSize: v })} />
      <Slider label="Letter spacing" value={settings.letterSpacing} onChange={(v) => updateSettings({ letterSpacing: v })} min={0} max={20} />
      <Slider label="Opacidad" value={settings.opacity} onChange={(v) => updateSettings({ opacity: v })} />

      {/* Animation Speed */}
      <div>
        <Label>Velocidad animación</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {["slow", "normal", "fast"].map((s) => (
            <button
              key={s}
              onClick={() => updateSettings({ animSpeed: s })}
              className={`py-1.5 rounded-lg text-[11px] font-medium transition-all border capitalize ${
                settings.animSpeed === s
                  ? "bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]"
                  : "bg-white/5 border-white/5 text-white/40 hover:border-white/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-1">
        <Label>Efectos</Label>
        <Toggle label="Sombra cinematográfica" value={settings.shadow} onChange={(v) => updateSettings({ shadow: v })} />
        <Toggle label="Glow suave" value={settings.glow} onChange={(v) => updateSettings({ glow: v })} />
        <Toggle label="Motion blur" value={settings.motionBlur} onChange={(v) => updateSettings({ motionBlur: v })} />
        <Toggle label="Grain overlay" value={settings.grain} onChange={(v) => updateSettings({ grain: v })} />
        <Toggle label="Blur tras texto" value={settings.bgBlur} onChange={(v) => updateSettings({ bgBlur: v })} />
      </div>
    </div>
  );
}