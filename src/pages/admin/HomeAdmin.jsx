import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Layout,
  Video,
  Film,
  Music4,
  Layers,
  Users,
  ListOrdered,
  Wand2,
  SlidersHorizontal,
  BarChart3,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import CrudPanel from "@/components/admin/home/CrudPanel";
import HeroPanel from "@/components/admin/home/HeroPanel";
import BrandsPanel from "@/components/admin/home/BrandsPanel";

const TABS = [
  { id: "secciones", label: "Secciones", icon: Layout },
  { id: "hero", label: "Hero y SEO", icon: Video },
  { id: "videos", label: "Vídeos hero", icon: Film },
  { id: "estudio", label: "Estudio", icon: Video },
  { id: "generos", label: "Géneros", icon: Music4 },
  { id: "fusion", label: "Fusion", icon: Layers },
  { id: "comunidad", label: "Comunidad", icon: Users },
  { id: "proceso", label: "Cómo funciona", icon: ListOrdered },
  { id: "comenzar", label: "Configurador", icon: Wand2 },
  { id: "antes", label: "Antes / Después", icon: SlidersHorizontal },
  { id: "cifras", label: "Cifras", icon: BarChart3 },
  { id: "marcas", label: "Marcas", icon: ImageIcon },
];

const SECTION_FIELDS = [
  { key: "key", label: "Clave (no cambiar)" },
  { key: "eyebrow", label: "Etiqueta superior" },
  {
    key: "title",
    label: "Título",
    type: "textarea",
    wide: true,
    hint: "Usa un salto de línea para separar frases.",
  },
  { key: "subtitle", label: "Subtítulo", type: "textarea", wide: true },
  { key: "body", label: "Texto de apoyo", type: "textarea", wide: true },
  { key: "cta_label", label: "Botón principal" },
  { key: "cta_link", label: "Destino del botón", hint: "#seccion o /ruta" },
  { key: "cta2_label", label: "Botón secundario" },
  { key: "cta2_link", label: "Destino secundario" },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const HERO_VIDEO_FIELDS = [
  { key: "title", label: "Nombre del clip" },
  { key: "video_url", label: "Vídeo", type: "media", wide: true, hint: "MP4 H.264, sin audio, 720p." },
  { key: "poster_url", label: "Póster", type: "media", wide: true },
  { key: "is_visible", label: "En rotación", type: "toggle" },
];

const STUDIO_FIELDS = [
  { key: "title", label: "Título" },
  { key: "video_url", label: "Vídeo de la sesión", type: "media", wide: true },
  { key: "image_url", label: "Imagen o póster", type: "media", wide: true },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const GENRE_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "key", label: "Clave interna" },
  { key: "label", label: "Etiqueta pequeña", wide: true },
  { key: "description", label: "Descripción SONIDO", type: "textarea", wide: true },
  { key: "image_url", label: "Imagen de fondo", type: "media", wide: true },
  { key: "video_url", label: "Vídeo de fondo", type: "media", wide: true },
  { key: "tint", label: "Tinte", type: "color" },
  { key: "accent", label: "Color de acento", type: "color" },
  { key: "global_data", label: "Dato global", type: "textarea", wide: true, hint: "Déjalo vacío para no mostrar nada." },
  { key: "global_source", label: "Fuente del dato", wide: true },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const FUSION_FIELDS = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción corta", type: "textarea", wide: true },
  { key: "accent", label: "Color de acento", type: "color" },
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
  {
    key: "icon",
    label: "Icono (sparkles, disc, target, rocket, music, mic, trending, layers)",
    wide: true,
  },
  { key: "title", label: "Título", wide: true },
  { key: "text", label: "Dos líneas de explicación", type: "textarea", wide: true },
  { key: "image_url", label: "Imagen", type: "media", wide: true },
  { key: "is_visible", label: "Visible", type: "toggle" },
];

const BUILDER_FIELDS = [
  { key: "key", label: "Clave (genero, necesitas, etapa, ubicacion, demo, mood)" },
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
            hint="Activa, oculta o reordena las pantallas de la home. El orden de las tarjetas se cambia con las flechas."
          />
        )}

        {tab === "hero" && <HeroPanel />}

        {tab === "videos" && (
          <CrudPanel
            entityName="HeroVideo"
            fields={HERO_VIDEO_FIELDS}
            defaults={{ is_visible: true }}
            itemTitle={(item) => item.title || item.video_url}
            hint="Rotan automáticamente cada 7 segundos con fundido y zoom lento. Usa MP4 H.264 sin audio."
          />
        )}

        {tab === "estudio" && (
          <CrudPanel
            entityName="StudioCard"
            fields={STUDIO_FIELDS}
            defaults={{ is_visible: true }}
            hint="Tarjetas verticales de sesiones en el estudio."
          />
        )}

        {tab === "generos" && (
          <CrudPanel
            entityName="GenreCard"
            fields={GENRE_FIELDS}
            defaults={{ is_visible: true, tint: "#ff5833", accent: "#ff5833" }}
            hint="Tarjetas apiladas. No hay cifras inventadas: si dejas el dato global vacío, no se muestra."
          />
        )}

        {tab === "fusion" && (
          <CrudPanel
            entityName="FusionGenre"
            fields={FUSION_FIELDS}
            defaults={{ is_visible: true, accent: "#ff5833" }}
            hint="Subgéneros de la lista compacta de Fusion."
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
            defaults={{ is_visible: true, icon: "sparkles" }}
            hint="Cuatro tarjetas horizontales con número, icono, título y dos líneas."
          />
        )}

        {tab === "comenzar" && (
          <CrudPanel
            entityName="BuilderCard"
            fields={BUILDER_FIELDS}
            defaults={{ is_visible: true, multi: true, options: [] }}
            itemTitle={(item) => `${item.title} (${item.key})`}
            hint="Claves especiales: genero, necesitas, etapa, ubicacion, demo, mood. El color de cada tarjeta se edita aquí."
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
            hint="Contadores animados de Cifras y Comunidad."
          />
        )}

        {tab === "marcas" && <BrandsPanel />}
      </div>
    </div>
  );
}