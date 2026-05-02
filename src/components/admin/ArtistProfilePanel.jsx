import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Mail, Phone, MapPin, ExternalLink, Music2,
  LayoutDashboard, Clock, Edit, Check, Upload, Instagram,
  Youtube, Globe
} from "lucide-react";
import StudioHoursAdmin from "@/components/admin/StudioHoursAdmin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SOCIAL_ICONS = {
  instagram: { icon: Instagram, color: "#e879a0" },
  youtube: { icon: Youtube, color: "#ff4444" },
  tiktok: { icon: Music2, color: "#a855f7" },
  spotify: { icon: Globe, color: "#1db954" },
  applemusic: { icon: Globe, color: "#fc3c44" },
};

const iCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20 transition-colors";

export default function ArtistProfilePanel({ artist, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(artist);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const queryClient = useQueryClient();

  const updateArtistMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setIsEditing(false);
    }
  });

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

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "hours", label: "Horas" },
  ];

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
              <img
                src={avatarUrl}
                alt={displayName}
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-25"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(12,12,13,0.3) 0%, #0c0c0d 100%)" }} />
            </>
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 100%)" }} />
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors z-10"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Avatar */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
            <div className="relative group">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-2xl flex items-center justify-center"
                style={{ borderColor: "rgba(255,255,255,0.12)", background: "#1a1a1c" }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: artist.photo_position || "center top" }}
                  />
                ) : (
                  <User className="w-8 h-8 text-white/20" />
                )}
              </div>
              {isEditing && (
                <label
                  className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.65)" }}
                >
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                  {uploadingAvatar
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Upload className="w-5 h-5 text-white" />
                  }
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
                <input
                  value={editForm.stageName}
                  onChange={e => setEditForm(f => ({ ...f, stageName: e.target.value }))}
                  className={iCls + " text-lg font-bold"}
                  placeholder="Nombre artístico"
                />
                <input
                  value={editForm.legalName || ""}
                  onChange={e => setEditForm(f => ({ ...f, legalName: e.target.value }))}
                  className={iCls}
                  placeholder="Nombre legal"
                />
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className={iCls}
                  style={{ colorScheme: "dark" }}
                >
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
                {artist.legalName && (
                  <p className="text-xs text-white/35 mt-0.5">{artist.legalName}</p>
                )}
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  artist.status === 'Active'
                    ? 'bg-white/[0.06] border-white/15 text-white/60'
                    : artist.status === 'Lead'
                    ? 'bg-white/[0.04] border-white/10 text-white/40'
                    : 'bg-white/[0.03] border-white/[0.07] text-white/25'
                }`}>
                  {artist.status}
                </span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setEditForm(artist); }}
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateArtistMutation.mutate(editForm)}
                  disabled={updateArtistMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white hover:bg-white/[0.06] transition-all disabled:opacity-40"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/35 hover:text-white hover:border-white/20 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Ver Dashboard CTA ── */}
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
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-3 pb-3 pt-1 text-xs font-semibold transition-colors mr-1 ${
                activeTab === t.id ? "text-white" : "text-white/30 hover:text-white/60"
              }`}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div
                  layoutId="panelTabLine"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "none" }}>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* Contact */}
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Contacto</p>
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
                  <div className="space-y-2.5">
                    {[
                      { icon: Mail, value: artist.email, href: `mailto:${artist.email}` },
                      { icon: Phone, value: artist.phone, href: `tel:${artist.phone}` },
                      { icon: MapPin, value: artist.location },
                    ].map(({ icon: Icon, value, href }) => value ? (
                      <div key={value} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                        {href ? (
                          <a href={href} className="text-sm text-white/60 hover:text-white transition-colors truncate">{value}</a>
                        ) : (
                          <span className="text-sm text-white/60 truncate">{value}</span>
                        )}
                      </div>
                    ) : null)}
                    {!artist.email && !artist.phone && !artist.location && (
                      <p className="text-xs text-white/20 py-4 text-center">Sin información de contacto</p>
                    )}
                  </div>
                )}
              </div>

              {/* Género & Tags */}
              <div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Género & Tags</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.genre || ""}
                    onChange={e => setEditForm(f => ({ ...f, genre: e.target.value }))}
                    className={iCls}
                    placeholder="Género musical"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {artist.genre && (
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs font-medium">
                        {artist.genre}
                      </span>
                    )}
                    {(artist.tags || []).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs">
                        {tag}
                      </span>
                    ))}
                    {!artist.genre && (!artist.tags || artist.tags.length === 0) && (
                      <p className="text-xs text-white/20 py-2">Sin géneros asignados</p>
                    )}
                  </div>
                )}
              </div>

              {/* Redes sociales */}
              {artist.social_links && Object.values(artist.social_links).some(Boolean) && (
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Redes Sociales</p>
                  <div className="space-y-2">
                    {Object.entries(artist.social_links).map(([platform, url]) => {
                      if (!url) return null;
                      const cfg = SOCIAL_ICONS[platform];
                      const Icon = cfg?.icon || Globe;
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.05] transition-all group"
                        >
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
              {artist.bio && (
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Bio</p>
                  <p className="text-sm text-white/45 leading-relaxed">{artist.bio}</p>
                </div>
              )}

              {/* Notas internas — solo edición */}
              {isEditing && (
                <div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Notas Internas</p>
                  <textarea
                    value={editForm.notes || ""}
                    onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                    rows={4}
                    className={iCls + " resize-none"}
                    placeholder="Notas internas..."
                  />
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