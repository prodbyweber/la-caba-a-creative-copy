import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { PODCAST_DEFAULTS } from "@/lib/podcastDefaults";
import MediaField from "@/components/fullaccess/admin/MediaField";

const FIELDS = [
  { key: "title", label: "Titular", wide: true },
  { key: "description", label: "Descripción", type: "textarea", wide: true },
  {
    key: "video_url",
    label: "Enlace de Vimeo / YouTube o código embed",
    type: "textarea",
    wide: true,
    hint: "https://vimeo.com/... · https://youtu.be/... · <iframe src=...>",
  },
  {
    key: "cover_url",
    label: "Portada cinematográfica",
    type: "media",
    accept: "image/*",
    wide: true,
    hint: "Si la dejas vacía se usa la miniatura del vídeo",
  },
  { key: "credits", label: "Créditos bajo el vídeo", wide: true },
  { key: "logo_jbl_url", label: "Logotipo JBL", type: "media", accept: "image/*" },
  {
    key: "logo_academy_url",
    label: "Logotipo Martin Garrix Academy",
    type: "media",
    accept: "image/*",
  },
  { key: "is_visible", label: "Mostrar la sección", type: "bool" },
];

export default function PodcastPanel() {
  const queryClient = useQueryClient();
  const [podcast, setPodcast] = useState(PODCAST_DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await base44.entities.FullAccessPodcast.list("-created_date", 1);
      if (list?.[0]) {
        setRecordId(list[0].id);
        setPodcast({ ...PODCAST_DEFAULTS, ...list[0] });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = {};
    FIELDS.forEach((field) => {
      payload[field.key] = podcast[field.key];
    });
    if (recordId) {
      await base44.entities.FullAccessPodcast.update(recordId, payload);
    } else {
      const created = await base44.entities.FullAccessPodcast.create(payload);
      setRecordId(created.id);
    }
    queryClient.invalidateQueries({ queryKey: ["full-access-content"] });
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
      <h2 className="text-lg font-semibold text-white">Sección de podcast</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Titular, vídeo y créditos de la sección que va debajo de las cifras y las marcas.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {field.label}
            </span>
            {field.type === "media" ? (
              <MediaField
                value={podcast[field.key]}
                onChange={(next) => setPodcast({ ...podcast, [field.key]: next })}
                accept={field.accept}
                hint={field.hint}
              />
            ) : field.type === "bool" ? (
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={podcast[field.key] !== false}
                  onChange={(e) => setPodcast({ ...podcast, [field.key]: e.target.checked })}
                />
                {podcast[field.key] !== false ? "Activado" : "Desactivado"}
              </label>
            ) : field.type === "textarea" ? (
              <textarea
                rows={field.key === "video_url" ? 3 : 2}
                value={podcast[field.key] ?? ""}
                placeholder={field.hint}
                onChange={(e) => setPodcast({ ...podcast, [field.key]: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
              />
            ) : (
              <input
                type="text"
                value={podcast[field.key] ?? ""}
                onChange={(e) => setPodcast({ ...podcast, [field.key]: e.target.value })}
                className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
              />
            )}
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
        Guardar podcast
      </button>
    </div>
  );
}