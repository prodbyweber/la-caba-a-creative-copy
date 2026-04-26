import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Youtube, Instagram, Music, Video, Plus, Check, User, Camera, ZoomIn, ZoomOut, Move } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StudioHoursBlock from "@/components/dashboard/StudioHoursBlock";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";

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

const iClass = "w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/8 focus:outline-none focus:border-white/20 transition-colors";

const socialPlatforms = [
  { id: "youtube",   name: "YouTube",   icon: Youtube,   textColor: "text-red-400",   borderColor: "border-red-500/30",   bg: "from-red-500/15 to-red-600/15" },
  { id: "instagram", name: "Instagram", icon: Instagram, textColor: "text-pink-400",  borderColor: "border-pink-500/30",  bg: "from-pink-500/15 to-purple-600/15" },
  { id: "spotify",   name: "Spotify",   icon: Music,     textColor: "text-green-400", borderColor: "border-green-500/30", bg: "from-green-500/15 to-green-600/15" },
  { id: "tiktok",    name: "TikTok",    icon: Video,     textColor: "text-purple-400",borderColor: "border-purple-500/30",bg: "from-purple-500/15 to-purple-600/15" },
];

// Mapa de banderas por país
const COUNTRY_FLAGS = {
  "España": "🇪🇸", "México": "🇲🇽", "Argentina": "🇦🇷", "Colombia": "🇨🇴",
  "Venezuela": "🇻🇪", "Perú": "🇵🇪", "Chile": "🇨🇱", "Ecuador": "🇪🇨",
  "Cuba": "🇨🇺", "Panamá": "🇵🇦", "El Salvador": "🇸🇻", "Guatemala": "🇬🇹",
  "Honduras": "🇭🇳", "Nicaragua": "🇳🇮", "Costa Rica": "🇨🇷", "Brasil": "🇧🇷",
  "Uruguay": "🇺🇾", "Bolivia": "🇧🇴", "Paraguay": "🇵🇾",
  "República Dominicana": "🇩🇴", "Puerto Rico": "🇵🇷",
  "Estados Unidos": "🇺🇸", "Canadá": "🇨🇦",
  "Reino Unido": "🇬🇧", "Francia": "🇫🇷", "Alemania": "🇩🇪",
  "Italia": "🇮🇹", "Portugal": "🇵🇹",
};

function CountryBadge({ country, label }) {
  const flag = COUNTRY_FLAGS[country];
  if (!country) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
      {flag && <span className="text-base leading-none">{flag}</span>}
      <div>
        {label && <p className="text-[9px] text-white/25 uppercase tracking-widest leading-none mb-0.5">{label}</p>}
        <p className="text-xs text-white/70 font-medium leading-none">{country}</p>
      </div>
    </div>
  );
}

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
        <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover object-top" />
      ) : (
        <User className="w-4 h-4 text-white/30" />
      )}
    </button>
  );
}

