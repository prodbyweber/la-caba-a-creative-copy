import React, { useState } from "react";
import { Link } from "react-router-dom";
import SettingsPanel from "@/components/fullaccess/admin/SettingsPanel";
import ListPanel from "@/components/fullaccess/admin/ListPanel";
import SortablePanel from "@/components/fullaccess/admin/SortablePanel";
import SectionOrderPanel from "@/components/fullaccess/admin/SectionOrderPanel";
import ApplicationsPanel from "@/components/fullaccess/admin/ApplicationsPanel";
import AdmissionsPanel from "@/components/admision/admin/AdmissionsPanel";

const TABS = [
  { key: "admisiones", label: "Admisiones" },
  { key: "secciones", label: "Secciones" },
  { key: "contenido", label: "Contenido" },
  { key: "stats", label: "Estadísticas" },
  { key: "artistas", label: "Artistas" },
  { key: "demos", label: "Demo / Master" },
  { key: "proyectos", label: "Proyectos" },
  { key: "etapas", label: "Metodología" },
  { key: "solicitudes", label: "Solicitudes" },
];

export default function FullAccessAdmin() {
  const [tab, setTab] = useState("contenido");

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ff5833]">
              Cabaña Full Access
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Panel de la landing</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/start"
              className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:text-white"
            >
              Ver landing
            </Link>
            <Link
              to="/AdminDashboard"
              className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:text-white"
            >
              Panel general
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                tab === item.key ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-7">
          {tab === "admisiones" && <AdmissionsPanel />}

          {tab === "secciones" && <SectionOrderPanel />}

          {tab === "contenido" && <SettingsPanel />}

          {tab === "stats" && (
            <ListPanel
              title="Estadísticas"
              description="Deja la cifra vacía para mostrarla como pendiente de verificar."
              entity="FullAccessStat"
              defaults={{ value: 0, label: "Nueva cifra", order: 0, is_visible: true }}
              fields={[
                { key: "value", label: "Cifra", type: "number" },
                { key: "prefix", label: "Prefijo" },
                { key: "suffix", label: "Sufijo" },
                { key: "label", label: "Etiqueta" },
                { key: "note", label: "Nota", wide: true },
                { key: "order", label: "Orden", type: "number" },
                { key: "is_visible", label: "Visible", type: "bool" },
              ]}
            />
          )}

          {tab === "proyectos" && (
            <ListPanel
              title="Selected projects"
              description="Artista, canción, crédito y enlace del videoclip. La portada es opcional."
              entity="FullAccessProject"
              defaults={{ artist: "", song: "", credit: "", order: 0, is_visible: true }}
              fields={[
                { key: "artist", label: "Artista" },
                { key: "song", label: "Canción" },
                { key: "credit", label: "Crédito" },
                { key: "year", label: "Año" },
                { key: "youtube_url", label: "Enlace del vídeo", wide: true },
                { key: "cover_url", label: "Portada (opcional)", wide: true },
                { key: "order", label: "Orden", type: "number" },
                { key: "is_visible", label: "Visible", type: "bool" },
              ]}
            />
          )}

          {tab === "etapas" && (
            <ListPanel
              title="Metodología"
              description="Cada etapa con su número, titular, puntos y resultado."
              entity="FullAccessStage"
              defaults={{ num: "", title: "", items: [], order: 0, is_visible: true }}
              fields={[
                { key: "num", label: "Número" },
                { key: "key", label: "Identificador (explorar / descubrir / lanzar)" },
                { key: "title", label: "Titular", wide: true },
                { key: "text", label: "Descripción", type: "textarea", wide: true },
                { key: "items", label: "Puntos (separados por coma)", type: "list", wide: true },
                { key: "result", label: "Resultado", type: "textarea", wide: true },
                { key: "video_url", label: "Vídeo en loop", wide: true },
                { key: "image_url", label: "Imagen o póster", wide: true },
                { key: "order", label: "Orden", type: "number" },
                { key: "is_visible", label: "Visible", type: "bool" },
              ]}
            />
          )}

          {tab === "artistas" && (
            <SortablePanel
              title="Artistas"
              description="Nombre, imagen y orden de las tarjetas del carrusel. Arrastra para reordenar."
              entity="StartArtist"
              defaults={{ name: "", image_url: "", order: 0, is_visible: true }}
              fields={[
                { key: "name", label: "Artista" },
                { key: "is_visible", label: "Visible", type: "bool" },
                {
                  key: "image_url",
                  label: "Imagen",
                  type: "media",
                  accept: "image/*",
                  wide: true,
                },
              ]}
            />
          )}

          {tab === "demos" && (
            <SortablePanel
              title="Demo & Master"
              description="Solo se publican los proyectos con audio demo y master. Arrastra para reordenar."
              entity="DemoCase"
              defaults={{ artist: "", order: 0, is_visible: true }}
              fields={[
                { key: "artist", label: "Artista" },
                { key: "song", label: "Canción" },
                { key: "is_visible", label: "Visible", type: "bool" },
                { key: "description", label: "Descripción breve", type: "textarea", wide: true },
                {
                  key: "cover_url",
                  label: "Imagen del artista",
                  type: "media",
                  accept: "image/*",
                  wide: true,
                },
                {
                  key: "demo_audio_url",
                  label: "Audio DEMO",
                  type: "media",
                  accept: "audio/*",
                  wide: true,
                },
                {
                  key: "master_audio_url",
                  label: "Audio MASTER",
                  type: "media",
                  accept: "audio/*",
                  wide: true,
                },
              ]}
            />
          )}

          {tab === "solicitudes" && <ApplicationsPanel />}
        </div>
      </div>
    </div>
  );
}