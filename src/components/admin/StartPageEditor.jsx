import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Save, ExternalLink, Plus, Trash2, Loader2 } from "lucide-react";
import { TextInput } from "@/components/admin/SectionEditor";

const ENTITY_KEY = "start_page_config";

const DEFAULT_CONFIG = {
  // Hero
  hero_headline: "Creamos música, contenido y experiencias visuales para marcas y artistas modernos.",
  hero_subtext: "Producción creativa, dirección visual y campañas diseñadas para proyectos con identidad.",
  hero_btn1_label: "Agendar videollamada",
  hero_btn1_link: "#cta",
  hero_btn2_label: "Explorar trabajos",
  hero_btn2_link: "/Explorar",
  // Artists section
  artists_headline: "Servicios para artistas y creadores.",
  artists_subtext: "Desarrollamos proyectos musicales y visuales desde la identidad hasta el lanzamiento.",
  artists_cta_label: "Agenda un diagnóstico creativo",
  artists_cta_link: "#cta",
  // Brands section
  brands_headline: "Producción creativa para marcas modernas.",
  brands_subtext: "Creamos campañas, contenido y experiencias visuales diseñadas para conectar con cultura y audiencia real.",
  brands_cta_label: "Agenda una reunión estratégica",
  brands_cta_link: "#cta",
  // Choose path
  path_artist_title: "Artista / Creador",
  path_artist_desc: "Producción musical, contenido y desarrollo creativo para proyectos con identidad.",
  path_artist_cta: "Entrar como artista",
  path_artist_link: "/artists",
  path_brand_title: "Marca",
  path_brand_desc: "Campañas y contenido visual para marcas que buscan conectar con cultura y audiencia moderna.",
  path_brand_cta: "Entrar como marca",
  path_brand_link: "/brands",
  // Final CTA
  cta_headline: "Construyamos algo con identidad.",
  cta_subtext: "Agenda una videollamada y conversemos sobre tu proyecto, marca o idea creativa.",
  cta_btn1_label: "Agendar reunión",
  cta_btn1_link: "https://calendly.com",
  cta_btn2_label: "Contactar",
  cta_btn2_link: "mailto:hola@cabanacreative.es",
  // Nav
  nav_link1_label: "Artistas",
  nav_link1_href: "#artists",
  nav_link2_label: "Marcas",
  nav_link2_href: "#brands",
  nav_link3_label: "Plataforma",
  nav_link3_href: "/Explorar",
  nav_link4_label: "Contacto",
  nav_link4_href: "#cta",
};

const iClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/60 placeholder-white/20 transition-colors";
const labelClass = "block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5";

function Field({ label, value, onChange, multiline = false, placeholder = "" }) {
  if (multiline) {
    return (
      <div className="mb-3">
        <label className={labelClass}>{label}</label>
        <textarea value={value || ""} onChange={e => onChange(e.target.value)}
          className={iClass + " resize-none"} rows={2} placeholder={placeholder} />
      </div>
    );
  }
  return (
    <div className="mb-3">
      <label className={labelClass}>{label}</label>
      <input value={value || ""} onChange={e => onChange(e.target.value)}
        className={iClass} placeholder={placeholder} />
    </div>
  );
}

function ButtonPair({ label1, label2, link1, link2, onChange1, onChange2, onLinkChange1, onLinkChange2 }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
      <div>
        <label className={labelClass}>Botón 1 — Texto</label>
        <input value={label1 || ""} onChange={e => onChange1(e.target.value)} className={iClass} placeholder="Texto..." />
        <label className={labelClass + " mt-2"}>Botón 1 — Link</label>
        <input value={link1 || ""} onChange={e => onLinkChange1(e.target.value)} className={iClass} placeholder="https:// o #seccion" />
      </div>
      <div>
        <label className={labelClass}>Botón 2 — Texto</label>
        <input value={label2 || ""} onChange={e => onChange2(e.target.value)} className={iClass} placeholder="Texto..." />
        <label className={labelClass + " mt-2"}>Botón 2 — Link</label>
        <input value={link2 || ""} onChange={e => onLinkChange2(e.target.value)} className={iClass} placeholder="https:// o #seccion" />
      </div>
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">{title}</span>
        <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
      </div>
      {children}
    </div>
  );
}

