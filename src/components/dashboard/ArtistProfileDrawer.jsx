import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Youtube, Instagram, Music, Video, Plus, Check, User, Camera, ZoomIn, ZoomOut, Move, ChevronRight, ExternalLink, Trash2, Share2, Users, Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StudioHoursBlock from "@/components/dashboard/StudioHoursBlock";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import CountryCitySelector from "@/components/common/CountrycitySelector";
import PhotosGallery from "@/components/dashboard/PhotosGallery";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸" }, { code: "+34", flag: "🇪🇸" }, { code: "+52", flag: "🇲🇽" },
  { code: "+54", flag: "🇦🇷" }, { code: "+57", flag: "🇨🇴" }, { code: "+58", flag: "🇻🇪" },
  { code: "+51", flag: "🇵🇪" }, { code: "+56", flag: "🇨🇱" }, { code: "+593", flag: "🇪🇨" },
  { code: "+55", flag: "🇧🇷" }, { code: "+44", flag: "🇬🇧" }, { code: "+33", flag: "🇫🇷" },
  { code: "+49", flag: "🇩🇪" }, { code: "+39", flag: "🇮🇹" },
];

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Venezuela", "Perú", "Chile",
  "Ecuador", "Cuba", "Panamá", "Brasil", "Uruguay", "Bolivia", "Paraguay",
  "República Dominicana", "Puerto Rico", "Estados Unidos", "Canadá",
  "Reino Unido", "Francia", "Alemania", "Italia", "Portugal", "Otro"
];

const iClass = "w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.08] focus:outline-none focus:border-white/25 transition-colors placeholder-white/20";
const labelClass = "block text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-1.5";

