import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { FA_DEFAULTS } from "@/lib/fullAccessDefaults";

const FIELDS = [
  { key: "hero_image_url", label: "Fotografía del hero" },
  { key: "hero_eyebrow", label: "Antetítulo" },
  { key: "hero_title", label: "Titular principal", wide: true },
  { key: "hero_subtitle", label: "Subtítulo", wide: true },
  { key: "vimeo_url", label: "URL del VSL (Vimeo)", wide: true },
  { key: "gate_seconds", label: "Segundo de la captura", type: "number" },
  { key: "gate_title", label: "Título de la captura" },
  { key: "gate_text", label: "Texto de la captura", wide: true },
  { key: "stats_title", label: "Título de trayectoria" },
  { key: "stats_intro", label: "Descripción de trayectoria", wide: true },
  { key: "collabs_title", label: "Título de colaboraciones" },
  { key: "demo_title", label: "Título demo/master" },
  { key: "demo_subtitle", label: "Subtítulo demo/master", wide: true },
  { key: "projects_title", label: "Título proyectos" },
  { key: "projects_subtitle", label: "Subtítulo proyectos", wide: true },
  { key: "method_title", label: "Título metodología" },
  { key: "method_subtitle", label: "Subtítulo metodología", wide: true },
  { key: "form_intro", label: "Texto del formulario", wide: true },
  { key: "booking_duration", label: "Duración sesión (min)", type: "number" },
  { key: "booking_days_ahead", label: "Días de agenda", type: "number" },
  { key: "booking_start_hour", label: "Hora inicio", type: "number" },
  { key: "booking_end_hour", label: "Hora fin", type: "number" },
  { key: "confirm_title", label: "Título de confirmación" },
  { key: "confirm_text", label: "Texto de confirmación", wide: true },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState(FA_DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.FullAccessSettings.list("-created_date", 1);
      if (list?.[0]) {
        setRecordId(list[0].id);
        setSettings({ ...FA_DEFAULTS, ...list[0] });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {};
    FIELDS.forEach((field) => {
      payload[field.key] = settings[field.key];
    });
    payload.collab_logos = settings.collab_logos || [];
    if (recordId) {
      await base44.entities.FullAccessSettings.update(recordId, payload);
    } else {
      const created = await base44.entities.FullAccessSettings.create(payload);
      setRecordId(created.id);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 size={14} className="animate-spin" /> Cargando...
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Contenido del hero y textos</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Fotografía, VSL, textos de cada sección y configuración de la agenda.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {field.label}
            </span>
            <input
              type={field.type === "number" ? "number" : "text"}
              value={settings[field.key] ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                })
              }
              className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#ff5833] px-4 py-2 text-xs font-semibold text-white"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Guardar contenido
      </button>
    </div>
  );
}