import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus, Upload, Image as ImageIcon, Save, UserPlus } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CreateProjectModal({ isOpen, onClose, jlyArtistId, project = null }) {
  const [formData, setFormData] = useState({
    artist_id: jlyArtistId || "",
    collaborator_artist_ids: [],
    title: "",
    type: "Single",
    status: "Draft",
    genre: "",
    description: "",
    bpm: "",
    key: "",
    cover_url: "",
    producer: "",
    mix_engineer: "",
    master_engineer: "",
    start_date: "",
    target_delivery_date: ""
  });

  const [uploading, setUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState("");

  const { data: allArtists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
    initialData: [],
  });

  useEffect(() => {
    if (project) {
      setFormData({
        artist_id: project.artist_id || jlyArtistId || "",
        collaborator_artist_ids: project.collaborator_artist_ids || [],
        title: project.title || "",
        type: project.type || "Single",
        status: project.status || "Draft",
        genre: project.genre || "",
        description: project.description || "",
        bpm: project.bpm || "",
        key: project.key || "",
        cover_url: project.cover_url || "",
        producer: project.producer || "",
        mix_engineer: project.mix_engineer || "",
        master_engineer: project.master_engineer || "",
        start_date: project.start_date || "",
        target_delivery_date: project.target_delivery_date || ""
      });
      setCoverPreview(project.cover_url || "");
    } else {
      setFormData({
        artist_id: jlyArtistId || "",
        collaborator_artist_ids: [],
        title: "",
        type: "Single",
        status: "Draft",
        genre: "",
        description: "",
        bpm: "",
        key: "",
        cover_url: "",
        producer: "",
        mix_engineer: "",
        master_engineer: "",
        start_date: "",
        target_delivery_date: ""
      });
      setCoverPreview("");
    }
  }, [project, jlyArtistId, isOpen]);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => project 
      ? base44.entities.Project.update(project.id, data)
      : base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_url: file_url });
      setCoverPreview(file_url);
    } catch (error) {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const dataToSubmit = {
      ...formData,
      artist_id: formData.artist_id || jlyArtistId,
      bpm: formData.bpm ? Number(formData.bpm) : undefined,
    };

    createMutation.mutate(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                {project ? <Save className="w-5 h-5 text-emerald-400" /> : <FolderPlus className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                <p className="text-sm text-gray-500">
                  {project ? 'Actualiza la información del proyecto' : 'Crea un nuevo proyecto musical'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Portada */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portada del Proyecto
              </label>
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-600" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <label className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-colors cursor-pointer inline-flex items-center gap-2 w-fit">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG (recomendado 1000x1000px)</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Título del Proyecto *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="EP de verano, Álbum 2025..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                required
              />
            </div>

            {/* Artistas */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Artistas
              </h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Artista Principal *
                </label>
                <select
                  value={formData.artist_id}
                  onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                >
                  <option value="">Seleccionar artista...</option>
                  {allArtists.map(artist => (
                    <option key={artist.id} value={artist.id}>
                      {artist.stageName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Colaboradores / Featuring (Opcional)
                </label>
                <select
                  multiple
                  value={formData.collaborator_artist_ids}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, collaborator_artist_ids: selected });
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[100px]"
                >
                  {allArtists
                    .filter(artist => artist.id !== formData.artist_id)
                    .map(artist => (
                      <option key={artist.id} value={artist.id}>
                        {artist.stageName}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén Ctrl/Cmd presionado para seleccionar múltiples</p>
                
                {/* Selected Collaborators */}
                {formData.collaborator_artist_ids.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.collaborator_artist_ids.map(id => {
                      const artist = allArtists.find(a => a.id === id);
                      return artist ? (
                        <span
                          key={id}
                          className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium flex items-center gap-2"
                        >
                          {artist.stageName}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                collaborator_artist_ids: formData.collaborator_artist_ids.filter(cid => cid !== id)
                              });
                            }}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="Single">Single</option>
                  <option value="EP">EP</option>
                  <option value="Album">Álbum</option>
                  <option value="ContentPack">Content Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="Draft">Borrador</option>
                  <option value="Recording">Grabación</option>
                  <option value="Producing">Producción</option>
                  <option value="Mixing">Mezcla</option>
                  <option value="Mastering">Masterización</option>
                  <option value="Delivered">Entregado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Género
                </label>
                <input
                  type="text"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="Reggaeton, Trap..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BPM
                </label>
                <input
                  type="number"
                  value={formData.bpm}
                  onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                  placeholder="120"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tonalidad / Key
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="C# Minor, A Major..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Créditos */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-white">Créditos</h4>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Productor(es)
                </label>
                <input
                  type="text"
                  value={formData.producer}
                  onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                  placeholder="Nombres separados por comas"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Ingeniero de Mezcla
                </label>
                <input
                  type="text"
                  value={formData.mix_engineer}
                  onChange={(e) => setFormData({ ...formData, mix_engineer: e.target.value })}
                  placeholder="Nombre del ingeniero"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Ingeniero de Masterización
                </label>
                <input
                  type="text"
                  value={formData.master_engineer}
                  onChange={(e) => setFormData({ ...formData, master_engineer: e.target.value })}
                  placeholder="Nombre del ingeniero"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Entrega
                </label>
                <input
                  type="date"
                  value={formData.target_delivery_date}
                  onChange={(e) => setFormData({ ...formData, target_delivery_date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el concepto del proyecto..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || uploading}
                className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {createMutation.isPending 
                  ? (project ? 'Guardando...' : 'Creando...') 
                  : (project ? 'Guardar Cambios' : 'Crear Proyecto')
                }
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}