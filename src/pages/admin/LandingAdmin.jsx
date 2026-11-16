import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  UploadCloud,
  Loader2,
  Check,
  ExternalLink,
  RotateCcw,
  Layout,
  Sparkles,
  Video,
  Mic2,
  Disc3,
  Settings2,
  Inbox,
  History,
} from "lucide-react";
import { useLandingDraft } from "@/components/admin/landing/useLandingDraft";
import SectionsPanel from "@/components/admin/landing/SectionsPanel";
import FeaturesPanel from "@/components/admin/landing/FeaturesPanel";
import VideosPanel from "@/components/admin/landing/VideosPanel";
import CreatorsPanel from "@/components/admin/landing/CreatorsPanel";
import BeatsPanel from "@/components/admin/landing/BeatsPanel";
import SettingsPanel from "@/components/admin/landing/SettingsPanel";
import RequestsPanel from "@/components/admin/landing/RequestsPanel";
import VersionsPanel from "@/components/admin/landing/VersionsPanel";

const TABS = [
  { id: "secciones", label: "Secciones", icon: Layout },
  { id: "funciones", label: "Funciones", icon: Sparkles },
  { id: "videos", label: "Vídeos", icon: Video },
  { id: "creadores", label: "Creadores", icon: Mic2 },
  { id: "beats", label: "Beats", icon: Disc3 },
  { id: "ajustes", label: "Ajustes y SEO", icon: Settings2 },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox },
  { id: "versiones", label: "Versiones", icon: History },
];

export default function LandingAdmin() {
  const {
    model,
    setModel,
    loading,
    draftExists,
    busy,
    notice,
    versionsKey,
    saveDraft,
    publish,
    preview,
    discardDraft,
    restore,
  } = useLandingDraft();

  const [tab, setTab] = useState("secciones");

  const patchSettings = (patch) =>
    setModel((m) => ({ ...m, settings: { ...m.settings, ...patch } }));

  if (loading || !model) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] grid place-items-center">
        <Loader2 className="w-5 h-5 animate-spin text-white/40" />
      </div>
    );
  }

  const onPublish = () => {
    if (!window.confirm("¿Publicar los cambios en la web ahora?")) return;
    publish(model);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white" style={{ fontFamily: "'Arial Nova', Arial, Helvetica, sans-serif" }}>
      {/* Barra superior */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0b]/92 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/AdminDashboard"
              className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white"
            >
              <ArrowLeft size={13} /> Admin
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight">Landing</h1>
              {draftExists ? (
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-300">
                  borrador
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-300">
                  publicado
                </span>
              )}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <a
                href="/Landing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/60 hover:text-white"
              >
                <ExternalLink size={12} /> Ver página
              </a>

              <button
                type="button"
                onClick={() => saveDraft(model)}
                disabled={!!busy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/70 hover:bg-white/[0.06] disabled:opacity-40"
              >
                {busy === "draft" ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                Guardar borrador
              </button>

              <button
                type="button"
                onClick={preview}
                disabled={!!busy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/70 hover:bg-white/[0.06] disabled:opacity-40"
              >
                <Eye size={12} /> Vista previa
              </button>

              <button
                type="button"
                onClick={onPublish}
                disabled={!!busy}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white hover:bg-[#e04a28] disabled:opacity-50"
              >
                {busy === "publish" ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                Publicar
              </button>

              {draftExists && (
                <button
                  type="button"
                  onClick={discardDraft}
                  disabled={!!busy}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] text-white/40 hover:text-red-400"
                  title="Descartar el borrador y volver a lo publicado"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>

          {notice && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-300">
              <Check size={12} /> {notice}
            </div>
          )}

          <div className="mt-3 flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 border-b-2 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  tab === id
                    ? "border-[#ff5833] text-white"
                    : "border-transparent text-white/40 hover:text-white/80"
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {tab === "secciones" && (
          <>
            <p className="text-[11px] text-white/30 mb-4">
              Edita los textos de cada bloque, ocúltalos o cámbialos de orden. El hero, el cierre y la
              franja de marcas llevan sus propios botones.
            </p>
            <SectionsPanel
              sections={model.sections}
              onChange={(sections) => setModel((m) => ({ ...m, sections }))}
            />
          </>
        )}

        {tab === "funciones" && (
          <>
            <p className="text-[11px] text-white/30 mb-4">
              Marca una tarjeta como «Próximamente» si esa función aún no está disponible en la
              plataforma.
            </p>
            <FeaturesPanel
              features={model.features}
              onChange={(features) => setModel((m) => ({ ...m, features }))}
            />
          </>
        )}

        {tab === "videos" && (
          <VideosPanel videos={model.videos} onChange={(videos) => setModel((m) => ({ ...m, videos }))} />
        )}

        {tab === "creadores" && (
          <>
            <p className="text-[11px] text-white/30 mb-4">
              Solo se muestran los creadores marcados como públicos. No añadas demos privadas.
            </p>
            <CreatorsPanel
              creators={model.creators}
              onChange={(creators) => setModel((m) => ({ ...m, creators }))}
            />
          </>
        )}

        {tab === "beats" && (
          <BeatsPanel featured={model.beats} onChange={(beats) => setModel((m) => ({ ...m, beats }))} />
        )}

        {tab === "ajustes" && <SettingsPanel settings={model.settings} onChange={patchSettings} />}

        {tab === "solicitudes" && <RequestsPanel />}

        {tab === "versiones" && <VersionsPanel onRestore={restore} refreshKey={versionsKey} />}
      </div>
    </div>
  );
}