// Drawer lateral completo con perfil + redes + edición
export default function ArtistProfileDrawer({ artist, userProfile, isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [socialLinks, setSocialLinks] = useState(artist?.social_links || {});
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [platformUrl, setPlatformUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPos, setPhotoPos] = useState({ x: 50, y: 50 });
  const [photoScale, setPhotoScale] = useState(1);
  const cropRef = useRef(null);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const queryClient = useQueryClient();

  const updateArtistMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', artist?.id] });
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', artist?.user_id] });
    },
  });

  const parsePhotoPos = (posStr) => {
    if (!posStr) return { x: 50, y: 50 };
    const parts = posStr.split(" ");
    return {
      x: parseFloat(parts[0]) || 50,
      y: parseFloat(parts[1]) || 50,
    };
  };

  const handleEditOpen = () => {
    const pos = parsePhotoPos(artist?.photo_position);
    setPhotoPos(pos);
    setPhotoScale(artist?.photo_scale || 1);
    setFormData({
      // Datos personales del UserProfile
      first_name: userProfile?.first_name || "",
      last_name: userProfile?.last_name || "",
      artist_name: userProfile?.artist_name || artist?.stageName || "",
      gender: userProfile?.gender || "",
      phone_country_code: userProfile?.phone_country_code || "+34",
      phone: userProfile?.phone || "",
      nationality: userProfile?.nationality || artist?.nationality || "",
      country_of_residence: userProfile?.country_of_residence || artist?.country_of_residence || "",
      address: userProfile?.address || "",
      // Datos del artista
      genre: artist?.genre || "",
      bio: artist?.bio || "",
      avatar_url: artist?.avatar_url || userProfile?.profile_photo_url || "",
    });
    setIsEditing(true);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(f => ({ ...f, avatar_url: file_url }));
      setPhotoPos({ x: 50, y: 50 });
      setPhotoScale(1);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const startDrag = (clientX, clientY) => {
    dragging.current = true;
    lastMouse.current = { x: clientX, y: clientY };
  };

  const onDragMove = (clientX, clientY) => {
    if (!dragging.current || !cropRef.current) return;
    const rect = cropRef.current.getBoundingClientRect();
    const dx = ((clientX - lastMouse.current.x) / rect.width) * -100;
    const dy = ((clientY - lastMouse.current.y) / rect.height) * -100;
    lastMouse.current = { x: clientX, y: clientY };
    setPhotoPos(p => ({
      x: clamp(p.x + dx, 0, 100),
      y: clamp(p.y + dy, 0, 100),
    }));
  };

  const stopDrag = () => { dragging.current = false; };

  const handleSaveProfile = async () => {
    const city = formData.address
      ? `${formData.address}, ${formData.country_of_residence}`
      : formData.country_of_residence;

    const photoPosition = `${photoPos.x}% ${photoPos.y}%`;

    // Actualizar artista
    await updateArtistMutation.mutateAsync({
      stageName: formData.artist_name || formData.first_name,
      legalName: `${formData.first_name} ${formData.last_name}`.trim(),
      genre: formData.genre,
      bio: formData.bio,
      phone: formData.phone ? `${formData.phone_country_code} ${formData.phone}`.trim() : '',
      location: city,
      nationality: formData.nationality,
      country_of_residence: formData.country_of_residence,
      avatar_url: formData.avatar_url,
      photo_position: photoPosition,
      photo_scale: photoScale,
      social_links: socialLinks,
    });

    // Actualizar UserProfile si existe
    if (userProfile?.id) {
      await updateProfileMutation.mutateAsync({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        artist_name: formData.artist_name,
        gender: formData.gender,
        phone: formData.phone,
        phone_country_code: formData.phone_country_code,
        nationality: formData.nationality,
        country_of_residence: formData.country_of_residence,
        address: formData.address,
        profile_photo_url: formData.avatar_url,
      });
    }

    setIsEditing(false);
  };

  const handleSaveSocial = () => {
    const updated = { ...socialLinks, [editingPlatform]: platformUrl };
    setSocialLinks(updated);
    updateArtistMutation.mutate({ social_links: updated });
    setEditingPlatform(null);
    setPlatformUrl("");
  };

  const handleRemoveSocial = (id) => {
    const updated = { ...socialLinks };
    delete updated[id];
    setSocialLinks(updated);
    updateArtistMutation.mutate({ social_links: updated });
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
                    <img
                      src={artist.avatar_url}
                      alt={artist.stageName}
                      draggable={false}
                      className="w-full h-full"
                      style={{
                        objectFit: "cover",
                        objectPosition: artist.photo_position || "center center",
                        transform: `scale(${artist.photo_scale || 1})`,
                        transformOrigin: artist.photo_position || "center center",
                      }}
                    />
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

                      {/* Foto + editor de recorte */}
                      <div className="flex flex-col items-center gap-2">
                        {/* Preview circular con drag */}
                        <div className="relative">
                          <div
                            ref={cropRef}
                            className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 cursor-grab active:cursor-grabbing select-none"
                            style={{ background: "#1c1c1e" }}
                            onMouseDown={e => startDrag(e.clientX, e.clientY)}
                            onMouseMove={e => onDragMove(e.clientX, e.clientY)}
                            onMouseUp={stopDrag}
                            onMouseLeave={stopDrag}
                            onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
                            onTouchMove={e => { e.preventDefault(); onDragMove(e.touches[0].clientX, e.touches[0].clientY); }}
                            onTouchEnd={stopDrag}
                          >
                            {formData.avatar_url ? (
                              <img
                                src={formData.avatar_url}
                                alt=""
                                draggable={false}
                                className="w-full h-full pointer-events-none"
                                style={{
                                  objectFit: "cover",
                                  objectPosition: `${photoPos.x}% ${photoPos.y}%`,
                                  transform: `scale(${photoScale})`,
                                  transformOrigin: `${photoPos.x}% ${photoPos.y}%`,
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white/20" />
                              </div>
                            )}
                          </div>
                          {uploadingPhoto && (
                            <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Hint drag */}
                        {formData.avatar_url && (
                          <p className="text-[10px] text-white/25 flex items-center gap-1">
                            <Move className="w-3 h-3" /> Arrastra para encuadrar
                          </p>
                        )}

                        {/* Zoom slider */}
                        {formData.avatar_url && (
                          <div className="flex items-center gap-2 w-full px-2">
                            <ZoomOut className="w-3 h-3 text-white/30 flex-shrink-0" />
                            <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.05}
                              value={photoScale}
                              onChange={e => setPhotoScale(parseFloat(e.target.value))}
                              className="flex-1 accent-white h-1 cursor-pointer"
                            />
                            <ZoomIn className="w-3 h-3 text-white/30 flex-shrink-0" />
                          </div>
                        )}

                        {/* Botón cambiar foto */}
                        <label className="cursor-pointer text-[10px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">
                          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                          {uploadingPhoto ? "Subiendo..." : formData.avatar_url ? "Cambiar foto" : "Subir foto"}
                        </label>
                      </div>

                      {/* Nombre y apellido */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-white/30 mb-1">Nombre</label>
                          <input value={formData.first_name} onChange={e => setFormData(f => ({ ...f, first_name: e.target.value }))} className={iClass} placeholder="Nombre" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-white/30 mb-1">Apellido</label>
                          <input value={formData.last_name} onChange={e => setFormData(f => ({ ...f, last_name: e.target.value }))} className={iClass} placeholder="Apellido" />
                        </div>
                      </div>

                      {/* Nombre artístico */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Nombre artístico</label>
                        <input value={formData.artist_name} onChange={e => setFormData(f => ({ ...f, artist_name: e.target.value }))} className={iClass} placeholder="Alias artístico" />
                      </div>

                      {/* Género musical */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Género musical</label>
                        <input value={formData.genre} onChange={e => setFormData(f => ({ ...f, genre: e.target.value }))} className={iClass} placeholder="Ej: Urban, Reggaeton..." />
                      </div>

                      {/* Género personal */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Género</label>
                        <div className="grid grid-cols-3 gap-1">
                          {[{ key: "male", label: "Masc." }, { key: "female", label: "Fem." }, { key: "prefer_not_to_say", label: "N/D" }].map(({ key, label }) => (
                            <button key={key} onClick={() => setFormData(f => ({ ...f, gender: key }))}
                              className={`py-1.5 rounded-lg border text-[10px] font-medium transition-all ${formData.gender === key ? "border-white/40 bg-white/10 text-white" : "border-white/8 bg-white/3 text-white/30 hover:border-white/20"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Teléfono</label>
                        <div className="flex gap-1.5">
                          <select value={formData.phone_country_code} onChange={e => setFormData(f => ({ ...f, phone_country_code: e.target.value }))}
                            className="bg-white/5 border border-white/8 rounded-lg px-2 py-2 text-white text-xs focus:outline-none" style={{ minWidth: 72 }}>
                            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code} className="bg-[#111]">{c.flag} {c.code}</option>)}
                          </select>
                          <input value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className={iClass} placeholder="Número" type="tel" />
                        </div>
                      </div>

                      {/* Nacionalidad */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Nacionalidad</label>
                        <select value={formData.nationality} onChange={e => setFormData(f => ({ ...f, nationality: e.target.value }))} className={iClass}>
                          <option value="" className="bg-[#111]">Selecciona un país</option>
                          {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                        </select>
                      </div>

                      {/* País de residencia */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">País de residencia</label>
                        <select value={formData.country_of_residence} onChange={e => setFormData(f => ({ ...f, country_of_residence: e.target.value }))} className={iClass}>
                          <option value="" className="bg-[#111]">Selecciona un país</option>
                          {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                        </select>
                      </div>

                      {/* Ciudad */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Ciudad</label>
                        <input value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className={iClass} placeholder="Ciudad" />
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-[10px] text-white/30 mb-1">Bio</label>
                        <textarea value={formData.bio} onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))} rows={3}
                          className="w-full px-3 py-2 rounded-lg text-xs text-white bg-white/5 border border-white/8 focus:outline-none focus:border-white/20 transition-colors resize-none" />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 font-medium transition-colors">
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={updateArtistMutation.isPending}
                          className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {updateArtistMutation.isPending ? "..." : "Guardar"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Países — nacionalidad y residencia */}
              {(artist.nationality || artist.country_of_residence) && !isEditing && (
                <div className="flex flex-col gap-2">
                  {artist.nationality && (
                    <CountryBadge country={artist.nationality} label="Nacionalidad" />
                  )}
                  {artist.country_of_residence && artist.country_of_residence !== artist.nationality && (
                    <CountryBadge country={artist.country_of_residence} label="Residencia" />
                  )}
                </div>
              )}

              {/* Bio */}
              {artist.bio && !isEditing && (
                <p className="text-xs text-white/30 leading-relaxed">{artist.bio}</p>
              )}

              {/* Horas de estudio + Próximas sesiones */}
              <div className="space-y-3">
                <StudioHoursBlock artist={artist} />
                <UpcomingSessionsCard artistId={artist.id} />
              </div>

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