import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit, GripVertical, Eye, EyeOff,
  Star, Film, ExternalLink,
  Layers, Image as ImageIcon, LayoutGrid, X
} from "lucide-react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HeroSlideModal from "@/components/explorar/HeroSlideModal";
import ProjectModal from "@/components/explorar/admin/ProjectModal";
import ProjectsLibrary from "@/components/explorar/admin/ProjectsLibrary";
import SectionEditModal from "@/components/explorar/admin/SectionEditModal";

const DEFAULT_SECTIONS = [
  { key: "trending",       label: "En Tendencia",           order: 0 },
  { key: "new_releases",   label: "Nuevos Lanzamientos",    order: 1 },
  { key: "mini_films",     label: "Mini Films",             order: 2 },
  { key: "afro_caribbean", label: "Afro / Caribbean Vibes", order: 3 },
  { key: "experimental",   label: "Experimental / New Wave", order: 4 },
];

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export default function ExplorarAdmin() {
  const [activeTab, setActiveTab] = useState("projects");
  const [editingItem, setEditingItem] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // { section, assignments }
  const [showSectionModal, setShowSectionModal] = useState(false);
  const qc = useQueryClient();

  // ─── Data queries ────────────────────────────────────────────────────────
  const { data: items = [] } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.list("order"),
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["artists"],
    queryFn: () => base44.entities.Artist.list(),
  });

  const { data: rawSections = [] } = useQuery({
    queryKey: ["explorar-sections"],
    queryFn: () => base44.entities.ExplorarSection.list("order"),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["section-assignments"],
    queryFn: () => base44.entities.SectionAssignment.list("order"),
  });

  // Merge default sections if none exist yet
  const sections = rawSections.length > 0
    ? rawSections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : DEFAULT_SECTIONS.map((s, i) => ({ ...s, id: `default-${i}`, _isDefault: true }));

  // ─── Mutations for items ─────────────────────────────────────────────────
  const saveItemMutation = useMutation({
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

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.ExplorarItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  const toggleItemMutation = useMutation({
    mutationFn: (item) => base44.entities.ExplorarItem.update(item.id, { is_active: !item.is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-items"] }),
  });

  // ─── Section save: update label + sync assignments ───────────────────────
  const saveSectionMutation = useMutation({
    mutationFn: async ({ section, label, orderedItems }) => {
      // 1. If it was a default section, create it in DB first
      let sectionId = section.id;
      if (section._isDefault) {
        const created = await base44.entities.ExplorarSection.create({
          key: section.key,
          label,
          order: section.order ?? 0,
          is_active: true,
        });
        sectionId = created.id;
      } else {
        // Update label
        await base44.entities.ExplorarSection.update(sectionId, { label });
      }

      // 2. Delete existing assignments for this section
      const existing = assignments.filter(a => a.section_id === sectionId);
      await Promise.all(existing.map(a => base44.entities.SectionAssignment.delete(a.id)));

      // 3. Create new assignments in order
      await Promise.all(
        orderedItems.map(({ itemId }, idx) =>
          base44.entities.SectionAssignment.create({ section_id: sectionId, item_id: itemId, order: idx })
        )
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explorar-sections"] });
      qc.invalidateQueries({ queryKey: ["section-assignments"] });
      setShowSectionModal(false);
      setEditingSection(null);
    },
  });

  const addSectionMutation = useMutation({
    mutationFn: () => base44.entities.ExplorarSection.create({
      key: `section_${Date.now()}`,
      label: "Nueva sección",
      order: sections.length,
      is_active: true,
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["explorar-sections"] }),
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (sectionId) => {
      const toDelete = assignments.filter(a => a.section_id === sectionId);
      await Promise.all(toDelete.map(a => base44.entities.SectionAssignment.delete(a.id)));
      await base44.entities.ExplorarSection.delete(sectionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["explorar-sections"] });
      qc.invalidateQueries({ queryKey: ["section-assignments"] });
    },
  });

  // ─── Hero ────────────────────────────────────────────────────────────────
  const heroItems = items.filter(i => i.is_hero).sort((a, b) => (a.hero_order ?? 0) - (b.hero_order ?? 0));

  const TABS = [
    { key: "projects", label: "Proyectos", icon: LayoutGrid, count: items.length },
    { key: "sections", label: "Secciones", icon: Layers, count: sections.length },
    { key: "hero",     label: "Hero",      icon: Star,      count: heroItems.length },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
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
          <Link to="/Explorar" className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white rounded-xl text-xs font-medium transition-colors">
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
                activeTab === tab.key ? "text-white border-white/60" : "text-white/30 border-transparent hover:text-white/60"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-white/15 text-white/70" : "bg-white/[0.06] text-white/25"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ═══ TAB: PROYECTOS ═══ */}
        {activeTab === "projects" && (
          <ProjectsLibrary
            items={items}
            artists={artists}
            onEdit={(item) => { setEditingItem(item); setShowProjectModal(true); }}
            onDelete={deleteItemMutation.mutate}
            onToggle={toggleItemMutation.mutate}
            onNew={() => { setEditingItem(null); setShowProjectModal(true); }}
          />
        )}

        {/* ═══ TAB: SECCIONES ═══ */}
        {activeTab === "sections" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/30">Cada sección es una fila en la página Explorar. Un mismo proyecto puede aparecer en varias secciones.</p>
              <button
                onClick={() => addSectionMutation.mutate()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nueva sección
              </button>
            </div>

            {sections.map((section) => {
              const sectionAssignments = assignments
                .filter(a => a.section_id === section.id)
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              const sectionItemIds = sectionAssignments.map(a => a.item_id);
              const sectionItems = sectionItemIds
                .map(id => items.find(i => i.id === id))
                .filter(Boolean);

              return (
                <div
                  key={section.id || section.key}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{section.label}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{sectionItems.length} proyectos</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSection({ section, assignments: sectionAssignments });
                        setShowSectionModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.08] text-white/50 hover:text-white text-xs font-medium transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    {!section._isDefault && (
                      <button
                        onClick={() => { if (confirm(`¿Eliminar sección "${section.label}"?`)) deleteSectionMutation.mutate(section.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                      </button>
                    )}
                  </div>

                  {/* Items preview */}
                  <div className="px-5 py-4">
                    {sectionItems.length === 0 ? (
                      <div className="flex items-center gap-3 py-4 text-center justify-center">
                        <p className="text-xs text-white/15">Sin proyectos — haz clic en "Editar" para añadir</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                        {sectionItems.map((item, idx) => {
                          const thumb = item.thumbnail_url || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
                          return (
                            <div key={item.id} className="flex-shrink-0 relative group">
                              <div className="w-20 h-14 rounded-lg overflow-hidden bg-white/5">
                                {thumb ? (
                                  <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Film className="w-4 h-4 text-white/10" />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-black/80 border border-white/10 flex items-center justify-center">
                                <span className="text-[8px] text-white/50 font-bold">{idx + 1}</span>
                              </div>
                              <p className="text-[9px] text-white/30 truncate mt-1 w-20 text-center">{item.title}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
                <p className="text-xs text-white/10 mt-1">Activa "Destacar en Hero" en cualquier proyecto</p>
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
                        onClick={e => { e.stopPropagation(); if (confirm("¿Eliminar este slide?")) deleteItemMutation.mutate(item.id); }}
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

      {/* Modals */}
      <AnimatePresence>
        {showProjectModal && (
          <ProjectModal
            item={editingItem}
            artists={artists}
            onClose={() => { setShowProjectModal(false); setEditingItem(null); }}
            onSave={saveItemMutation.mutate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHeroModal && (
          <HeroSlideModal
            item={editingHero}
            artists={artists}
            onClose={() => { setShowHeroModal(false); setEditingHero(null); }}
            onSave={saveItemMutation.mutate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSectionModal && editingSection && (
          <SectionEditModal
            section={editingSection.section}
            assignments={editingSection.assignments}
            allItems={items}
            artists={artists}
            onClose={() => { setShowSectionModal(false); setEditingSection(null); }}
            onSave={({ label, orderedItems }) =>
              saveSectionMutation.mutate({ section: editingSection.section, label, orderedItems })
            }
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}