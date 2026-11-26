import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Layout,
  Video,
  Music4,
  Users,
  Globe,
  ListOrdered,
  Wand2,
  SlidersHorizontal,
  BarChart3,
  Inbox,
  ExternalLink,
} from "lucide-react";
import CrudPanel from "@/components/admin/home/CrudPanel";
import HeroPanel from "@/components/admin/home/HeroPanel";
import RequestsPanel from "@/components/admin/home/RequestsPanel";

const TABS = [
  { id: "secciones", label: "Secciones", icon: Layout },
  { id: "hero", label: "Hero y SEO", icon: Video },
  { id: "paises", label: "Países", icon: Globe },
  { id: "generos", label: "Géneros", icon: Music4 },
  { id: "comunidad", label: "Comunidad", icon: Users },
  { id: "proceso", label: "Cómo funciona", icon: ListOrdered },
  { id: "comenzar", label: "Cómo comenzar", icon: Wand2 },
  { id: "antes", label: "Antes / Después", icon: SlidersHorizontal },
  { id: "cifras", label: "Cifras", icon: BarChart3 },
  { id: "solicitudes", label: "Solicitudes", icon: Inbox },
];

const SECTION_FIELDS = [
  { key: "key", label: "Clave (no cambiar)" },
  { key: "eyebrow", label: "Etiqueta superior" },
  { key: "title", label: "Título", wide: true },
  { key: "subtitle", label: "Subtítulo", type: "textarea", wide: true },
  { key: "body", label: "Texto de apoyo", type: "textarea", wide: true },
  { key: "cta_label", label: "Botón principal" },
  { key: "cta_link", label: "Destino del botón", hint: "#seccion o /ruta" },
  { key: "cta2_label", label: "Botón secundario" },
  { key: "cta2_link", label: "Destino secundario" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const GENRE_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "key", label: "Clave interna" },
  { key: "subgenres", label: "Subgéneros (separados por ·)", type: "textarea", wide: true },
  {
    key: "mood",
    label: "Mood para /start",
    hint: "Una sola palabra: Nocturno, Sensual, Magnético...",
  },
  { key: "figure_value", label: "Cifra (número)", type: "number" },
  { key: "figure_prefix", label: "Prefijo (+, US$)" },
  { key: "figure_suffix", label: "Sufijo (B, %)" },
  { key: "figure_text", label: "Cifra en texto", hint: "Solo si no es un número, ej: 1 de cada 4" },
  { key: "figure_label", label: "Qué mide la cifra", wide: true },
  { key: "figure_note", label: "Periodo o comparación", wide: true },
  { key: "facts", label: "Mini datos", type: "list", wide: true, hint: "Un dato por línea (máximo 3)." },
  { key: "source", label: "Fuente" },
  { key: "source_year", label: "Año de la fuente" },
  { key: "image_url", label: "Imagen de fondo", type: "media", wide: true },
  { key: "video_url", label: "Vídeo de fondo", type: "media", wide: true },
  { key: "tint", label: "Tinte", type: "color" },
  { key: "accent", label: "Color de acento", type: "color" },
  { key: "is_fusion", label: "Es una fusión", type: "toggle" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const FLAG_FIELDS = [
  { key: "code", label: "Código ISO (ES, MX, NG...)" },
  { key: "name", label: "País" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const CREATOR_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "genre", label: "Género" },
  { key: "photo_url", label: "Foto", type: "media", wide: true },
  { key: "cover_url", label: "Portada", type: "media", wide: true },
  { key: "is_public", label: "Visible", type: "toggle" },
];

const PROCESS_FIELDS = [
  { key: "num", label: "Número" },
  { key: "title", label: "Título", wide: true },
  { key: "text", label: "Texto", type: "textarea", wide: true },
  { key: "image_url", label: "Imagen", type: "media", wide: true },
  { key: "video_url", label: "Vídeo", type: "media", wide: true },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const BUILDER_FIELDS = [
  { key: "key", label: "Clave (genero, necesitas, etapa, ubicacion, demo)" },
  { key: "title", label: "Título de la tarjeta" },
  { key: "color", label: "Color", type: "color" },
  { key: "options", label: "Opciones (píldoras)", type: "list", wide: true },
  { key: "multi", label: "Selección múltiple", type: "toggle" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const DEMO_FIELDS = [
  { key: "artist", label: "Artista" },
  { key: "genre", label: "Género" },
  { key: "cover_url", label: "Portada", type: "media", wide: true },
  { key: "demo_audio_url", label: "Audio demo", type: "audio", wide: true },
  { key: "master_audio_url", label: "Audio master final", type: "audio", wide: true },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const STAT_FIELDS = [
  { key: "value", label: "Cifra", type: "number" },
  { key: "prefix", label: "Prefijo" },
  { key: "suffix", label: "Sufijo" },
  { key: "label", label: "Etiqueta" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

export default function HomeAdmin() {
  const [tab, setTab] = useState("secciones");

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-white"
      style={{ fontFamily: "'Arial Nova', Arial, Helvetica, sans-serif" }}
    >
      <div className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0b]/92 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              to="/AdminDashboard"
              className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white"
            >
              <ArrowLeft size={13} /> Admin
            </Link>
            <h1 className="text-sm font-bold tracking-tight">Home</h1>
            <a
              href="/Landing"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/60 hover:text-white"
            >
              <ExternalLink size={12} /> Ver página
            </a>
          </div>

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
          <CrudPanel
            entityName="LandingSection"
            fields={SECTION_FIELDS}
            defaults={{ key: "", is_visible: true }}
            itemTitle={(item) => `${item.key} — ${item.title || "sin título"}`}
            hint="Activa, oculta o reordena las pantallas de la home. El hero, el cierre y la franja de marcas llevan sus propios botones."
          />
        )}

        {tab === "hero" && <HeroPanel />}

        {tab === "paises" && (
          <CrudPanel
            entityName="CountryFlag"
            fields={FLAG_FIELDS}
            defaults={{ is_visible: true }}
            itemTitle={(item) => `${item.code} — ${item.name || ""}`}
            hint="Banderas que caen en la sección Países (máximo 16). El número y los textos se editan en Secciones."
          />
        )}

        {tab === "generos" && (
          <CrudPanel
            entityName="GenreCard"
            fields={GENRE_FIELDS}
            defaults={{ is_visible: true, tint: "#ff5833", accent: "#ff5833", facts: [] }}
            hint="Tarjetas verticales apiladas con su cifra y su fuente. Las marcadas como fusión se muestran como tarjetas cinemáticas al final."
          />
        )}

        {tab === "comunidad" && (
          <CrudPanel
            entityName="FeaturedCreator"
            fields={CREATOR_FIELDS}
            defaults={{ is_public: true }}
            hint="Artistas que aparecen en el carrusel de comunidad."
          />
        )}

        {tab === "proceso" && (
          <CrudPanel
            entityName="ProcessStep"
            fields={PROCESS_FIELDS}
            defaults={{ is_visible: true }}
            hint="Un paso por pantalla completa."
          />
        )}

        {tab === "comenzar" && (
          <CrudPanel
            entityName="BuilderCard"
            fields={BUILDER_FIELDS}
            defaults={{ is_visible: true, multi: true, options: [] }}
            itemTitle={(item) => `${item.title} (${item.key})`}
            hint="Claves especiales: genero, necesitas, etapa, ubicacion, demo. El color de cada tarjeta se edita aquí."
          />
        )}

        {tab === "antes" && (
          <CrudPanel
            entityName="DemoCase"
            fields={DEMO_FIELDS}
            defaults={{ is_visible: true }}
            itemTitle={(item) => `${item.artist} — ${item.genre || ""}`}
            hint="Sube el audio de la demo y del master final. Los audios se guardan con URL pública para poder escucharse en la home."
          />
        )}

        {tab === "cifras" && (
          <CrudPanel
            entityName="HomeStat"
            fields={STAT_FIELDS}
            defaults={{ is_visible: true, value: 0 }}
            hint="Contadores animados de la sección Comunidad."
          />
        )}

        {tab === "solicitudes" && <RequestsPanel />}
      </div>
    </div>
  );
}