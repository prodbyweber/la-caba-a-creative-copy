import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Save, Check } from "lucide-react";
import { TextField, ImageField } from "@/components/admin/landing/Field";
import { DEFAULT_SETTINGS } from "@/lib/landingDefaults";

export default function HeroPanel() {
  const [record, setRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const load = async () => {
      const list = await base44.entities.SiteSettings.list("-created_date", 1);
      setRecord(list[0] || { ...DEFAULT_SETTINGS });
    };
    load();
  }, []);

  if (!record) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  const set = (key) => (value) => setRecord((r) => ({ ...r, [key]: value }));

  const save = async () => {
    setSaving(true);
    setNotice("");
    try {
      if (record.id) {
        const { id, created_date, updated_date, created_by_id, ...rest } = record;
        await base44.entities.SiteSettings.update(id, rest);
      } else {
        await base44.entities.SiteSettings.create(record);
      }
      const list = await base44.entities.SiteSettings.list("-created_date", 1);
      setRecord(list[0] || record);
      setNotice("Guardado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 max-w-2xl">
      <p className="text-[11px] text-white/30">
        Póster del hero (se ve mientras cargan los vídeos y si el móvil bloquea la reproducción), SEO y
        datos de contacto. Los vídeos en rotación se gestionan en la pestaña «Vídeos hero».
      </p>

      <ImageField
        label="Póster del hero"
        value={record.hero_poster_url}
        onChange={set("hero_poster_url")}
        hint="Imagen fija de respaldo."
      />

      <TextField label="Título SEO" value={record.seo_title} onChange={set("seo_title")} />
      <TextField
        label="Descripción SEO"
        value={record.seo_description}
        onChange={set("seo_description")}
        textarea
        rows={3}
      />
      <TextField label="Email de contacto" value={record.contact_email} onChange={set("contact_email")} />
      <TextField label="Instagram" value={record.social_instagram} onChange={set("social_instagram")} />
      <TextField label="TikTok" value={record.social_tiktok} onChange={set("social_tiktok")} />
      <TextField label="YouTube" value={record.social_youtube} onChange={set("social_youtube")} />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Guardar
        </button>
        {notice && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-300">
            <Check size={12} /> {notice}
          </span>
        )}
      </div>
    </div>
  );
}