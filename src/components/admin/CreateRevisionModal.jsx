import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CreateRevisionModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => base44.entities.Track.list()
  });

  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    track_id: "",
    timecode: "",
    revision_type: "Mix",
    request_text: "",
    severity: "Medium",
    status: "Open",
    assigned_to: "Me"
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Revision.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      onClose();
      setFormData({
        artist_id: "",
        project_id: "",
        track_id: "",
        timecode: "",
        revision_type: "Mix",
        request_text: "",
        severity: "Medium",
        status: "Open",
        assigned_to: "Me"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Nueva Revisión</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artista</label>
              <select
                required
                value={formData.artist_id}
                onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar artista</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>{artist.stageName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
              <select
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Track (opcional)</label>
              <select
                value={formData.track_id}
                onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sin track específico</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>{track.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timecode (MM:SS)</label>
              <input
                type="text"
                required
                value={formData.timecode}
                onChange={(e) => setFormData({ ...formData, timecode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: 01:45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.revision_type}
                onChange={(e) => setFormData({ ...formData, revision_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Vocal">Vocal</option>
                <option value="Beat">Beat</option>
                <option value="Mix">Mezcla</option>
                <option value="Master">Master</option>
                <option value="Arrangement">Arreglo</option>
                <option value="FX">Efectos</option>
                <option value="Lyrics">Letra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                required
                value={formData.request_text}
                onChange={(e) => setFormData({ ...formData, request_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Describe la revisión necesaria..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Small">Pequeña</option>
                <option value="Medium">Media</option>
                <option value="Critical">Crítica</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {mutation.isPending ? "Creando..." : "Crear Revisión"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}