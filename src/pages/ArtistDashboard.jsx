import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Film, Image, Zap, Eye, SlidersHorizontal } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ArtistProfileDrawer, { ArtistAvatarButton } from "@/components/dashboard/ArtistProfileDrawer";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import ClipsLibrary from "@/components/clips/ClipsLibrary";
import BrandCampaignsSection from "@/components/dashboard/BrandCampaignsSection";
import PhotosGallery from "@/components/dashboard/PhotosGallery";


export default function ArtistDashboard() {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [catalogMode, setCatalogMode] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const artistIdParam = urlParams.get("artistId") || urlParams.get("id");

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

  // Si no hay artistId en URL, buscar artista vinculado al usuario actual
  const { data: selfArtist } = useQuery({
    queryKey: ['self-artist', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const artists = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return artists[0] || null;
    },
    enabled: !!currentUser?.id && !artistIdParam,
  });

  const artistId = artistIdParam || selfArtist?.id;

  const clipsFilters = {
    status: "all",
    platform: [],
    artist: artistId || "all",
    dateRange: null,
    search: ""
  };

  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      if (!artistId) return null;
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.id === artistId) || null;
    },
    enabled: !!artistId,
  });

  // UserProfile: buscar por user_id del artista, o por el usuario actual
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', artist?.user_id || currentUser?.id],
    queryFn: async () => {
      const uid = artist?.user_id || currentUser?.id;
      if (!uid) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: uid });
      return profiles[0] || null;
    },
    enabled: !!(artist?.user_id || currentUser?.id),
  });

  // Determinar qué secciones mostrar según el tipo de cuenta
  // Si está en modo preview, usar el tipo de vista seleccionado; si no, usar el real
  const accountType = viewMode || userProfile?.account_type || "artist";
  
  const showAudioSection = accountType === "artist";
  const showVideoSection = accountType === "artist" || accountType === "creator" || accountType === "brand";
  const showPhotosSection = accountType === "artist" || accountType === "creator";
  const showProjectsSection = accountType === "artist" || accountType === "creator" || accountType === "brand";
  const showCampaignsSection = accountType === "brand";
  const showCreativeAdsSection = accountType === "brand";
  
  // Asignar catalogMode inicial basado en el tipo de cuenta
  useEffect(() => {
    if (!catalogMode && userProfile) {
      if (accountType === "artist") setCatalogMode("audio");
      else if (accountType === "creator") setCatalogMode("video");
      else if (accountType === "brand") setCatalogMode("campaigns");
    }
  }, [userProfile, accountType, catalogMode]);

  // Mostrar loading mientras resolvemos artista
  const resolving = !artistIdParam && !selfArtist && !currentUser;
  if (isLoading || resolving) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <DashboardNav />
        <main className="pt-16 p-6">
          <div className="max-w-7xl mx-auto animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded w-1/3" />
            <div className="h-64 bg-white/5 rounded" />
          </div>
        </main>
      </div>
    );
  }

  // Si aún no hay artista pero sí hay usuario, mostramos el dashboard igual (para admin sin artista vinculado)
  // Solo mostramos "no encontrado" si se pasó artistId explícito y no existe
  if (!artist && artistIdParam) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <DashboardNav />
        <main className="pt-16 p-6">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-gray-500">Artista no encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  // Artista efectivo — puede ser null para admin sin artista vinculado
  const effectiveArtist = artist || null;
  const displayName = effectiveArtist?.stageName || userProfile?.artist_name || userProfile?.display_name || currentUser?.full_name || "Dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={displayName} artistId={effectiveArtist?.id}>
        <ArtistAvatarButton artist={effectiveArtist || { stageName: displayName, avatar_url: userProfile?.profile_photo_url || userProfile?.avatar_url }} onClick={() => setShowProfileDrawer(true)} />
      </DashboardNav>

      <main className="pt-14">
        <div className="px-4 sm:px-8 lg:px-12 py-5 [&_.mobile-carousel]:!-mx-4">
          {/* Admin: vista previa compacta — no ocupa espacio de contenido */}
          {currentUser?.role === "admin" && (
            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-1.5 py-1">
                <SlidersHorizontal className="w-3 h-3 text-white/25 mr-1" />
                {[{label: "Real", value: null}, {label: "Artista", value: "artist"}, {label: "Creador", value: "creator"}, {label: "Marca", value: "brand"}].map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={() => setViewMode(opt.value)}
                    className={`text-[10px] px-2 py-0.5 rounded-md transition-all ${
                      viewMode === opt.value
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Header — selector dinámico según tipo de cuenta */}
           <div className="mb-5">
             {/* Selector dinámico — estilo cinematico minimalista */}
             <div className="flex items-center gap-0 border-b border-white/10 w-fit overflow-x-auto">
               {showAudioSection && (
                 <button
                   onClick={() => setCatalogMode("audio")}
                   className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200 flex-shrink-0"
                   style={{ color: catalogMode === "audio" ? "#fff" : "rgba(255,255,255,0.3)" }}
                 >
                   <Music2 className="w-3.5 h-3.5" />
                   <span style={{ letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', sans-serif" }}>Audio</span>
                   {catalogMode === "audio" && (
                     <motion.div
                       layoutId="catalogUnderline"
                       className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                 </button>
               )}
               {showVideoSection && (
                 <button
                   onClick={() => setCatalogMode("video")}
                   className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200 flex-shrink-0"
                   style={{ color: catalogMode === "video" ? "#fff" : "rgba(255,255,255,0.3)" }}
                 >
                   <Film className="w-3.5 h-3.5" />
                   <span style={{ letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', sans-serif" }}>Video</span>
                   {catalogMode === "video" && (
                     <motion.div
                       layoutId="catalogUnderline"
                       className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                 </button>
               )}
               {showPhotosSection && (
                 <button
                   onClick={() => setCatalogMode("photos")}
                   className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200 flex-shrink-0"
                   style={{ color: catalogMode === "photos" ? "#fff" : "rgba(255,255,255,0.3)" }}
                 >
                   <Image className="w-3.5 h-3.5" />
                   <span style={{ letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', sans-serif" }}>Fotos</span>
                   {catalogMode === "photos" && (
                     <motion.div
                       layoutId="catalogUnderline"
                       className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                 </button>
               )}
               {showCampaignsSection && (
                 <button
                   onClick={() => setCatalogMode("campaigns")}
                   className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200 flex-shrink-0"
                   style={{ color: catalogMode === "campaigns" ? "#fff" : "rgba(255,255,255,0.3)" }}
                 >
                   <Zap className="w-3.5 h-3.5" />
                   <span style={{ letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', sans-serif" }}>Campañas</span>
                   {catalogMode === "campaigns" && (
                     <motion.div
                       layoutId="catalogUnderline"
                       className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                 </button>
               )}
               {showCreativeAdsSection && (
                 <button
                   onClick={() => setCatalogMode("creative-ads")}
                   className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200 flex-shrink-0"
                   style={{ color: catalogMode === "creative-ads" ? "#fff" : "rgba(255,255,255,0.3)" }}
                 >
                   <Image className="w-3.5 h-3.5" />
                   <span style={{ letterSpacing: "0.08em", fontFamily: "'Helvetica Neue', sans-serif" }}>Creative Ads</span>
                   {catalogMode === "creative-ads" && (
                     <motion.div
                       layoutId="catalogUnderline"
                       className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white"
                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
                     />
                   )}
                 </button>
               )}
             </div>
           </div>

          {/* ── CONTENIDO DINÁMICO POR TIPO DE CUENTA ── */}
          <AnimatePresence mode="wait">
            {/* ARTISTA: Audio + Video */}
            {showAudioSection && catalogMode === "audio" && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-4">
                  <ProjectsSection jlyArtistId={effectiveArtist?.id} />
                  <TracksSection jlyArtistId={effectiveArtist?.id} />
                </div>
              </motion.div>
            )}

            {showVideoSection && catalogMode === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <ClipsLibrary filters={clipsFilters} />
              </motion.div>
            )}

            {/* CREADOR: Fotos */}
            {showPhotosSection && catalogMode === "photos" && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <PhotosGallery userProfileId={userProfile?.id} />
              </motion.div>
            )}

            {/* MARCA: Campañas activas */}
            {showCampaignsSection && catalogMode === "campaigns" && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-6">
                  <BrandCampaignsSection userProfileId={userProfile?.id} />
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Proyectos y contenido</h3>
                    <ProjectsSection jlyArtistId={effectiveArtist?.id} />
                  </div>
                </div>
              </motion.div>
            )}

            {showCreativeAdsSection && catalogMode === "creative-ads" && (
              <motion.div
                key="creative-ads"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="text-center py-16">
                  <Image className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm">Creative Ads — proximamente</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <ArtistProfileDrawer
        artist={effectiveArtist}
        userProfile={userProfile}
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
}