import React from "react";

const accentMap = {
  emerald: "border-emerald-500/20 bg-emerald-500/[0.03]",
  violet:  "border-violet-500/20 bg-violet-500/[0.03]",
  blue:    "border-blue-500/20 bg-blue-500/[0.03]",
  orange:  "border-orange-500/20 bg-orange-500/[0.03]",
  purple:  "border-purple-500/20 bg-purple-500/[0.03]",
  yellow:  "border-yellow-500/20 bg-yellow-500/[0.03]",
  pink:    "border-pink-500/20 bg-pink-500/[0.03]",
  teal:    "border-teal-500/20 bg-teal-500/[0.03]",
};

const dotMap = {
  emerald: "bg-emerald-400",
  violet:  "bg-violet-400",
  blue:    "bg-blue-400",
  orange:  "bg-orange-400",
  purple:  "bg-purple-400",
  yellow:  "bg-yellow-400",
  pink:    "bg-pink-400",
  teal:    "bg-teal-400",
};

function SectionCard({ title, accent = "emerald", children }) {
  return (
    <div className={`rounded-2xl border ${accentMap[accent]} overflow-hidden`}>
      <div className="w-full flex items-center gap-2.5 px-5 py-4">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotMap[accent]}`} />
        <h3 className="text-sm font-semibold text-white text-left">{title}</h3>
      </div>
      <div className="px-5 pb-5 pt-1 border-t border-white/[0.05]">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function ApplicationVideoEditor({ config, updateField }) {
  if (!config) return null;

  return (
    <SectionCard title="Video Post-Solicitud" accent="orange">
      <div className="mb-3 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl">
        <p className="text-xs text-white/40 mb-2">
          Configura el video que se muestra después de que un usuario envía la solicitud. Se mostrará antes del Calendly.
        </p>
      </div>

      <Field label="ID del Video de YouTube">
        <input
          type="text"
          value={config.application_youtube_video_id || ""}
          onChange={(e) => updateField("application_youtube_video_id", e.target.value)}
          placeholder="ej: im6BfAvTsLA (sin youtube.com/embed/)"
          className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors"
        />
        <p className="text-[10px] text-white/25 mt-1.5">
          Solo el ID del video. Ejemplo: si la URL es youtube.com/watch?v=im6BfAvTsLA, el ID es "im6BfAvTsLA"
        </p>
      </Field>

      <Field label="Título del Video (opcional)">
        <input
          type="text"
          value={config.application_video_title || ""}
          onChange={(e) => updateField("application_video_title", e.target.value)}
          placeholder="ej: Prepárate para tu videollamada"
          className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors"
        />
      </Field>

      <Field label="Subtítulo del Video (opcional)">
        <textarea
          value={config.application_video_subtitle || ""}
          onChange={(e) => updateField("application_video_subtitle", e.target.value)}
          placeholder="ej: Antes de agendar, mira este video de 5 minutos para estar preparado para la reunión."
          rows={3}
          className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-colors resize-none"
        />
      </Field>

      {/* Preview */}
      {config.application_youtube_video_id && (
        <div className="mt-4">
          <label className="text-xs font-semibold text-white/60 mb-2 block">Vista Previa</label>
          <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden border border-white/10 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${config.application_youtube_video_id}?rel=0&modestbranding=1`}
              className="absolute top-0 left-0 w-full h-full"
              title="Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
}