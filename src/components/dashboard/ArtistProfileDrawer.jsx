import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Youtube, Instagram, Music, Video, Plus, Check, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const socialPlatforms = [
  { id: "youtube",   name: "YouTube",   icon: Youtube,   textColor: "text-red-400",   borderColor: "border-red-500/30",   bg: "from-red-500/15 to-red-600/15" },
  { id: "instagram", name: "Instagram", icon: Instagram, textColor: "text-pink-400",  borderColor: "border-pink-500/30",  bg: "from-pink-500/15 to-purple-600/15" },
  { id: "spotify",   name: "Spotify",   icon: Music,     textColor: "text-green-400", borderColor: "border-green-500/30", bg: "from-green-500/15 to-green-600/15" },
  { id: "tiktok",    name: "TikTok",    icon: Video,     textColor: "text-purple-400",borderColor: "border-purple-500/30",bg: "from-purple-500/15 to-purple-600/15" },
];

// Avatar circular — icono que va en la nav
export function ArtistAvatarButton({ artist, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden border border-white/15 hover:border-white/35 transition-all flex-shrink-0 flex items-center justify-center"
      style={{ background: "#1c1c1e" }}
      title={artist?.stageName || "Perfil"}
    >
      {artist?.avatar_url ? (
        <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover object-top grayscale" />
      ) : (
        <User className="w-4 h-4 text-white/30" />
      )}
    </button>
  );
}

// Drawer lateral completo con perfil + redes + edición
export default function ArtistProfileDrawer({ artist, isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [socialLinks, setSocialLinks] = useState(artist?.social_links || {});
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [platformUrl, setPlatformUrl] = useState("");

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', artist?.id] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setIsEditing(false);
    },
  });

  const handleEditOpen = () => {
    setFormData({
      stageName: artist?.stageName || "",
      genre: artist?.genre || "",
      bio: artist?.bio || "",
      location: artist?.location || "",
      avatar_url: artist?.avatar_url || "",
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateMutation.mutate({ ...formData, social_links: socialLinks });
  };

  const handleSaveSocial = () => {
    const updated = { ...socialLinks, [editingPlatform]: platformUrl };
    setSocialLinks(updated);
    updateMutation.mutate({ social_links: updated });
    setEditingPlatform(null);
    setPlatformUrl("");
  };

  const handleRemoveSocial = (id) => {
    const updated = { ...socialLinks };
    delete updated[id];
    setSocialLinks(updated);
    updateMutation.mutate({ social_links: updated });
  };

  if (!artist) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-80 z-50 flex flex-col"
            style={{ background: "#111113", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <span className="text-sm font-semibold text-white/70">Perfil</span>
              <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* Avatar + nombre */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 flex items-center justify-center" style={{ background: "#1c1c1e" }}>
                  {artist.avatar_url ? (
                    <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover object-top grayscale" />
                  ) : (
                    <User className="w-9 h-9 text-white/20" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-base leading-tight">{artist.stageName}</p>
                  {artist.genre && <p className="text-white/30 text-xs mt-0.5">{artist.genre}</p>}
                  {artist.location && <p className="text-white/20 text-[10px] mt-0.5">{artist.location}</p>}
                </div>
                <button
                  onClick={handleEditOpen}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white text-xs font-medium transition-all"
                >
                  <Edit className="w-3 h-3" /> Editar perfil
                </button>
              </div>

              {/* Editar perfil inline */}
              <AnimatePresence>
                {isEditing && formData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 p-4 rounded-xl border border-white/8" style={{ background: "#181818" }}>
                      <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Editar perfil</p>
                      {[
                        { key: "stageName", label: "Nombre artístico" },
                        { key: "genre",     label: "Género" },
                        { key: "location",  label: "Ubicación" },
                        { key: "avatar_url",label: "URL Avatar" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-[10px] text-white/30 mb-1">{label}</label>
                          <input
                            value={formData[key]}
                            onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/8 focus:outline-none focus:border-white/20 transition-colors"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={e => setFormData({ ...formData, bio: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/8 focus:outline-none focus:border-white/20 transition-colors resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 font-medium transition-colors">
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={updateMutation.isPending}
                          className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updateMutation.isPending ? "..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bio */}
              {artist.bio && !isEditing && (
                <p className="text-xs text-white/30 leading-relaxed">{artist.bio}</p>
              )}

              {/* Redes sociales */}
              <div>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Redes Sociales</p>
                <div className="space-y-2">
                  {socialPlatforms.map(({ id, name, icon: Icon, textColor, borderColor, bg }) => {
                    const url = socialLinks[id];
                    return (
                      <div key={id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all bg-gradient-to-br ${url ? `${bg} ${borderColor}` : "bg-white/[0.03] border-white/[0.06]"}`}>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${url ? textColor : "text-white/20"}`} />
                        <span className={`text-xs flex-1 truncate ${url ? "text-white/70" : "text-white/20"}`}>
                          {url ? url.replace(/^https?:\/\/(www\.)?/, "") : name}
                        </span>
                        <button
                          onClick={() => {
                            if (url) {
                              handleRemoveSocial(id);
                            } else {
                              setEditingPlatform(id);
                              setPlatformUrl(url || "");
                            }
                          }}
                          className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                        >
                          {url ? (
                            <X className="w-3 h-3 text-white/25 hover:text-red-400" />
                          ) : (
                            <Plus className="w-3 h-3 text-white/25" />
                          )}
                        </button>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                            <svg className="w-2.5 h-2.5 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Input para agregar URL de red social */}
                <AnimatePresence>
                  {editingPlatform && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-2"
                    >
                      <div className="p-3 rounded-lg border border-white/10" style={{ background: "#181818" }}>
                        <p className="text-[10px] text-white/30 mb-2">URL de {socialPlatforms.find(p => p.id === editingPlatform)?.name}</p>
                        <input
                          type="url"
                          autoFocus
                          value={platformUrl}
                          onChange={e => setPlatformUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/8 focus:outline-none focus:border-white/20 mb-2 transition-colors"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingPlatform(null); setPlatformUrl(""); }} className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-white/40 font-medium">Cancelar</button>
                          <button onClick={handleSaveSocial} disabled={!platformUrl} className="flex-1 py-1.5 rounded-lg bg-white text-black text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> Guardar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}