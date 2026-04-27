import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit, GripVertical, Eye, EyeOff,
  Star, Film, Upload, ChevronDown, ChevronUp, ExternalLink,
  Layers, Image as ImageIcon, LayoutGrid, X, Save, Youtube
} from "lucide-react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HeroSlideModal from "@/components/explorar/HeroSlideModal";
import ProjectModal from "@/components/explorar/admin/ProjectModal";
import ProjectsLibrary from "@/components/explorar/admin/ProjectsLibrary";

const ROW_CATEGORIES = [
  { key: "trending",       label: "En Tendencia" },
  { key: "new_releases",   label: "Nuevos Lanzamientos" },
  { key: "mini_films",     label: "Mini Films" },
  { key: "afro_caribbean", label: "Afro / Caribbean Vibes" },
  { key: "experimental",   label: "Experimental / New Wave" },
];

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

// ─── Item card en fila (secciones) ─────────────────────────────────────────
function SectionItemCard({ item, index, onEdit, onDelete, onToggle, artists, provided }) {
  const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
  const artist = artists.find(a => a.id === item.artist_id);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex items-center gap-3 p-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl transition-all group"
    >
      <div {...provided.dragHandleProps} className="text-white/20 hover:text-white/50 cursor-grab flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-14 h-9 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {thumb ? <img src={thumb} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-3.5 h-3.5 text-white/15" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-white truncate">{item.title}</p>
          {item.is_hero && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {item.subtitle && <span className="text-[10px] text-white/25 truncate">{item.subtitle}</span>}
          {artist && <span className="text-[10px] text-emerald-400/60">{artist.stageName}</span>}
        </div>
      </div>
      <span className="text-[10px] text-white/15 w-5 text-center flex-shrink-0">#{item.order ?? index}</span>
      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          {item.is_active ? <Eye className="w-3.5 h-3.5 text-white/40" /> : <EyeOff className="w-3.5 h-3.5 text-white/20" />}
        </button>
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <Edit className="w-3.5 h-3.5 text-white/40 hover:text-white" />
        </button>
        <button onClick={() => { if (confirm("¿Eliminar?")) onDelete(item.id); }} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5 text-white/25 hover:text-red-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────
export default function ExplorarAdmin() {
  const [activeTab, setActiveTab] = useState("projects"); // projects | sections | hero
  const [editingItem, setEditingItem] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [heroExpanded, setHeroExpanded] = useState(true);
  const qc = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.list("order"),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["artists"],
    queryFn: () => base44.entities.Artist.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (form) => form.id
      ? base44.entities.ExplorarItem.update(form.id, form)
      : base44.entities.ExplorarItem.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explorar-items"] });
      setShowProjectModal(false);
      setShowHeroModal(false);
      setEditingItem(null);
      setEditingHero(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ExplorarItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (item) => base44.entities.ExplorarItem.update(item.id, { is_active: !item.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  const handleDragEnd = async (result, category) => {
    if (!result.destination) return;
    const catItems = items.filter(i => i.row_category === category).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const [moved] = catItems.splice(result.source.index, 1);
    catItems.splice(result.destination.index, 0, moved);
    await Promise.all(catItems.map((item, idx) => base44.entities.ExplorarItem.update(item.id, { order: idx })));
    qc.invalidateQueries({ queryKey: ["explorar-items"] });
  };

  const heroItems = items.filter(i => i.is_hero).sort((a, b) => (a.hero_order ?? 0) - (b.hero_order ?? 0));

  const TABS = [
    { key: "projects", label: "Proyectos", icon: LayoutGrid, count: items.length },
    { key: "sections", label: "Secciones", icon: Layers, count: ROW_CATEGORIES.length },
    { key: "hero",     label: "Hero",      icon: Star,       count: heroItems.length },
  ];

  return (
    <AdminLayout activePage="ExplorarAdmin">
      <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-6xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
              Editor Explorar
            </h1>
            <p className="text-xs text-white/25 mt-0.5">Gestiona el contenido de la plataforma</p>
          </div>
          <Link
            to="/Explorar"
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Explorar
          </Link>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 border-b border-white/[0.07] pb-0">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? "text-white border-white/60"
                  : "text-white/30 border-transparent hover:text-white/60"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/15 text-white/70" : "bg-white/[0.06] text-white/25"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ═══ TAB: PROYECTOS ═══ */}
        {activeTab === "projects" && (
          <ProjectsLibrary
            items={items}
            artists={artists}
            onEdit={(item) => { setEditingItem(item); setShowProjectModal(true); }}
            onDelete={deleteMutation.mutate}
            onToggle={toggleMutation.mutate}
            onNew={() => { setEditingItem(null); setShowProjectModal(true); }}
          />
        )}

        {/* ═══ TAB: SECCIONES ═══ */}
        {activeTab === "sections" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/30">Arrastra para reordenar los proyectos dentro de cada sección</p>
              <button
                onClick={() => { setEditingItem(null); setShowProjectModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo proyecto
              </button>
            </div>
            {ROW_CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.row_category === cat.key).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              return (
                <div key={cat.key}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white">{cat.label}</h2>
                    <span className="text-[10px] text-white/20">{catItems.length} proyectos</span>
                  </div>
                  <DragDropContext onDragEnd={(result) => handleDragEnd(result, cat.key)}>
                    <Droppable droppableId={cat.key}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                          {catItems.length === 0 && (
                            <div className="py-6 border border-dashed border-white/[0.06] rounded-xl text-center">
                              <p className="text-xs text-white/15">Sin proyectos en esta sección</p>
                              <p className="text-[10px] text-white/10 mt-0.5">Crea un proyecto y asígnalo a esta sección</p>
                            </div>
                          )}
                          {catItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <SectionItemCard
                                  item={item}
                                  index={index}
                                  onEdit={(i) => { setEditingItem(i); setShowProjectModal(true); }}
                                  onDelete={deleteMutation.mutate}
                                  onToggle={toggleMutation.mutate}
                                  artists={artists}
                                  provided={provided}
                                />
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ TAB: HERO ═══ */}
        {activeTab === "hero" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-white/30">Slides del carrusel principal de la página Explorar</p>
              <button
                onClick={() => { setEditingHero(null); setShowHeroModal(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/20 text-yellow-400 font-bold rounded-xl text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo slide hero
              </button>
            </div>

            {heroItems.length === 0 ? (
              <div className="py-20 text-center">
                <Star className="w-10 h-10 text-yellow-500/15 mx-auto mb-3" />
                <p className="text-sm text-white/20">Sin slides en el carrusel hero</p>
                <p className="text-xs text-white/10 mt-1">Crea un slide o activa "Destacar en Hero" en cualquier proyecto</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {heroItems.map((item) => {
                  const artist = artists.find(a => a.id === item.artist_id);
                  const bgThumb = item.hero_media_type !== "video"
                    ? (item.hero_media_url || item.thumbnail_url || getYoutubeThumbnail(item.youtube_url))
                    : null;
                  return (
                    <div
                      key={item.id}
                      className="relative rounded-xl overflow-hidden border border-yellow-500/20 bg-white/[0.02] group cursor-pointer"
                      style={{ aspectRatio: "16/9" }}
                      onClick={() => { setEditingHero(item); setShowHeroModal(true); }}
                    >
                      {item.hero_media_type === "video" && item.hero_media_url ? (
                        <video src={item.hero_media_url} className="w-full h-full object-cover" muted loop playsInline />
                      ) : bgThumb ? (
                        <img src={bgThumb} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                          <ImageIcon className="w-6 h-6 text-white/10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <p className="text-xs font-bold text-white truncate">{item.title}</p>
                        {artist && <p className="text-[10px] text-white/40 truncate">{artist.stageName}</p>}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="text-[9px] bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded">#{(item.hero_order ?? 0) + 1}</span>
                        {item.hero_media_type === "video" && (
                          <span className="text-[9px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Film className="w-2.5 h-2.5" /> VIDEO
                          </span>
                        )}
                        {!item.is_active && <span className="text-[9px] bg-red-600/80 text-white font-bold px-1.5 py-0.5 rounded">OCULTO</span>}
                      </div>
                      <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                          <Edit className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">Editar</span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar este slide?")) deleteMutation.mutate(item.id); }}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de proyecto */}
      <AnimatePresence>
        {showProjectModal && (
          <ProjectModal
            item={editingItem}
            artists={artists}
            onClose={() => { setShowProjectModal(false); setEditingItem(null); }}
            onSave={saveMutation.mutate}
          />
        )}
      </AnimatePresence>

      {/* Modal de slide Hero */}
      <AnimatePresence>
        {showHeroModal && (
          <HeroSlideModal
            item={editingHero}
            artists={artists}
            onClose={() => { setShowHeroModal(false); setEditingHero(null); }}
            onSave={saveMutation.mutate}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}