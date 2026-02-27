import React, { useRef, useState } from "react";
import { Upload, Film, Sliders, Palette, Type } from "lucide-react";
import { TEMPLATES, SUBTITLE_TEMPLATES } from "./templates";

const SectionTitle = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-3.5 h-3.5 text-white/30" />
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{children}</p>
  </div>
);

const Label = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30 mb-1.5">{children}</p>
);

const Slider = ({ label, value, onChange, min = 0, max = 100, unit = "" }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <Label>{label}</Label>
      <span className="text-[11px] font-mono text-[#FF6A00] bg-[#FF6A00]/10 px-1.5 py-0.5 rounded">{value}{unit}</span>
    </div>
    <input
      type="range" min={min} max={max} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 rounded-full appearance-none bg-white/10 accent-[#FF6A00] cursor-pointer"
    />
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[12px] text-white/50">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${value ? "bg-[#FF6A00]" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
    </button>
  </div>
);

export default function LeftPanel({ settings, updateSettings }) {
  const fileRef = useRef();
  const [section, setSection] = useState("templates"); // templates | text | effects

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateSettings({ videoUrl: url, stockIndex: null });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sub-nav */}
      <div className="flex border-b border-white/[0.06] px-3 pt-3">
        {[["subtitles", "Subtítulos"], ["templates", "Títulos"], ["text", "Texto"], ["effects", "Efectos"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`pb-2 px-3 text-[11px] font-semibold border-b-2 transition-all ${
              section === id ? "border-[#FF6A00] text-white" : "border-transparent text-white/35 hover:text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* ─── TEMPLATES TAB ─── */}
        {section === "templates" && (
          <div className="space-y-5">
            {/* Video Upload */}
            <div>
              <SectionTitle icon={Film}>Vídeo</SectionTitle>
              {settings.videoUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#FF6A00]/30 bg-[#181818]">
                  <video src={settings.videoUrl} className="w-full h-20 object-cover opacity-70" muted />
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <span className="text-[11px] text-white font-medium bg-black/60 px-2 py-1 rounded">Vídeo cargado</span>
                    <button
                      onClick={() => { updateSettings({ videoUrl: null }); }}
                      className="text-[10px] text-[#FF6A00] bg-black/60 px-2 py-1 rounded border border-[#FF6A00]/30"
                    >Cambiar</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-white/8 rounded-2xl p-6 text-center cursor-pointer hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/[0.02] transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 group-hover:bg-[#FF6A00]/10 transition-colors">
                    <Upload className="w-4 h-4 text-white/30 group-hover:text-[#FF6A00]/70 transition-colors" />
                  </div>
                  <p className="text-[11px] text-white/30 font-medium">Arrastra tu vídeo aquí</p>
                  <p className="text-[10px] text-white/15 mt-0.5">MP4, MOV • hasta 500MB</p>
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                </div>
              )}
            </div>

            {/* Template Gallery – Captions.ai style */}
            <div>
              <SectionTitle icon={Film}>Plantilla de estilo</SectionTitle>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(TEMPLATES).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ template: t.id })}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all text-left group ${
                      settings.template === t.id
                        ? "border-[#FF6A00] shadow-[0_0_16px_rgba(255,106,0,0.3)]"
                        : "border-transparent hover:border-white/20"
                    }`}
                    style={{ aspectRatio: "9/14" }}
                  >
                    {/* Poster */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br"
                      style={{ background: t.previewBg }}
                    />
                    {/* Sample text overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center px-2"
                      style={{ fontFamily: t.fontFamily }}
                    >
                      <span
                        className="block text-center leading-tight"
                        style={{
                          fontFamily: t.fontFamily,
                          fontWeight: t.fontWeight,
                          fontSize: "11px",
                          textTransform: t.textTransform,
                          letterSpacing: t.letterSpacing,
                          color: t.previewColor || "#fff",
                          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
                        }}
                      >
                        {t.previewText1}
                      </span>
                      {t.previewText2 && (
                        <span
                          className="block text-center mt-1 leading-tight"
                          style={{
                            fontFamily: t.previewFont2 || t.fontFamily,
                            fontWeight: "300",
                            fontSize: "8px",
                            letterSpacing: "0.06em",
                            color: t.previewColor2 || "rgba(255,255,255,0.7)",
                            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                          }}
                        >
                          {t.previewText2}
                        </span>
                      )}
                    </div>
                    {/* Selected badge */}
                    {settings.template === t.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FF6A00] flex items-center justify-center">
                        <span className="text-[8px] text-black font-black">✓</span>
                      </div>
                    )}
                    {/* Name */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-2 py-2">
                      <p className="text-[9px] font-bold text-white uppercase tracking-wider leading-tight">{t.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <SectionTitle icon={Sliders}>Posición del texto</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {[["arriba", "▲ Arriba"], ["centro", "● Centro"], ["abajo", "▼ Abajo"]].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => updateSettings({ position: val })}
                    className={`py-2 rounded-xl text-[10px] font-semibold transition-all border ${
                      settings.position === val
                        ? "bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]"
                        : "bg-white/4 border-white/6 text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Color palette */}
            <div>
              <SectionTitle icon={Palette}>Color personalizado</SectionTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {["#FFFFFF", "#FF6A00", "#FFE600", "#FF3B5C", "#00C896", "#A78BFA"].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ primaryColor: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${settings.primaryColor === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-all overflow-hidden relative">
                  <span className="text-[10px] text-white/40">+</span>
                  <input type="color" value={settings.primaryColor} onChange={(e) => updateSettings({ primaryColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </label>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {["#FF6A00", "#FFE600", "#FF3B5C", "#00C896", "#A78BFA", "#38BDF8"].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ secondaryColor: c })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${settings.secondaryColor === c ? "border-white scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 transition-all overflow-hidden relative">
                  <span className="text-[10px] text-white/40">+</span>
                  <input type="color" value={settings.secondaryColor} onChange={(e) => updateSettings({ secondaryColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── TEXT TAB ─── */}
        {section === "text" && (
          <div className="space-y-5">
            <div>
              <SectionTitle icon={Type}>Contenido de texto</SectionTitle>
              <div className="space-y-2">
                {[
                  { key: "textLine1", placeholder: "Línea principal", hint: "Grande" },
                  { key: "textLine2", placeholder: "Subtítulo", hint: "Media" },
                  { key: "textLine3", placeholder: "Micro texto / fecha", hint: "Pequeño" },
                ].map(({ key, placeholder, hint }) => (
                  <div key={key}>
                    <Label>{hint}</Label>
                    <input
                      value={settings[key]}
                      onChange={(e) => updateSettings({ [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/40 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SectionTitle icon={Sliders}>Tipografía</SectionTitle>
              <Slider label="Tamaño" value={settings.textSize} onChange={(v) => updateSettings({ textSize: v })} unit="%" />
              <Slider label="Espaciado" value={settings.letterSpacing} onChange={(v) => updateSettings({ letterSpacing: v })} min={0} max={20} />
              <Slider label="Opacidad" value={settings.opacity} onChange={(v) => updateSettings({ opacity: v })} unit="%" />
            </div>

            <div>
              <SectionTitle icon={Sliders}>Velocidad animación</SectionTitle>
              <div className="grid grid-cols-3 gap-2">
                {[["slow", "Lento"], ["normal", "Normal"], ["fast", "Rápido"]].map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => updateSettings({ animSpeed: val })}
                    className={`py-2 rounded-xl text-[11px] font-semibold transition-all border ${
                      settings.animSpeed === val
                        ? "bg-[#FF6A00]/10 border-[#FF6A00]/50 text-[#FF6A00]"
                        : "bg-white/4 border-white/6 text-white/40 hover:border-white/20"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── EFFECTS TAB ─── */}
        {section === "effects" && (
          <div className="space-y-1">
            <SectionTitle icon={Sliders}>Efectos visuales</SectionTitle>
            <Toggle label="Sombra cinematográfica" value={settings.shadow} onChange={(v) => updateSettings({ shadow: v })} />
            <Toggle label="Glow suave" value={settings.glow} onChange={(v) => updateSettings({ glow: v })} />
            <Toggle label="Motion blur" value={settings.motionBlur} onChange={(v) => updateSettings({ motionBlur: v })} />
            <Toggle label="Grain de película" value={settings.grain} onChange={(v) => updateSettings({ grain: v })} />
            <Toggle label="Blur detrás del texto" value={settings.bgBlur} onChange={(v) => updateSettings({ bgBlur: v })} />
          </div>
        )}
      </div>
    </div>
  );
}