const socialPlatforms = [
  { id: "youtube",   name: "YouTube",   icon: Youtube,   color: "#ff4444", bg: "rgba(255,68,68,0.08)" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#e879a0", bg: "rgba(232,121,160,0.08)" },
  { id: "spotify",   name: "Spotify",   icon: Music,     color: "#1db954", bg: "rgba(29,185,84,0.08)" },
  { id: "tiktok",    name: "TikTok",    icon: Video,     color: "#a855f7", bg: "rgba(168,85,247,0.08)" },
];

const COUNTRY_ISO = {
  "España": "es", "México": "mx", "Argentina": "ar", "Colombia": "co",
  "Venezuela": "ve", "Perú": "pe", "Chile": "cl", "Ecuador": "ec",
  "Cuba": "cu", "Panamá": "pa", "Brasil": "br", "Uruguay": "uy",
  "Bolivia": "bo", "Paraguay": "py", "República Dominicana": "do",
  "Puerto Rico": "pr", "Estados Unidos": "us", "Canadá": "ca",
  "Reino Unido": "gb", "Francia": "fr", "Alemania": "de", "Italia": "it", "Portugal": "pt",
};

// ── Avatar button for nav ──────────────────────────────────────────────────
export function ArtistAvatarButton({ artist, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden border border-white/15 hover:border-white/35 transition-all flex-shrink-0 flex items-center justify-center"
      style={{ background: "#1c1c1e" }}
      title={artist?.stageName || "Perfil"}
    >
      {artist?.avatar_url ? (
        <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover object-top" />
      ) : (
        <User className="w-4 h-4 text-white/30" />
      )}
    </button>
  );
}

// ── Photo crop modal ───────────────────────────────────────────────────────
function PhotoCropModal({ imageUrl, onSave, onClose }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const cropRef = useRef(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const startDrag = (clientX, clientY) => {
    dragging.current = true;
    lastMouse.current = { x: clientX, y: clientY };
  };

  const onMove = (clientX, clientY) => {
    if (!dragging.current || !cropRef.current) return;
    const rect = cropRef.current.getBoundingClientRect();
    const dx = ((clientX - lastMouse.current.x) / rect.width) * -100;
    const dy = ((clientY - lastMouse.current.y) / rect.height) * -100;
    lastMouse.current = { x: clientX, y: clientY };
    setPos(p => ({ x: clamp(p.x + dx, 0, 100), y: clamp(p.y + dy, 0, 100) }));
  };

  const stopDrag = () => { dragging.current = false; };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: "#111" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <p className="text-base font-bold text-white">Ajustar foto</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Preview circle — large */}
        <div className="flex justify-center px-6 pb-4">
          <div
            ref={cropRef}
            className="w-52 h-52 rounded-full overflow-hidden border-2 border-white/20 cursor-grab active:cursor-grabbing select-none shadow-2xl"
            style={{ background: "#1c1c1e" }}
            onMouseDown={e => startDrag(e.clientX, e.clientY)}
            onMouseMove={e => onMove(e.clientX, e.clientY)}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={stopDrag}
          >
            <img
              src={imageUrl}
              alt=""
              draggable={false}
              className="w-full h-full pointer-events-none"
              style={{
                objectFit: "cover",
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${scale})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
              }}
            />
          </div>
        </div>

        <p className="text-center text-[11px] text-white/25 flex items-center justify-center gap-1.5 mb-4">
          <Move className="w-3 h-3" /> Arrastra para encuadrar
        </p>

        {/* Zoom */}
        <div className="flex items-center gap-3 px-6 mb-6">
          <ZoomOut className="w-4 h-4 text-white/30 flex-shrink-0" />
          <input type="range" min={1} max={3} step={0.05} value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-white h-1 cursor-pointer" />
          <ZoomIn className="w-4 h-4 text-white/30 flex-shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave(`${pos.x}% ${pos.y}%`, scale)}
            className="flex-1 py-3 rounded-2xl bg-white text-black text-sm font-bold transition-colors hover:bg-white/90">
            Aplicar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Social link row ────────────────────────────────────────────────────────
function SocialRow({ platform, url, onEdit, onRemove }) {
  const { id, name, icon: Icon, color, bg } = platform;
  const hasUrl = !!url;
  return (
    <div
      className="flex items-center gap-3 px-3.5 py-3 rounded-2xl border transition-all"
      style={hasUrl
        ? { background: bg, borderColor: color + "30" }
        : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }
      }
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: hasUrl ? color + "15" : "rgba(255,255,255,0.04)" }}>
        <Icon className="w-4 h-4" style={{ color: hasUrl ? color : "rgba(255,255,255,0.2)" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${hasUrl ? "text-white/80" : "text-white/25"}`}>{name}</p>
        {hasUrl && <p className="text-[10px] text-white/30 truncate">{url.replace(/^https?:\/\/(www\.)?/, "")}</p>}
      </div>
      <div className="flex items-center gap-1">
        {hasUrl && (
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            onClick={e => e.stopPropagation()}>
            <ExternalLink className="w-3 h-3 text-white/25" />
          </a>
        )}
        <button
          onClick={hasUrl ? () => onRemove(id) : () => onEdit(id, url || "")}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          {hasUrl
            ? <Trash2 className="w-3 h-3 text-white/25 hover:text-red-400" />
            : <Plus className="w-3.5 h-3.5 text-white/25" />
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Drawer ────────────────────────────────────────────────────────────
export default function ArtistProfileDrawer({ artist, userProfile, targetUserId, isOpen, onClose }) {
  const [tab, setTab] = useState("profile"); // "profile" | "sessions"
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [socialLinks, setSocialLinks] = useState(artist?.social_links || {});
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [platformUrl, setPlatformUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState(null);

  const queryClient = useQueryClient();

  const updateArtistMutation = useMutation({
    mutationFn: (data) => artist?.id
      ? base44.entities.Artist.update(artist.id, data)
      : Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', artist?.id] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile?.id) {
        return base44.entities.UserProfile.update(userProfile.id, data);
      }
      // No existe perfil — crear uno nuevo
      const userId = targetUserId || artist?.user_id;
      if (!userId) return null;
      const me = await base44.auth.me();
      return base44.entities.UserProfile.create({
        ...data,
        user_id: userId,
        user_email: me?.email,
      });
    },
    onSuccess: () => {
      const uid = targetUserId || artist?.user_id || userProfile?.user_id;
      queryClient.invalidateQueries({ queryKey: ['userProfile', uid] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-me'] });
    },
  });

  const generateUsername = () => {
    const name = userProfile?.artist_name || userProfile?.display_name || artist?.stageName || userProfile?.first_name || "";
    return name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user_" + Math.random().toString(36).substr(2, 9);
  };

  const openEdit = () => {
    setFormData({
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
      artist_name: userProfile?.artist_name || artist?.stageName || "",
      username: userProfile?.username || generateUsername(),
      phone_country_code: userProfile?.phone_country_code || "+34",
      phone: userProfile?.phone || "",
      nationality: userProfile?.nationality || artist?.nationality || "",
      country_of_residence: userProfile?.country_of_residence || artist?.country_of_residence || "",
      address: userProfile?.address || "",
      avatar_url: artist?.avatar_url || userProfile?.profile_photo_url || userProfile?.avatar_url || "",
      photo_position: artist?.photo_position || userProfile?.photo_position || "50% 50%",
      photo_scale: artist?.photo_scale || 1,
    });
    setIsEditing(true);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPendingImageUrl(file_url);
      setShowCropModal(true);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCropSave = (position, scale) => {
    setFormData(f => ({ ...f, avatar_url: pendingImageUrl, photo_position: position, photo_scale: scale }));
    setShowCropModal(false);
    setPendingImageUrl(null);
  };

  const handleSave = async () => {
    const city = formData.address
      ? `${formData.address}, ${formData.country_of_residence}`
      : formData.country_of_residence;

    // Only update Artist entity if there's an actual artist record
    if (artist?.id) {
      await updateArtistMutation.mutateAsync({
        stageName: formData.artist_name || formData.first_name,
        legalName: `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone ? `${formData.phone_country_code} ${formData.phone}`.trim() : '',
        location: city,
        nationality: formData.nationality,
        country_of_residence: formData.country_of_residence,
        avatar_url: formData.avatar_url,
        photo_position: formData.photo_position,
        photo_scale: formData.photo_scale,
        social_links: socialLinks,
      });
    }

    if (userProfile?.id) {
      await updateProfileMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        artist_name: formData.artist_name,
        display_name: formData.artist_name || `${formData.first_name} ${formData.last_name}`.trim(),
        username: formData.username || generateUsername(),
        phone: formData.phone,
        phone_country_code: formData.phone_country_code,
        nationality: formData.nationality,
        country_of_residence: formData.country_of_residence,
        address: formData.address,
        profile_photo_url: formData.avatar_url,
        avatar_url: formData.avatar_url,
        photo_position: formData.photo_position,
      });
    }
    setIsEditing(false);
  };

  const handleSaveSocial = () => {
    const updated = { ...socialLinks, [editingPlatform]: platformUrl };
    setSocialLinks(updated);
    if (artist?.id) updateArtistMutation.mutate({ social_links: updated });
    if (userProfile?.id) updateProfileMutation.mutate({ social_links: updated });
    setEditingPlatform(null);
    setPlatformUrl("");
  };

  const handleRemoveSocial = (id) => {
    const updated = { ...socialLinks };
    delete updated[id];
    setSocialLinks(updated);
    if (artist?.id) updateArtistMutation.mutate({ social_links: updated });
    if (userProfile?.id) updateProfileMutation.mutate({ social_links: updated });
  };

  if (!userProfile && !artist) return null;

  const avatarUrl = artist?.avatar_url || userProfile?.avatar_url || userProfile?.profile_photo_url;
  const photoPosition = artist?.photo_position || userProfile?.photo_position || "center center";
  const photoScale = artist?.photo_scale || 1;
  const displayName = artist?.stageName || userProfile?.artist_name || userProfile?.display_name || "—";
  const nationality = artist?.nationality || userProfile?.nationality;
  const residence = artist?.country_of_residence || userProfile?.country_of_residence;

  const TABS = [
    { id: "profile", label: "Perfil" },
    { id: "social",  label: "Redes" },
    ...(artist?.id ? [{ id: "sessions", label: "Sesiones" }] : []),
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
              style={{ width: "min(360px, 100vw)", background: "#0d0d0e", borderLeft: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* ── HERO SECTION ── */}
              <div className="relative flex-shrink-0" style={{ height: 160 }}>
                {/* Background blur of avatar */}
                {avatarUrl && (
                  <div className="absolute inset-0 overflow-hidden">
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover scale-110 blur-xl opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0d0d0e]" />
                  </div>
                )}
                {!avatarUrl && <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-[#0d0d0e]" />}

                {/* Close button */}
                <button onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-black/60 transition-colors z-10">
                  <X className="w-4 h-4 text-white/60" />
                </button>

                {/* Avatar + upload */}
                <div className="absolute bottom-0 left-5 transform translate-y-1/2 z-10">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 shadow-xl flex items-center justify-center"
                      style={{ borderColor: "rgba(255,255,255,0.15)", background: "#1c1c1e" }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"
                          style={{ objectPosition: photoPosition, transform: `scale(${photoScale})`, transformOrigin: photoPosition }} />
                      ) : (
                        <User className="w-8 h-8 text-white/20" />
                      )}
                    </div>

                    {/* Upload overlay */}
                    <label className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                        disabled={uploadingPhoto} />
                      {uploadingPhoto
                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Camera className="w-5 h-5 text-white" />
                      }
                    </label>

                    {/* Adjust crop button — shown when avatar exists */}
                    {avatarUrl && !isEditing && (
                      <button
                        onClick={() => { setPendingImageUrl(avatarUrl); setShowCropModal(true); }}
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-white/15 flex items-center justify-center transition-colors"
                        style={{ background: "#1c1c1e" }}
                        title="Ajustar encuadre"
                      >
                        <Move className="w-3 h-3 text-white/40" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── NAME ROW (offset to leave room for avatar) ── */}
              <div className="px-5 pt-14 pb-4 flex items-start justify-between flex-shrink-0">
                <div className="flex-1">
                   <p className="text-white font-bold text-lg leading-tight">{displayName}</p>
                   {userProfile?.username && (
                     <p className="text-[11px] text-white/50 mt-1 font-medium">@{userProfile.username}</p>
                   )}
                   <div className="flex items-center gap-1.5 mt-2">
                     {nationality && COUNTRY_ISO[nationality] && (
                       <img src={`https://flagcdn.com/w20/${COUNTRY_ISO[nationality]}.png`} alt={nationality}
                         className="w-4 h-3 rounded-sm object-cover opacity-70" />
                     )}
                     {residence && COUNTRY_ISO[residence] && residence !== nationality && (
                       <img src={`https://flagcdn.com/w20/${COUNTRY_ISO[residence]}.png`} alt={residence}
                         className="w-4 h-3 rounded-sm object-cover opacity-70" />
                     )}
                     {nationality && <span className="text-white/30 text-xs">{nationality}</span>}
                   </div>
                 </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={openEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-white/40 hover:text-white text-xs font-medium transition-all">
                    <Edit2 className="w-3.5 h-3.5" /> Editar
                  </button>
                 </div>
              </div>

              {/* ── TABS ── */}
              <div className="flex border-b border-white/[0.06] px-5 flex-shrink-0">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`relative px-3 pb-3 pt-1 text-xs font-semibold transition-colors mr-1 ${tab === t.id ? "text-white" : "text-white/30 hover:text-white/60"}`}>
                    {t.label}
                    {tab === t.id && (
                      <motion.div layoutId="drawerTabLine"
                        className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>

              {/* ── SCROLLABLE CONTENT ── */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

                {/* ── TAB: PERFIL ── */}
                {tab === "profile" && (
                  <div className="px-5 py-5">
                    {!isEditing ? (
                      <div className="space-y-4">
                        {/* Info cards */}
                        {(userProfile?.phone || artist?.phone) && (
                          <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <span className="text-white/30 text-xs">📞</span>
                            <span className="text-white/60 text-sm">{userProfile?.phone || artist?.phone}</span>
                          </div>
                        )}
                        {(residence || nationality) && (
                          <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <span className="text-white/30 text-xs">📍</span>
                            <span className="text-white/60 text-sm">{userProfile?.address ? `${userProfile.address}, ` : ""}{residence || nationality}</span>
                          </div>
                        )}
                        {/* Empty state */}
                        {!userProfile?.phone && !artist?.phone && !residence && !nationality && (
                          <div className="text-center py-8">
                            <p className="text-white/25 text-sm">Completa tu perfil</p>
                            <button onClick={openEdit}
                              className="mt-3 text-xs text-white/40 hover:text-white underline underline-offset-2 transition-colors">
                              Añadir información →
                            </button>
                          </div>
                        )}

                        {/* Perfil público */}
                        {userProfile?.username && (
                          <a
                            href={`https://cabanacreative.es/${userProfile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl border border-orange-500/25 bg-orange-500/[0.07] hover:bg-orange-500/[0.12] hover:border-orange-500/50 transition-all group"
                          >
                            {/* Avatar real de la cuenta */}
                            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-orange-500/40 flex-shrink-0 flex items-center justify-center"
                              style={{ background: "#1c1c1e" }}>
                              {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover"
                                  style={{ objectPosition: photoPosition }} />
                              ) : (
                                <User className="w-4 h-4 text-orange-400/60" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-orange-400 group-hover:text-orange-300 transition-colors truncate">{displayName}</span>
                                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex-shrink-0">
                                  ✓ Verified
                                </span>
                              </div>
                              <p className="text-[10px] text-white/30 truncate">cabanacreative.es/{userProfile.username}</p>
                            </div>
                            <svg className="w-3.5 h-3.5 text-orange-500/40 group-hover:text-orange-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        )}

                        {/* Photos Gallery */}
                        {userProfile?.id && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                                <Image className="w-3.5 h-3.5 text-white/40" />
                              </div>
                              <p className="text-xs font-semibold text-white/70">Fotos</p>
                            </div>
                            <PhotosGallery userProfileId={userProfile.id} />
                          </div>
                        )}

                        {/* Cerrar sesión */}
                        <button
                          onClick={() => base44.auth.logout("/")}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-white/25 hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.05] hover:border-red-500/20 transition-all mt-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Cerrar sesión
                        </button>
                      </div>
                    ) : (
                      /* ── EDIT FORM ── */
                      <div className="space-y-4">
                        <p className="text-[11px] font-semibold text-white/25 uppercase tracking-widest">Editar perfil</p>

                        {/* Avatar actions */}
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10"
                            style={{ background: "#1c1c1e" }}>
                            {formData?.avatar_url ? (
                              <img src={formData.avatar_url} alt="" className="w-full h-full object-cover"
                                style={{ objectPosition: formData.photo_position || "center", transform: `scale(${formData.photo_scale || 1})`, transformOrigin: formData.photo_position || "center" }} />
                            ) : (
                              <User className="w-6 h-6 text-white/20" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors">
                              <input type="file" accept="image/*" className="hidden"
                                onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                                disabled={uploadingPhoto} />
                              <Camera className="w-3.5 h-3.5 text-white/40" />
                              <span className="text-xs text-white/50 font-medium">
                                {uploadingPhoto ? "Subiendo..." : formData?.avatar_url ? "Cambiar foto" : "Subir foto"}
                              </span>
                            </label>
                            {formData?.avatar_url && (
                              <button
                                onClick={() => { setPendingImageUrl(formData.avatar_url); setShowCropModal(true); }}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/8 transition-colors">
                                <Move className="w-3.5 h-3.5 text-white/30" />
                                <span className="text-xs text-white/40">Ajustar encuadre</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Nombre + Apellido */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>Nombre</label>
                            <input value={formData?.first_name || ""} onChange={e => setFormData(f => ({ ...f, first_name: e.target.value }))}
                              className={iClass} placeholder="Nombre" />
                          </div>
                          <div>
                            <label className={labelClass}>Apellido</label>
                            <input value={formData?.last_name || ""} onChange={e => setFormData(f => ({ ...f, last_name: e.target.value }))}
                              className={iClass} placeholder="Apellido" />
                          </div>
                        </div>

                        {/* Nombre artístico */}
                        <div>
                          <label className={labelClass}>Nombre artístico</label>
                          <input value={formData?.artist_name || ""} onChange={e => setFormData(f => ({ ...f, artist_name: e.target.value }))}
                            className={iClass} placeholder="Alias artístico" />
                        </div>

                        {/* Username */}
                        <div>
                          <label className={labelClass}>Username (URL pública)</label>
                          <input value={formData?.username || ""} onChange={e => setFormData(f => ({ ...f, username: e.target.value }))}
                            className={iClass} placeholder="tu_nombre" maxLength={30} />
                          <p className="text-[10px] text-white/20 mt-1">cabanacreative.es/{formData?.username || "tu_nombre"}</p>
                        </div>

                        {/* Teléfono */}
                        <div>
                          <label className={labelClass}>Teléfono</label>
                          <div className="flex gap-2">
                            <select value={formData?.phone_country_code || "+34"} onChange={e => setFormData(f => ({ ...f, phone_country_code: e.target.value }))}
                              className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-white text-sm focus:outline-none" style={{ minWidth: 76 }}>
                              {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} className="bg-[#111]">{c.flag} {c.code}</option>)}
                            </select>
                            <input value={formData?.phone || ""} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                              className={iClass} placeholder="Número" type="tel" />
                          </div>
                        </div>

                        {/* Nacionalidad */}
                        <div>
                          <label className={labelClass}>Nacionalidad</label>
                          <select value={formData?.nationality || ""} onChange={e => setFormData(f => ({ ...f, nationality: e.target.value }))} className={iClass}>
                            <option value="" className="bg-[#111]">Selecciona un país</option>
                            {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                          </select>
                        </div>

                        {/* País de residencia */}
                        <div>
                          <label className={labelClass}>País de residencia</label>
                          <select value={formData?.country_of_residence || ""} onChange={e => setFormData(f => ({ ...f, country_of_residence: e.target.value }))} className={iClass}>
                            <option value="" className="bg-[#111]">Selecciona un país</option>
                            {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                          </select>
                        </div>

                        {/* Ciudad */}
                        <div>
                          <label className={labelClass}>Ciudad</label>
                          <input value={formData?.address || ""} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))}
                            className={iClass} placeholder="Ciudad" />
                        </div>

                        {/* Save / Cancel */}
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => setIsEditing(false)}
                            className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/10 text-white/50 text-sm font-semibold transition-colors">
                            Cancelar
                          </button>
                          <button onClick={handleSave} disabled={updateArtistMutation.isPending || updateProfileMutation.isPending}
                            className="flex-1 py-3 rounded-2xl bg-white text-black text-sm font-bold transition-colors hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2">
                            {(updateArtistMutation.isPending || updateProfileMutation.isPending)
                              ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                              : <><Check className="w-4 h-4" /> Guardar</>
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}



                {/* ── TAB: REDES ── */}
                {tab === "social" && (
                  <div className="px-5 py-6 space-y-2">
                    {socialPlatforms.map(platform => {
                      const { id, name, icon: Icon, color } = platform;
                      const url = socialLinks[id];
                      const hasUrl = !!url;
                      if (editingPlatform === id) return (
                        <div key={id} className="p-4 rounded-2xl border border-white/10 space-y-3" style={{ background: "#161616" }}>
                          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color }}>{name}</p>
                          <input type="url" autoFocus value={platformUrl} onChange={e => setPlatformUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-3 py-2.5 rounded-xl text-sm text-white bg-white/[0.06] border border-white/[0.08] focus:outline-none focus:border-white/20 placeholder-white/20" />
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingPlatform(null); setPlatformUrl(""); }}
                              className="flex-1 py-2 rounded-xl bg-white/5 text-xs text-white/40 font-medium">Cancelar</button>
                            <button onClick={handleSaveSocial} disabled={!platformUrl}
                              className="flex-1 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
                              style={{ background: color + "22", color }}>Guardar</button>
                          </div>
                        </div>
                      );
                      return (
                        <div key={id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all"
                          style={hasUrl ? { background: color + "0a", borderColor: color + "25" } : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: hasUrl ? color : "rgba(255,255,255,0.18)" }} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${hasUrl ? "text-white/75" : "text-white/20"}`}>{name}</p>
                            {hasUrl && <p className="text-[10px] text-white/25 truncate mt-0.5">{url.replace(/^https?:\/\/(www\.)?/, "")}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            {hasUrl && (
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors"
                                onClick={e => e.stopPropagation()}>
                                <ExternalLink className="w-3 h-3 text-white/20" />
                              </a>
                            )}
                            <button onClick={hasUrl ? () => handleRemoveSocial(id) : () => { setEditingPlatform(id); setPlatformUrl(""); }}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/8 transition-colors">
                              {hasUrl
                                ? <Trash2 className="w-3 h-3 text-white/20 hover:text-red-400/70" />
                                : <Plus className="w-3.5 h-3.5 text-white/20" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── TAB: SESIONES ── */}
                {tab === "sessions" && artist?.id && (
                  <div className="px-5 py-5">
                    <UpcomingSessionsCard artistId={artist.id} />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Crop modal — rendered outside drawer */}
      <AnimatePresence>
        {showCropModal && pendingImageUrl && (
          <PhotoCropModal
            imageUrl={pendingImageUrl}
            onSave={handleCropSave}
            onClose={() => { setShowCropModal(false); setPendingImageUrl(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}