import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionEditor, TextInput, ImageUpload } from "@/components/admin/SectionEditor";
import BannersEditor from "@/components/admin/BannersEditor";
import GuestPopupEditor from "@/components/admin/GuestPopupEditor";
import StartPageEditor from "@/components/admin/StartPageEditor";
import StartCreadoresEditor from "@/components/admin/StartCreadoresEditor";
import PlansEditor from "@/components/admin/PlansEditor";
import FormsEditor from "@/components/admin/FormsEditor";
import StoriesEditor from "@/components/admin/StoriesEditor.jsx";
import { Link } from "react-router-dom";
import { Upload, Save, Trash2, ZoomIn, X, ExternalLink } from "lucide-react";

export default function LandingEditorInner() {
  const [isUploading, setIsUploading] = useState(false);
  const [previewLogoUrl, setPreviewLogoUrl] = useState(null);
  const [showGuestPopupEditor, setShowGuestPopupEditor] = useState(false);
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["landingConfig"],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      if (configs.length > 0) return configs[0];
      return await base44.entities.LandingConfig.create({
        hero_subtitle: "",
        hero_cta_text: "Aplicar a La Cabaña Creative",
        hero_image_url: "",
        brand_logos: [],
        explorar_guest_blocked: false,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingConfig.update(config.id, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["landingConfig"] });
      const previous = queryClient.getQueryData(["landingConfig"]);
      queryClient.setQueryData(["landingConfig"], (old) => old ? { ...old, ...data } : old);
      return { previous };
    },
    onError: (_e, _d, ctx) => { if (ctx?.previous) queryClient.setQueryData(["landingConfig"], ctx.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landingConfig"] }),
  });

  const updateField = (field, value) => updateMutation.mutate({ [field]: value });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-6 w-full">

      {/* Save bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-white/25">Edita el contenido activo de la landing page</p>
        <div className="flex items-center gap-2">
          <Link
            to="/landing"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Landing
          </Link>
          <button
            onClick={() => updateMutation.mutate(config)}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 rounded-xl text-white text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Sections grid — 2 columns on large screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* ── Hero Principal ── */}
        <SectionCard title="Hero Principal" accent="emerald">
          <Field label="Tagline / Subtítulo">
            <textarea
              value={config.hero_subtitle || ""}
              onChange={(e) => updateField("hero_subtitle", e.target.value)}
              rows={3}
              placeholder="Producción, imagen y narrativa para artistas que van en serio."
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors"
            />
          </Field>
          <Field label="Texto del botón CTA">
            <input
              value={config.hero_cta_text || ""}
              onChange={(e) => updateField("hero_cta_text", e.target.value)}
              placeholder="Aplicar a La Cabaña Creative"
              className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </Field>
          <Field label="Imagen de fondo (hero)">
            <ImageUploadField
              value={config.hero_image_url}
              onChange={(v) => updateField("hero_image_url", v)}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              accept="image/*"
              label="Subir imagen"
            />
          </Field>
          <Field label="Video de fondo (hero)">
            {config.hero_video_url && (
              <div className="mb-2 relative rounded-xl overflow-hidden border border-white/10">
                <video src={config.hero_video_url} className="w-full h-28 object-cover" muted loop autoPlay playsInline />
                <button
                  onClick={() => updateField("hero_video_url", "")}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <ImageUploadField
              value={null}
              onChange={(v) => updateField("hero_video_url", v)}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              accept="video/mp4,video/webm,video/mov,video/quicktime"
              label={isUploading ? "Subiendo..." : "Subir video (máx. 50 MB)"}
              maxSize={50}
            />
          </Field>
        </SectionCard>

        {/* ── Banners de Portada ── */}
        <SectionCard title="Banners de Portada" accent="violet">
          <div className="mb-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl flex items-center justify-between gap-3">
            <p className="text-xs text-white/40">Gestiona los 3 bloques de banner de la home desde el editor dedicado.</p>
            <Link to="/BannersAdmin" className="flex-shrink-0 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 rounded-lg text-white text-xs font-semibold transition-colors whitespace-nowrap">
              Abrir editor →
            </Link>
          </div>
          <BannersEditor configId={config.id} config={config} />
        </SectionCard>

        {/* ── Logos de Marcas ── */}
        <SectionCard title="Logos de Marcas Colaboradoras" accent="blue">
          {previewLogoUrl && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreviewLogoUrl(null)}>
              <div className="relative bg-white rounded-2xl p-6 max-w-xs w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <button onClick={() => setPreviewLogoUrl(null)} className="absolute top-2 right-2 p-1 rounded-lg text-gray-500 hover:text-gray-800"><X className="w-4 h-4" /></button>
                <img src={previewLogoUrl} alt="preview" className="max-w-full max-h-40 object-contain" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {(config.brand_logos || []).map((logo, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-white/[0.03] border border-white/[0.07] rounded-xl">
                {/* delete */}
                <button onClick={() => updateField("brand_logos", config.brand_logos.filter((_, j) => j !== i))}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400/70 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {/* thumbnail */}
                <button type="button" onClick={() => logo && setPreviewLogoUrl(logo)}
                  className="flex-shrink-0 w-14 h-9 bg-white rounded-lg overflow-hidden group relative border border-white/10">
                  {logo
                    ? <><img src={logo} alt="" className="w-full h-full object-contain p-1" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><ZoomIn className="w-3 h-3 text-white" /></div></>
                    : <span className="text-[9px] text-gray-400 flex items-center justify-center h-full">vacío</span>
                  }
                </button>
                {/* url */}
                <input
                  type="text" value={logo}
                  onChange={(e) => { const n = [...config.brand_logos]; n[i] = e.target.value; updateField("brand_logos", n); }}
                  placeholder="URL del logo"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-lg text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {/* upload */}
                <label className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400/70 hover:text-blue-400 transition-colors cursor-pointer flex-shrink-0">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      setIsUploading(true);
                      try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); const n = [...config.brand_logos]; n[i] = file_url; updateField("brand_logos", n); }
                      catch (err) { console.error(err); } finally { setIsUploading(false); }
                    }} />
                  <Upload className="w-3.5 h-3.5" />
                </label>
              </div>
            ))}
            {/* Add new */}
            <label className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white/70 cursor-pointer transition-colors">
              <input type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setIsUploading(true);
                  try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); updateField("brand_logos", [...(config.brand_logos || []), file_url]); }
                  catch (err) { console.error(err); } finally { setIsUploading(false); }
                }} />
              <Upload className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{isUploading ? "Subiendo..." : "Añadir logo"}</span>
            </label>
          </div>
        </SectionCard>

        {/* ── Popup Invitados ── */}
        <SectionCard title="Acceso y Popup de Invitados" accent="orange">
          <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-3">
            <div>
              <p className="text-sm font-medium text-white">Bloqueo de Explorar</p>
              <p className="text-xs text-white/30 mt-0.5">
                {config.explorar_guest_blocked ? "Usuarios no registrados ven el popup de acceso" : "Explorar es público para todos"}
              </p>
            </div>
            <button
              onClick={() => updateField("explorar_guest_blocked", !config.explorar_guest_blocked)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${config.explorar_guest_blocked ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}
            >
              {config.explorar_guest_blocked ? "Bloqueado" : "Público"}
            </button>
          </div>
          <button
            onClick={() => setShowGuestPopupEditor(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-xl transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Editar diseño del popup</p>
              <p className="text-xs text-white/35 mt-0.5">Título, subtítulo, botones y colores</p>
            </div>
            <span className="text-blue-400 text-sm font-medium flex-shrink-0">Editar →</span>
          </button>
        </SectionCard>

        {/* ── /start — Landing Principal ── */}
        <div className="xl:col-span-2">
          <SectionCard title="Página /start — Landing de Conversión" accent="emerald" collapsible defaultOpen={false}>
            <StartPageEditor />
          </SectionCard>
        </div>

        {/* ── Sección Creadores ── */}
        <div className="xl:col-span-2">
          <SectionCard title="Sección Creadores (carrusel + servicios)" accent="purple" collapsible defaultOpen={false}>
            <StartCreadoresEditor />
          </SectionCard>
        </div>

        {/* ── Planes de Suscripción ── */}
        <div className="xl:col-span-2">
          <SectionCard title="Planes de Suscripción" accent="yellow" collapsible defaultOpen={false}>
            <PlansEditor />
          </SectionCard>
        </div>

        {/* ── Formularios ── */}
        <div className="xl:col-span-2">
          <SectionCard title="Gestión de Formularios" accent="pink" collapsible defaultOpen={false}>
            <FormsEditor />
          </SectionCard>
        </div>

        {/* ── Historias ── */}
        <div className="xl:col-span-2">
          <SectionCard title="Historias / Testimonios" accent="teal" collapsible defaultOpen={false}>
            <StoriesEditor
              testimonials={config.testimonials || []}
              onSave={(t) => updateField("testimonials", t)}
            />
          </SectionCard>
        </div>

      </div>

      <GuestPopupEditor isOpen={showGuestPopupEditor} onClose={() => setShowGuestPopupEditor(false)} />
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */

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

function SectionCard({ title, accent = "emerald", children, collapsible = false, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={`rounded-2xl border ${accentMap[accent]} overflow-hidden`}>
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 ${collapsible ? "cursor-pointer hover:bg-white/[0.02] transition-colors" : "cursor-default"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotMap[accent]}`} />
          <h3 className="text-sm font-semibold text-white text-left">{title}</h3>
        </div>
        {collapsible && (
          <span className="text-white/20 text-xs">{open ? "▲" : "▼"}</span>
        )}
      </button>
      {(!collapsible || open) && (
        <div className="px-5 pb-5 pt-1 border-t border-white/[0.05]">
          {children}
        </div>
      )}
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

function ImageUploadField({ value, onChange, isUploading, setIsUploading, accept = "image/*", label = "Subir imagen", maxSize = 10 }) {
  return (
    <label className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/10 cursor-pointer transition-colors ${isUploading ? "opacity-50 pointer-events-none" : "bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"}`}>
      <input type="file" accept={accept} className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (maxSize && file.size > maxSize * 1024 * 1024) { alert(`El archivo no puede superar ${maxSize} MB.`); return; }
          setIsUploading(true);
          try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); onChange(file_url); }
          finally { setIsUploading(false); }
        }} />
      <Upload className="w-3.5 h-3.5 text-white/40" />
      <span className="text-xs text-white/40 font-medium">{label}</span>
    </label>
  );
}