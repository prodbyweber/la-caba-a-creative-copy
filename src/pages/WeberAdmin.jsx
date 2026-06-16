import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Eye, EyeOff, GripVertical, Save, Check, Image, Youtube, Music, Film,
} from "lucide-react";

const SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "work", label: "Selected Work" },
  { key: "catalog", label: "Catalog" },
  { key: "about", label: "About" },
  { key: "cabana", label: "La Cabaña" },
  { key: "services", label: "Services" },
  { key: "journal", label: "Journal" },
  { key: "contact", label: "Contact" },
];

const EMPTY_ITEM = {
  section: "work",
  title: "",
  subtitle: "",
  description: "",
  category: "",
  year: "",
  cover_image: "",
  youtube_url: "",
  spotify_url: "",
  preview_video: "",
  order: 0,
  visible: true,
};

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:embed\/|watch\?v=|\/v\/|youtu\.be\/)([a-zA-Z0-9_-]{6,12})/);
  return m ? m[1] : null;
}

function getSpotifyId(url) {
  if (!url) return null;
  const m = url.match(/embed\/track\/([a-zA-Z0-9]+)/) || url.match(/embed\/playlist\/([a-zA-Z0-9]+)/);
  return m ? m[1] : null;
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full mx-4">
        <p className="text-white text-sm mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/[0.05] text-white/60 text-xs hover:bg-white/10">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 border border-red-500/20">Delete</button>
        </div>
      </div>
    </div>
  );
}

