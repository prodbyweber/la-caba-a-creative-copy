import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, Upload, Loader2, GripVertical, Film, Music2, Play, Camera } from "lucide-react";

const TABS = [
  { key: "films", label: "Films", icon: Film, types: ["film", "minifilm", "series", "videoclip", "visualizer"] },
  { key: "musica", label: "Música", icon: Music2, types: ["song", "album", "ep"] },
  { key: "shorts", label: "Shorts", icon: Play, types: ["short"] },
  { key: "fotografia", label: "Fotografía Editorial", icon: Camera, isPhoto: true },
];

const iClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20";
const labelClass = "block text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1";

// ─── Media Row Editor (films / música / shorts) ───────────────────────────────
function MediaRowEditor({ rowKey, allowedTypes }) {
  const qc = useQueryClient();

  const { data: allItems = [] } = useQuery({
    queryKey: ["explorar-items-start"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
  });

  const { data: blocks = [] } = useQuery({
    queryKey: ["start-page-blocks"],
    queryFn: () => base44.entities.StartPageBlock.list("order"),
  });

  const filteredItems = allItems.filter(i => allowedTypes.includes(i.content_type));
  const rowBlocks = blocks.filter(b => b.row_key === rowKey).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Local state: array of { item_id, youtube_url_override, order }
  const [localRows, setLocalRows] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalRows(rowBlocks.map(b => ({
      _blockId: b.id,
      item_id: b.item_id,
      youtube_url_override: b.youtube_url_override || "",
      order: b.order ?? 0,
    })));
  }, [blocks.length, rowKey]);

  const saveMutation = useMutation({
    mutationFn: async (rows) => {
      // Delete all existing blocks for this row
      const existing = blocks.filter(b => b.row_key === rowKey);
      await Promise.all(existing.map(b => base44.entities.StartPageBlock.delete(b.id)));
      // Re-create
      await Promise.all(rows.map((r, idx) =>
        base44.entities.StartPageBlock.create({
          row_key: rowKey,
          item_id: r.item_id,
          youtube_url_override: r.youtube_url_override || "",
          order: idx,
        })
      ));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["start-page-blocks"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const addItem = (itemId) => {
    if (!itemId || localRows.find(r => r.item_id === itemId)) return;
    setLocalRows(prev => [...prev, { item_id: itemId, youtube_url_override: "", order: prev.length }]);
  };

  const removeRow = (idx) => setLocalRows(prev => prev.filter((_, i) => i !== idx));
  const updateOverride = (idx, val) => setLocalRows(prev => prev.map((r, i) => i === idx ? { ...r, youtube_url_override: val } : r));

  const availableToAdd = filteredItems.filter(i => !localRows.find(r => r.item_id === i.id));

  return (
    <div className="space-y-3">
      {/* Selected items */}
      {localRows.length > 0 ? (
        <div className="space-y-2">
          {localRows.map((row, idx) => {
            const item = allItems.find(i => i.id === row.item_id);
            if (!item) return null;
            const thumb = item.thumbnail_url || (item.youtube_url ? `https://img.youtube.com/vi/${item.youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1]}/hqdefault.jpg` : null);
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <GripVertical className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                {thumb && <img src={thumb} alt="" className="w-14 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-white/30">{item.content_type}</p>
                </div>
                <div className="flex-shrink-0 w-44">
                  <input
                    value={row.youtube_url_override}
                    onChange={e => updateOverride(idx, e.target.value)}
                    className={iClass + " text-xs"}
                    placeholder="URL YouTube (opcional)"
                  />
                </div>
                <button onClick={() => removeRow(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/20 text-center py-4">Sin elementos — añade uno abajo</p>
      )}

      {/* Add from list */}
      {availableToAdd.length > 0 && (
        <div>
          <label className={labelClass}>Añadir proyecto</label>
          <select className={iClass} value="" onChange={e => { addItem(e.target.value); e.target.value = ""; }}>
            <option value="" className="bg-[#111]">— Seleccionar proyecto —</option>
            {availableToAdd.map(i => (
              <option key={i.id} value={i.id} className="bg-[#111]">{i.title} · {i.content_type}</option>
            ))}
          </select>
        </div>
      )}

      <button
        onClick={() => saveMutation.mutate(localRows)}
        disabled={saveMutation.isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
        style={{ background: saved ? "rgba(16,185,129,0.2)" : "rgba(255,88,51,0.15)", color: saved ? "#10b981" : "#ff5833", border: `1px solid ${saved ? "rgba(16,185,129,0.3)" : "rgba(255,88,51,0.25)"}` }}
      >
        {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {saved ? "¡Guardado!" : "Guardar fila"}
      </button>
    </div>
  );
}

// ─── Foto Editorial Editor ────────────────────────────────────────────────────
function FotoEditor() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: "", category_label: "Editorial", thumbnail_url: "", photos: [] });
  const [uploading, setUploading] = useState(false);

  const { data: fotoItems = [] } = useQuery({
    queryKey: ["start-foto-items"],
    queryFn: () => base44.entities.StartPageFotoItem.list("order"),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingId
      ? base44.entities.StartPageFotoItem.update(editingId, data)
      : base44.entities.StartPageFotoItem.create({ ...data, order: fotoItems.length }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["start-foto-items"] }); setEditingId(null); setForm({ title: "", category_label: "Editorial", thumbnail_url: "", photos: [] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StartPageFotoItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["start-foto-items"] }),
  });

  const handleUploadThumb = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, thumbnail_url: file_url }));
    setUploading(false);
  };

  const handleUploadPhotos = async (files) => {
    if (!files.length) return;
    setUploading(true);
    const urls = await Promise.all(Array.from(files).map(async f => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      return file_url;
    }));
    setForm(f => ({ ...f, photos: [...(f.photos || []), ...urls] }));
    setUploading(false);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ title: item.title || "", category_label: item.category_label || "Editorial", thumbnail_url: item.thumbnail_url || "", photos: item.photos || [] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: "", category_label: "Editorial", thumbnail_url: "", photos: [] });
  };

  return (
    <div className="space-y-4">
      {/* Existing items */}
      {fotoItems.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          {item.thumbnail_url && <img src={item.thumbnail_url} alt="" className="w-14 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
            <p className="text-[10px] text-white/30">{(item.photos || []).length} fotos · {item.category_label || "Editorial"}</p>
          </div>
          <button onClick={() => startEdit(item)} className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white/40 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">Editar</button>
          <button onClick={() => { if (confirm("¿Eliminar esta entrada?")) deleteMutation.mutate(item.id); }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-white/20 hover:text-red-400" />
          </button>
        </div>
      ))}

      {/* Form */}
      <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/[0.04] space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400/70">
          {editingId ? "Editar entrada fotográfica" : "Nueva entrada fotográfica"}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Título *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={iClass} placeholder="Nombre de la sesión" />
          </div>
          <div>
            <label className={labelClass}>Etiqueta de categoría</label>
            <input value={form.category_label} onChange={e => setForm(f => ({ ...f, category_label: e.target.value }))} className={iClass} placeholder="Editorial, Retrato..." />
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className={labelClass}>Miniatura principal</label>
          <div className="flex gap-2 items-center">
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="w-16 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" />}
            <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} className={iClass} placeholder="URL o sube imagen" />
            <label className="flex-shrink-0 px-3 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 text-white/40 text-xs flex items-center gap-1">
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUploadThumb(e.target.files[0])} />
              <Upload className="w-3.5 h-3.5" />
            </label>
          </div>
        </div>

        {/* Photos gallery */}
        <div>
          <label className={labelClass}>Fotos de la galería ({(form.photos || []).length} fotos)</label>
          {form.photos?.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {form.photos.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-16 h-10 rounded-lg object-cover border border-white/10" />
                  <button onClick={() => setForm(f => ({ ...f, photos: f.photos.filter((_, pi) => pi !== i) }))}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-dashed border-white/15 rounded-lg cursor-pointer hover:bg-white/10 transition-colors text-white/40 text-xs">
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files?.length && handleUploadPhotos(e.target.files)} />
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Subiendo..." : "Añadir fotos (selección múltiple)"}
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => saveMutation.mutate(form)}
            disabled={!form.title || saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
            style={{ background: "rgba(255,88,51,0.15)", color: "#ff5833", border: "1px solid rgba(255,88,51,0.25)" }}
          >
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {editingId ? "Guardar cambios" : "Crear entrada"}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="px-4 py-2 rounded-lg text-xs font-semibold text-white/40 bg-white/5 border border-white/10 transition-colors hover:bg-white/10">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function StartExplorarEditor() {
  const [activeTab, setActiveTab] = useState("films");
  const current = TABS.find(t => t.key === activeTab);

  return (
    <div>
      <p className="text-xs text-white/30 mb-4">
        Selecciona qué proyectos aparecen en cada fila del bloque <strong className="text-white/50">"Atrévete a Explorar"</strong> de la página /start.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/[0.06] pb-0">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all -mb-px ${activeTab === tab.key ? "text-white border-orange-500/70" : "text-white/25 border-transparent hover:text-white/50"}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {current?.isPhoto ? (
        <FotoEditor />
      ) : (
        <MediaRowEditor rowKey={activeTab} allowedTypes={current?.types || []} />
      )}
    </div>
  );
}