export default function StartPageEditor() {
  const qc = useQueryClient();
  const [local, setLocal] = useState(null);
  const [saved, setSaved] = useState(false);

  // Store config in LandingConfig as a JSON blob under key "start_page_config"
  const { data: landingConfig, isLoading } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs[0] || null;
    },
  });

  useEffect(() => {
    if (landingConfig) {
      const stored = landingConfig.start_page_config;
      setLocal(stored ? { ...DEFAULT_CONFIG, ...stored } : { ...DEFAULT_CONFIG });
    }
  }, [landingConfig]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.LandingConfig.update(landingConfig.id, { start_page_config: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["landingConfig"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const set = (key, val) => setLocal(f => ({ ...f, [key]: val }));

  if (isLoading || !local) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>;
  }

  return (
    <div className="space-y-2">
      {/* Preview link */}
      <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
        <div>
          <p className="text-sm font-semibold text-white">Página /start</p>
          <p className="text-xs text-white/40">Landing de conversión independiente</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/start"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver página
          </a>
          <button
            onClick={() => saveMutation.mutate(local)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? "¡Guardado!" : "Guardar"}
          </button>
        </div>
      </div>

      {/* NAV */}
      <SubSection title="Navegación">
        <div className="grid grid-cols-2 gap-x-4">
          {[1,2,3,4].map(n => (
            <div key={n} className="mb-3">
              <label className={labelClass}>Link {n} — Texto</label>
              <input value={local[`nav_link${n}_label`] || ""} onChange={e => set(`nav_link${n}_label`, e.target.value)} className={iClass} placeholder={`Link ${n}`} />
              <label className={labelClass + " mt-1.5"}>Link {n} — URL</label>
              <input value={local[`nav_link${n}_href`] || ""} onChange={e => set(`nav_link${n}_href`, e.target.value)} className={iClass} placeholder="#seccion o /ruta" />
            </div>
          ))}
        </div>
      </SubSection>

      {/* HERO */}
      <SubSection title="Hero — Sección Principal">
        <Field label="Titular principal" value={local.hero_headline} onChange={v => set("hero_headline", v)} multiline placeholder="Creamos música, contenido y experiencias..." />
        <Field label="Subtexto" value={local.hero_subtext} onChange={v => set("hero_subtext", v)} multiline placeholder="Producción creativa, dirección visual..." />
        <ButtonPair
          label1={local.hero_btn1_label} link1={local.hero_btn1_link}
          label2={local.hero_btn2_label} link2={local.hero_btn2_link}
          onChange1={v => set("hero_btn1_label", v)} onLinkChange1={v => set("hero_btn1_link", v)}
          onChange2={v => set("hero_btn2_label", v)} onLinkChange2={v => set("hero_btn2_link", v)}
        />
        <p className="text-[10px] text-white/25">Tip: usa <code className="text-white/40">#cta</code> para scroll a la sección final, o un link de Calendly/WhatsApp directo.</p>
      </SubSection>

      {/* ARTISTS */}
      <SubSection title="Sección — Artistas y Creadores">
        <Field label="Titular" value={local.artists_headline} onChange={v => set("artists_headline", v)} multiline />
        <Field label="Subtexto" value={local.artists_subtext} onChange={v => set("artists_subtext", v)} multiline />
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <div>
            <label className={labelClass}>Botón CTA — Texto</label>
            <input value={local.artists_cta_label || ""} onChange={e => set("artists_cta_label", e.target.value)} className={iClass} placeholder="Agenda un diagnóstico..." />
          </div>
          <div>
            <label className={labelClass}>Botón CTA — Link</label>
            <input value={local.artists_cta_link || ""} onChange={e => set("artists_cta_link", e.target.value)} className={iClass} placeholder="#cta o Calendly URL" />
          </div>
        </div>
      </SubSection>

      {/* BRANDS */}
      <SubSection title="Sección — Marcas">
        <Field label="Titular" value={local.brands_headline} onChange={v => set("brands_headline", v)} multiline />
        <Field label="Subtexto" value={local.brands_subtext} onChange={v => set("brands_subtext", v)} multiline />
        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <div>
            <label className={labelClass}>Botón CTA — Texto</label>
            <input value={local.brands_cta_label || ""} onChange={e => set("brands_cta_label", e.target.value)} className={iClass} placeholder="Agenda una reunión..." />
          </div>
          <div>
            <label className={labelClass}>Botón CTA — Link</label>
            <input value={local.brands_cta_link || ""} onChange={e => set("brands_cta_link", e.target.value)} className={iClass} placeholder="#cta o Calendly URL" />
          </div>
        </div>
      </SubSection>

      {/* CHOOSE PATH */}
      <SubSection title="Elige tu camino — 2 bloques">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Bloque Artista</p>
            <div><label className={labelClass}>Título</label><input value={local.path_artist_title || ""} onChange={e => set("path_artist_title", e.target.value)} className={iClass} /></div>
            <div><label className={labelClass}>Descripción</label><textarea value={local.path_artist_desc || ""} onChange={e => set("path_artist_desc", e.target.value)} className={iClass + " resize-none"} rows={2} /></div>
            <div><label className={labelClass}>Texto botón</label><input value={local.path_artist_cta || ""} onChange={e => set("path_artist_cta", e.target.value)} className={iClass} /></div>
            <div><label className={labelClass}>Link</label><input value={local.path_artist_link || ""} onChange={e => set("path_artist_link", e.target.value)} className={iClass} placeholder="/artists" /></div>
          </div>
          <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Bloque Marca</p>
            <div><label className={labelClass}>Título</label><input value={local.path_brand_title || ""} onChange={e => set("path_brand_title", e.target.value)} className={iClass} /></div>
            <div><label className={labelClass}>Descripción</label><textarea value={local.path_brand_desc || ""} onChange={e => set("path_brand_desc", e.target.value)} className={iClass + " resize-none"} rows={2} /></div>
            <div><label className={labelClass}>Texto botón</label><input value={local.path_brand_cta || ""} onChange={e => set("path_brand_cta", e.target.value)} className={iClass} /></div>
            <div><label className={labelClass}>Link</label><input value={local.path_brand_link || ""} onChange={e => set("path_brand_link", e.target.value)} className={iClass} placeholder="/brands" /></div>
          </div>
        </div>
      </SubSection>

      {/* FINAL CTA */}
      <SubSection title="CTA Final">
        <Field label="Titular" value={local.cta_headline} onChange={v => set("cta_headline", v)} multiline placeholder="Construyamos algo con identidad." />
        <Field label="Subtexto" value={local.cta_subtext} onChange={v => set("cta_subtext", v)} multiline />
        <ButtonPair
          label1={local.cta_btn1_label} link1={local.cta_btn1_link}
          label2={local.cta_btn2_label} link2={local.cta_btn2_link}
          onChange1={v => set("cta_btn1_label", v)} onLinkChange1={v => set("cta_btn1_link", v)}
          onChange2={v => set("cta_btn2_label", v)} onLinkChange2={v => set("cta_btn2_link", v)}
        />
        <p className="text-[10px] text-white/25">Conecta Calendly, WhatsApp (<code className="text-white/40">https://wa.me/34...</code>), Google Meet o un email.</p>
      </SubSection>

      {/* Save bottom */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => saveMutation.mutate(local)}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? "¡Guardado!" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}