function CardEditor({ item, onChange, onSave, saved }) {
  const [local, setLocal] = useState(item);
  const ytId = getYouTubeId(local.youtube_url);
  const spotId = getSpotifyId(local.spotify_url);

  useEffect(() => setLocal(item), [item]);

  const set = (k, v) => {
    const updated = { ...local, [k]: v };
    setLocal(updated);
    onChange(updated);
  };

  const inputClass = "w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#3D5A3E]/50 transition-colors";
  const labelClass = "text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1 block";

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="cursor-grab text-white/20 hover:text-white/40">
            <GripVertical className="w-4 h-4" />
          </div>
          <input
            className="bg-transparent text-white font-bold text-base border-none outline-none w-full placeholder:text-white/15"
            value={local.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Title"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Preview badge */}
          <div className="flex gap-1">
            {local.cover_image && <Image className="w-3.5 h-3.5 text-green-400/70" title="Has cover image" />}
            {local.youtube_url && <Youtube className="w-3.5 h-3.5 text-red-400/70" title="Has YouTube" />}
            {local.spotify_url && <Music className="w-3.5 h-3.5 text-green-500/70" title="Has Spotify" />}
            {local.preview_video && <Film className="w-3.5 h-3.5 text-blue-400/70" title="Has preview video" />}
          </div>
          {/* Visible toggle */}
          <button
            onClick={() => set("visible", !local.visible)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              local.visible ? "bg-[#3D5A3E]/20 text-[#3D5A3E]" : "bg-white/[0.05] text-white/25"
            }`}
            title={local.visible ? "Visible" : "Hidden"}
          >
            {local.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          {/* Save button */}
          <button
            onClick={() => onSave(local)}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-[#3D5A3E]/20 flex items-center justify-center transition-colors"
            title="Save"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-[#3D5A3E]" /> : <Save className="w-3.5 h-3.5 text-white/50" />}
          </button>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={local.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Music Video" />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input className={inputClass} value={local.year} onChange={(e) => set("year", e.target.value)} placeholder="e.g. 2024" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Subtitle</label>
        <input className={inputClass} value={local.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Subtitle" />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea className={inputClass + " min-h-[60px] resize-y"} value={local.description} onChange={(e) => set("description", e.target.value)} placeholder="Description text" rows={3} />
      </div>
      <div>
        <label className={labelClass}>Cover Image URL</label>
        <input className={inputClass} value={local.cover_image} onChange={(e) => set("cover_image", e.target.value)} placeholder="https://..." />
        {local.cover_image && (
          <img src={local.cover_image} alt="Preview" className="mt-2 rounded-lg h-24 object-cover w-full border border-white/[0.06]" onError={(e) => e.target.style.display = "none"} />
        )}
      </div>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className={labelClass}>YouTube URL</label>
          <input className={inputClass} value={local.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          {ytId && (
            <div className="mt-2 rounded-lg overflow-hidden border border-white/[0.06] aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube preview"
              />
            </div>
          )}
        </div>
        <div>
          <label className={labelClass}>Spotify URL</label>
          <input className={inputClass} value={local.spotify_url} onChange={(e) => set("spotify_url", e.target.value)} placeholder="https://open.spotify.com/embed/track/..." />
          {spotId && local.spotify_url && (
            <iframe
              src={local.spotify_url}
              width="100%"
              height="80"
              className="mt-2 rounded-lg border border-white/[0.06]"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify preview"
            />
          )}
        </div>
        <div>
          <label className={labelClass}>Preview Video URL (hover)</label>
          <input className={inputClass} value={local.preview_video} onChange={(e) => set("preview_video", e.target.value)} placeholder="https://...mp4" />
        </div>
      </div>
    </div>
  );
}

export default function WeberAdmin() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("work");
  const [pendingChanges, setPendingChanges] = useState({});
  const [savedIds, setSavedIds] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["weberContent"],
    queryFn: () => base44.entities.WeberContent.list("order", 200),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WeberContent.update(id, data),
    onSuccess: (_, vars) => {
      setSavedIds((prev) => new Set([...prev, vars.id]));
      setTimeout(() => setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(vars.id);
        return next;
      }), 2000);
      queryClient.invalidateQueries({ queryKey: ["weberContent"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WeberContent.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weberContent"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WeberContent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weberContent"] });
      setConfirmDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ id, order }) => base44.entities.WeberContent.update(id, { order }),
  });

  const sectionItems = items.filter((i) => i.section === activeSection);

  const handleChange = useCallback((item, updated) => {
    setPendingChanges((prev) => ({ ...prev, [item.id]: updated }));
  }, []);

  const handleSave = useCallback((updated) => {
    saveMutation.mutate({ id: updated.id, data: updated });
    setPendingChanges((prev) => {
      const next = { ...prev };
      delete next[updated.id];
      return next;
    });
  }, [saveMutation]);

  const handleAdd = () => {
    const maxOrder = sectionItems.reduce((max, i) => Math.max(max, i.order || 0), 0);
    createMutation.mutate({ ...EMPTY_ITEM, section: activeSection, order: maxOrder + 1, title: "New Item" });
  };

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  // Get merged items (pending changes override fetched)
  const displayItems = sectionItems.map((item) => pendingChanges[item.id] || item);

  // Drag-and-drop reorder
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (dragIndex === dropIndex) return;

    const reordered = [...displayItems];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    reordered.forEach((item, i) => {
      reorderMutation.mutate({ id: item.id, order: i });
    });

    queryClient.setQueryData(["weberContent"], (old) => {
      if (!old) return old;
      return old.map((oi) => {
        const found = reordered.find((r) => r.id === oi.id);
        return found ? { ...oi, order: reordered.indexOf(found) } : oi;
      });
    });
  };

  if (isLoading) {
    return (
      <AdminLayout activePage="WeberAdmin">
        <div className="flex items-center justify-center py-40">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="WeberAdmin">
      <div className="px-4 sm:px-6 lg:px-10 xl:px-16 py-8 max-w-[1400px] mx-auto pb-24 sm:pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Weber Content</h1>
          <p className="text-sm text-white/30">Manage all sections of the /weber page</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/[0.07] pb-0 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeSection === s.key
                  ? "border-[#3D5A3E] text-white"
                  : "border-transparent text-white/35 hover:text-white/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="space-y-4">
          {displayItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
            >
              <CardEditor
                item={item}
                onChange={(updated) => handleChange(item, updated)}
                onSave={handleSave}
                saved={savedIds.has(item.id)}
              />
              {/* Delete button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}

          {/* Empty state */}
          {displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-white/[0.05] bg-white/[0.02]">
              <p className="text-white/25 text-sm mb-3">No items in this section</p>
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3D5A3E]/20 text-[#3D5A3E] hover:bg-[#3D5A3E]/30 text-sm font-medium transition-colors border border-[#3D5A3E]/20">
                <Plus className="w-4 h-4" />
                Add First Item
              </button>
            </div>
          )}
        </div>

        {/* Add button */}
        {displayItems.length > 0 && (
          <button
            onClick={handleAdd}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70 text-sm font-medium transition-all border border-white/[0.06]"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this item? This cannot be undone."
          onConfirm={() => deleteMutation.mutate(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </AdminLayout>
  );
}