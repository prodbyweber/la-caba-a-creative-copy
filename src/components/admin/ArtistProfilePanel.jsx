import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X, User, Mail, Phone, MapPin, ExternalLink, Music2,
  LayoutDashboard, Clock, Edit, Check, Upload, Instagram,
  Youtube, Globe, AtSign
} from "lucide-react";
import StudioHoursAdmin from "@/components/admin/StudioHoursAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const SOCIAL_ICONS = {
  instagram: { icon: Instagram, color: "#e879a0" },
  youtube:   { icon: Youtube,   color: "#ff4444" },
  tiktok:    { icon: Music2,    color: "#a855f7" },
  spotify:   { icon: Globe,     color: "#1db954" },
  applemusic:{ icon: Globe,     color: "#fc3c44" },
};

const iCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";
const labelCls = "block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1.5";

export default function ArtistProfilePanel({ artist, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(artist);
  const [editProfile, setEditProfile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const queryClient = useQueryClient();

  // Load linked UserProfile
  const { data: userProfile } = useQuery({
    queryKey: ["artist-profile", artist.user_id],
    queryFn: async () => {
      if (!artist.user_id) return null;
      const results = await base44.entities.UserProfile.filter({ user_id: artist.user_id });
      return results[0] || null;
    },
    enabled: !!artist.user_id,
  });

  const openEdit = () => {
    setEditForm(artist);
    setEditProfile(userProfile ? { ...userProfile } : null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(artist);
    setEditProfile(null);
  };

  const updateArtistMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artists'] }),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artist-profile", artist.user_id] }),
  });

  const handleSave = async () => {
    await updateArtistMutation.mutateAsync(editForm);
    if (editProfile?.id) {
      await updateProfileMutation.mutateAsync({
        id: editProfile.id,
        data: {
          first_name: editProfile.first_name,
          last_name: editProfile.last_name,
          full_name: `${editProfile.first_name || ""} ${editProfile.last_name || ""}`.trim(),
          username: editProfile.username,
        }
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditForm(f => ({ ...f, avatar_url: file_url }));
    setUploadingAvatar(false);
  };

  const avatarUrl = isEditing ? editForm.avatar_url : artist.avatar_url;
  const displayName = artist.stageName;
  const fullName = userProfile?.full_name || userProfile
    ? `${userProfile?.first_name || ""} ${userProfile?.last_name || ""}`.trim()
    : artist.legalName;
  const username = userProfile?.username;

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "hours", label: "Horas" },
  ];

  const isSaving = updateArtistMutation.isPending || updateProfileMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative flex flex-col"
        style={{ width: "min(480px, 100vw)", background: "#0c0c0d", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* ── HERO ── */}
        <div className="relative flex-shrink-0" style={{ height: 180 }}>
          {avatarUrl ? (
            <>
              <img src={avatarUrl} alt={displayName} className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-25" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,12,13,0.3) 0%, #0c0c0d 100%)" }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)" }} />
          )}

          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors z-10">
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Avatar */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-2xl flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.12)", background: "#1a1a1c" }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" style={{ objectPosition: artist.photo_position || "center top" }} />
                  : <User className="w-8 h-8 text-white/20" />
                }
              </div>
              {isEditing && (
                <label className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.65)" }}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  {uploadingAvatar ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Upload className="w-5 h-5 text-white" />}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ── NAME ROW ── */}
        <div className="pt-14 px-6 pb-4 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input value={editForm.stageName} onChange={e => setEditForm(f => ({ ...f, stageName: e.target.value }))} className={iCls + " text-base font-bold"} placeholder="Nombre artístico" />
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className={iCls} style={{ colorScheme: "dark" }}>
                  <option value="Lead">Lead</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-black text-white leading-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                  {displayName}
                </h2>
                {fullName && fullName !== displayName && (
                  <p className="text-xs text-white/35 mt-0.5">{fullName}</p>
                )}
                {username && (
                  <p className="text-[11px] text-white/25 mt-0.5 flex items-center gap-1">
                    <AtSign className="w-3 h-3" />{username}
                  </p>
                )}
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  artist.status === 'Active' ? 'bg-white/[0.06] border-white/15 text-white/60' :
                  artist.status === 'Lead'   ? 'bg-white/[0.04] border-white/10 text-white/40' :
                                               'bg-white/[0.03] border-white/[0.07] text-white/25'
                }`}>
                  {artist.status}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {isEditing ? (
              <>
                <button onClick={cancelEdit} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white hover:bg-white/[0.06] transition-all disabled:opacity-40">
                  {isSaving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Guardar
                </button>
              </>
            ) : (
              <button onClick={openEdit} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all">
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Dashboard CTA ── */}
        <div className="px-6 pb-4 flex-shrink-0">
          <Link to={`/ArtistDashboard?id=${artist.id}`}>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all">
              <LayoutDashboard className="w-4 h-4" />
              Ver Dashboard del Artista
            </button>
          </Link>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-white/[0.06] px-6 flex-shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`relative px-3 pb-3 pt-1 text-xs font-semibold transition-colors mr-1 ${activeTab === t.id ? "text-white" : "text-white/30 hover:text-white/60"}`}>
              {t.label}
              {activeTab === t.id && (
                <motion.div layoutId="panelTabLine" className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* Identidad */}
              <div>
                <p className={labelCls}>Identidad</p>
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Nombre</label>
                        <input
                          value={editProfile?.first_name || ""}
                          onChange={e => setEditProfile(p => ({ ...p, first_name: e.target.value }))}
                          className={iCls}
                          placeholder="Nombre"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Apellidos</label>
                        <input
                          value={editProfile?.last_name || ""}
                          onChange={e => setEditProfile(p => ({ ...p, last_name: e.target.value }))}
                          className={iCls}
                          placeholder="Apellidos"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Username</label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                        <input
                          value={editProfile?.username || ""}
                          onChange={e => setEditProfile(p => ({ ...p, username: e.target.value }))}
                          className={iCls + " pl-8"}
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(userProfile?.first_name || userProfile?.last_name) && (
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <User className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                        <span className="text-sm text-white/60">{[userProfile.first_name, userProfile.last_name].filter(Boolean).join(" ")}</span>
                      </div>
                    )}
                    {username && (
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <AtSign className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                        <span className="text-sm text-white/60">{username}</span>
                      </div>
                    )}
                    {!userProfile?.first_name && !userProfile?.last_name && !username && artist.legalName && (
                      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <User className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                        <span className="text-sm text-white/60">{artist.legalName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Contacto */}
              <div>
                <p className={labelCls}>Contacto</p>
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/20 flex-shrink-0" />
                      <input type="email" value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} className={iCls} placeholder="Email" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-white/20 flex-shrink-0" />
                      <input type="tel" value={editForm.phone || ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} className={iCls} placeholder="Teléfono" />
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white/20 flex-shrink-0" />
                      <input type="text" value={editForm.location || ""} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className={iCls} placeholder="Ubicación" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { icon: Mail,  value: artist.email,    href: `mailto:${artist.email}` },
                      { icon: Phone, value: artist.phone,    href: `tel:${artist.phone}` },
                      { icon: MapPin,value: artist.location, href: null },
                    ].map(({ icon: Icon, value, href }) => value ? (
                      <div key={value} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                        {href
                          ? <a href={href} className="text-sm text-white/60 hover:text-white transition-colors truncate">{value}</a>
                          : <span className="text-sm text-white/60 truncate">{value}</span>
                        }
                      </div>
                    ) : null)}
                    {!artist.email && !artist.phone && !artist.location && (
                      <p className="text-xs text-white/20 py-4 text-center">Sin información de contacto</p>
                    )}
                  </div>
                )}
              </div>

              {/* Redes sociales */}
              {!isEditing && artist.social_links && Object.values(artist.social_links).some(Boolean) && (
                <div>
                  <p className={labelCls}>Redes Sociales</p>
                  <div className="space-y-2">
                    {Object.entries(artist.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const cfg = SOCIAL_ICONS[platform];
                      const Icon = cfg?.icon || Globe;
                      return (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05] transition-all group">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg?.color || "rgba(255,255,255,0.3)" }} />
                          <span className="text-sm text-white/50 capitalize group-hover:text-white/80 transition-colors flex-1">{platform}</span>
                          <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40 flex-shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bio */}
              {!isEditing && artist.bio && (
                <div>
                  <p className={labelCls}>Bio</p>
                  <p className="text-sm text-white/45 leading-relaxed">{artist.bio}</p>
                </div>
              )}

              {/* Notas internas — solo en edición */}
              {isEditing && (
                <div>
                  <label className={labelCls}>Notas Internas</label>
                  <textarea value={editForm.notes || ""} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={3} className={iCls + " resize-none"} placeholder="Notas internas..." />
                </div>
              )}
            </div>
          )}

          {/* HORAS */}
          {activeTab === "hours" && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-white/30" />
                <p className="text-sm font-semibold text-white">Horas de Estudio</p>
              </div>
              <StudioHoursAdmin artist={artist} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}