import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader, Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function UploadClipModal({ onClose, artistId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [selectedArtist, setSelectedArtist] = useState(artistId || "");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState("");

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', selectedArtist],
    queryFn: () => {
      if (!selectedArtist) return [];
      return base44.entities.Project.filter({ artist_id: selectedArtist });
    },
    enabled: !!selectedArtist,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['tracks', selectedProject],
    queryFn: () => {
      if (!selectedProject) return [];
      return base44.entities.Track.filter({ project_id: selectedProject });
    },
    enabled: !!selectedProject,
  });

  const { data: allArtists = [] } = useQuery({
    queryKey: ['allArtists'],
    queryFn: () => base44.entities.Artist.list(),
  });

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const isVideo = file.type.startsWith('video/');
      const isValidFormat = file.name.match(/\.(mp4|mov)$/i);
      return isVideo && isValidFormat;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36),
      status: 'pending',
      title: file.name.replace(/\.[^/.]+$/, "")
    }))]);
  };

  const handleUpload = async () => {
    if (!selectedArtist) {
      alert("Por favor selecciona un artista");
      return;
    }

    setUploading(true);

    for (const fileObj of files) {
      if (fileObj.status === 'success') continue;

      try {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

        // Upload file
        const uploadResponse = await base44.integrations.Core.UploadFile({
          file: fileObj.file
        });

        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 50 }));

        // Create clip record
         await base44.entities.Clip.create({
           title: fileObj.title,
           artist_id: selectedArtist,
           project_id: selectedProject || null,
           track_id: selectedTrack || null,
           file_url: uploadResponse.file_url,
           thumbnail_url: uploadResponse.file_url,
           status: "draft",
           platforms: [],
           hashtags: [],
           tags: [],
           featuring_artists: collaborators
         });

        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'success' } : f
        ));
      } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }

    setUploading(false);

    // If all successful, close after a moment
    const allSuccess = files.every(f => f.status === 'success');
    if (allSuccess) {
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileTitle = (id, title) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, title } : f
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Subir Clips</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Artist Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              Artista *
            </label>
            <select
              value={selectedArtist}
              onChange={(e) => {
                setSelectedArtist(e.target.value);
                setSelectedProject("");
                setSelectedTrack("");
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
              disabled={uploading}
            >
              <option value="">Seleccionar artista...</option>
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.stageName || artist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          {selectedArtist && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Proyecto
              </label>
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setSelectedTrack("");
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                disabled={uploading}
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Track Selection */}
          {selectedProject && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Canción
              </label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition-colors"
                disabled={uploading}
              >
                <option value="">Seleccionar canción...</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Collaborators Selection */}
          {selectedArtist && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Artistas Colaboradores
              </label>
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {allArtists.filter(a => a.id !== selectedArtist).map(artist => (
                  <label key={artist.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collaborators.includes(artist.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCollaborators([...collaborators, artist.id]);
                        } else {
                          setCollaborators(collaborators.filter(id => id !== artist.id));
                        }
                      }}
                      className="w-4 h-4 rounded bg-white/5 border border-white/10"
                      disabled={uploading}
                    />
                    <span className="text-sm text-gray-400">{artist.stageName || artist.name}</span>
                  </label>
                ))}
              </div>
              {collaborators.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {collaborators.map(collabId => {
                      const artist = allArtists.find(a => a.id === collabId);
                      return (
                        <div key={collabId} className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1 text-xs flex items-center gap-2">
                          <span>{artist?.stageName || artist?.name}</span>
                          <button
                            type="button"
                            onClick={() => setCollaborators(collaborators.filter(id => id !== collabId))}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Area */}
          {files.length === 0 ? (
            <label className="block">
              <input
                type="file"
                multiple
                accept="video/mp4,video/quicktime,.mp4,.mov"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500">
                  Formatos: MP4, MOV • Orientación: 9:16 (vertical)
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              {files.map(fileObj => (
                <div
                  key={fileObj.id}
                  className="bg-[#0a0a0b] rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="mt-1">
                      {fileObj.status === 'pending' && (
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-purple-400" />
                        </div>
                      )}
                      {fileObj.status === 'success' && (
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                      )}
                      {fileObj.status === 'error' && (
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                      )}
                      {uploading && fileObj.status === 'pending' && (
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Loader className="w-5 h-5 text-purple-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={fileObj.title}
                        onChange={(e) => updateFileTitle(fileObj.id, e.target.value)}
                        className="w-full bg-transparent border-none text-sm font-medium mb-1 focus:outline-none"
                        placeholder="Título del clip"
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileObj.error && (
                        <p className="text-xs text-red-400 mt-1">{fileObj.error}</p>
                      )}
                      {uploadProgress[fileObj.id] !== undefined && fileObj.status !== 'success' && (
                        <div className="mt-2">
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 transition-all duration-300"
                              style={{ width: `${uploadProgress[fileObj.id]}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    {!uploading && (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              {!uploading && (
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="video/mp4,video/quicktime,.mp4,.mov"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border border-dashed border-white/10 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Agregar más clips</p>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {files.length > 0 && (
          <div className="p-6 border-t border-white/5 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {files.length} archivo{files.length !== 1 ? 's' : ''} seleccionado{files.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedArtist || files.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir {files.length} clip{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}