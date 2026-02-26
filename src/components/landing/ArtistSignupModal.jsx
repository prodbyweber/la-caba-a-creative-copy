import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader, Check, MapPin, Music, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

export default function ArtistSignupModal({ onClose, user }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    stageName: "",
    legalName: user?.full_name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    genre: "",
    bio: "",
    avatar_url: "",
    social_links: {
      instagram: "",
      youtube: "",
      tiktok: "",
      spotify: "",
      applemusic: ""
    }
  });

  const genres = [
    "Hip Hop",
    "Trap",
    "Reggaeton",
    "Urban",
    "Pop",
    "Rock",
    "Electrónica",
    "House",
    "Indie",
    "R&B",
    "Latin",
    "Otro"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handleCreateArtist = async () => {
    if (!formData.stageName.trim()) {
      setError("El nombre artístico es requerido");
      return;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return;
    }
    if (!formData.genre) {
      setError("Por favor selecciona un género");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Crear artista
      const artist = await base44.entities.Artist.create({
        stageName: formData.stageName,
        legalName: formData.legalName,
        email: formData.email,
        phone: formData.phone || null,
        location: formData.location || null,
        genre: formData.genre,
        bio: formData.bio || null,
        avatar_url: formData.avatar_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop",
        social_links: formData.social_links,
        status: "Active",
        tags: formData.genre ? [formData.genre] : []
      });

      // Actualizar usuario con la referencia al artista
      await base44.auth.updateMe({
        artist_id: artist.id
      });

      queryClient.invalidateQueries({ queryKey: ['user'] });
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error creating artist:", err);
      setError(err.message || "Error al crear el perfil de artista");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-3xl border border-purple-500/30 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#111113]/95 backdrop-blur">
          <div>
            <h2 className="text-2xl font-bold text-white">Crear Perfil de Artista</h2>
            <p className="text-xs text-gray-500 mt-1">Paso {step} de 2</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-96 py-12 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4"
              >
                <Check className="w-8 h-8 text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Perfil Creado!</h3>
              <p className="text-gray-400 mb-4">
                Tu cuenta de artista está lista. Redirigiendo...
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Nombre Artístico *
                    </label>
                    <input
                      type="text"
                      name="stageName"
                      value={formData.stageName}
                      onChange={handleInputChange}
                      placeholder="Ej: SOPHY, JLY, Prod by Weber"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Este es tu nombre artístico público</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Nombre Legal
                    </label>
                    <input
                      type="text"
                      name="legalName"
                      value={formData.legalName}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white opacity-60 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Vinculado a tu cuenta de Google</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+34 600 123 456"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Madrid, España"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Género Musical *
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    >
                      <option value="">Selecciona un género</option>
                      {genres.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Cuéntanos sobre ti y tu música..."
                      maxLength={500}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 caracteres</p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Social Links */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-purple-300 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Conecta tus redes sociales (opcional)
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.social_links.instagram}
                      onChange={(e) => handleSocialChange("instagram", e.target.value)}
                      placeholder="https://instagram.com/tuusuario"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={formData.social_links.youtube}
                      onChange={(e) => handleSocialChange("youtube", e.target.value)}
                      placeholder="https://youtube.com/@tucanal"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      TikTok
                    </label>
                    <input
                      type="url"
                      value={formData.social_links.tiktok}
                      onChange={(e) => handleSocialChange("tiktok", e.target.value)}
                      placeholder="https://tiktok.com/@tuusuario"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Spotify
                    </label>
                    <input
                      type="url"
                      value={formData.social_links.spotify}
                      onChange={(e) => handleSocialChange("spotify", e.target.value)}
                      placeholder="https://open.spotify.com/artist/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Apple Music
                    </label>
                    <input
                      type="url"
                      value={formData.social_links.applemusic}
                      onChange={(e) => handleSocialChange("applemusic", e.target.value)}
                      placeholder="https://music.apple.com/artist/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t border-white/5 flex items-center justify-between gap-3 sticky bottom-0 bg-[#111113]/95 backdrop-blur">
            <button
              onClick={() => step === 2 && setStep(1)}
              disabled={step === 1 || loading}
              className="px-6 py-2.5 rounded-xl border border-white/10 font-medium text-sm hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Atrás
            </button>

            <button
              onClick={() => step === 1 ? setStep(2) : handleCreateArtist()}
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 font-medium text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {step === 1 ? "Siguiente..." : "Creando..."}
                </>
              ) : (
                step === 1 ? "Siguiente" : "Crear Perfil"
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}