import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { ensureUserSetupComplete } from "@/lib/ensureUserProvisioned";
import ArtistProfileDrawer, { ArtistAvatarButton } from "@/components/dashboard/ArtistProfileDrawer";
import ProjectsSection from "@/components/dashboard/ProjectsSection.jsx";
import TracksSection from "@/components/dashboard/TracksSection";
import ShortsSection from "@/components/dashboard/ShortsSection";
import BrandCampaignsSection from "@/components/dashboard/BrandCampaignsSection";
import PhotosGallery from "@/components/dashboard/PhotosGallery";
import FilmsSection from "@/components/dashboard/FilmsSection";
import CatalogSectionOrder, { DEFAULT_SECTION_ORDER } from "@/components/dashboard/CatalogSectionOrder";

export default function ArtistDashboard() {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState(null);
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const [settingUpArtist, setSettingUpArtist] = useState(false);
  const [autoProvisionDone, setAutoProvisionDone] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const artistIdParam = urlParams.get("artistId") || urlParams.get("id");
  const userIdParam = urlParams.get("userId");
  const hasExternalParam = !!artistIdParam || !!userIdParam;

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);  



  // When viewing by userId (admin viewing a user catalog without artistId)
  const { data: artistByUserId } = useQuery({
    queryKey: ["artist-by-user", userIdParam],
    queryFn: async () => {
      const artists = await base44.entities.Artist.filter({ user_id: userIdParam });
      return artists[0] || null;
    },
    enabled: !!userIdParam,
  });

  const { data: selfArtist } = useQuery({
    queryKey: ["self-artist", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const artists = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return artists[0] || null;
    },
    enabled: !!currentUser?.id && !hasExternalParam,
  });

  const artistId = artistIdParam || artistByUserId?.id || (!hasExternalParam ? selfArtist?.id : undefined);
  const isAdmin = currentUser?.role === 'admin';

  // Auto-healing: cuando selfArtist === null (query completó, no encontró nada) provisionarlo
  useEffect(() => {
    if (!currentUser || hasExternalParam || autoProvisionDone) return;
    if (selfArtist !== null) return; // undefined = loading, null = no encontrado
    setAutoProvisionDone(true);
    ensureUserSetupComplete(currentUser, {
      onArtistCreated: () => {
        queryClient.invalidateQueries({ queryKey: ['self-artist', currentUser.id] });
        queryClient.invalidateQueries({ queryKey: ['userProfile', currentUser.id] });
      }
    });
  }, [currentUser, selfArtist, hasExternalParam, autoProvisionDone]);

  const handleSetupArtist = async () => {
    if (!userProfile && !userIdParam) return;
    setSettingUpArtist(true);
    const name = userProfile?.artist_name || userProfile?.display_name || userProfile?.full_name || 'Artista';
    await base44.entities.Artist.create({
      stageName: name,
      user_id: userIdParam || userProfile?.user_id,
      email: userProfile?.user_email || '',
      status: 'Active',
      avatar_url: userProfile?.avatar_url || userProfile?.profile_photo_url || '',
    });
    queryClient.invalidateQueries({ queryKey: ['artist-by-user', userIdParam] });
    queryClient.invalidateQueries({ queryKey: ['self-artist', currentUser?.id] });
    setSettingUpArtist(false);
  };

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      if (!artistId) return null;
      const results = await base44.entities.Artist.filter({ id: artistId });
      return results[0] || null;
    },
    enabled: !!artistId,
  });

  const profileUserId = userIdParam || artist?.user_id || currentUser?.id;

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: profileUserId });
      return profiles[0] || null;
    },
    enabled: !!profileUserId,
  });

  // Email del dueño del catálogo (después de resolver userProfile)
  const catalogOwnerEmail = userIdParam
    ? (userProfile?.user_email || userProfile?.created_by)
    : currentUser?.email;

  const accountType = viewMode || userProfile?.account_type || "artist";
  React.useEffect(() => {
    if (userProfile?.account_type && !viewMode) setViewMode(userProfile.account_type);
  }, [userProfile?.account_type]);

  const showAudioSection = accountType === "artist";
  const showVideoSection = true;
  const showProjectsSection = true;
  const showShortsSection = true;
  const showCampaignsSection = accountType === "brand";

  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobileView = windowWidth < 768;

  const storageKey = `catalog_order_${currentUser?.id || "default"}`;
  const [sectionOrder, setSectionOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_SECTION_ORDER;
    } catch {
      return DEFAULT_SECTION_ORDER;
    }
  });

  const handleOrderChange = (newOrder) => {
    setSectionOrder(newOrder);
    try { localStorage.setItem(storageKey, JSON.stringify(newOrder)); } catch {}
  };

  // Solo mostrar loading si realmente estamos resolviendo (currentUser ya cargó pero selfArtist aún no)
  const resolving =
    (!!currentUser && !hasExternalParam && selfArtist === undefined) ||
    (!!userIdParam && artistByUserId === undefined);
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


  const effectiveArtist = artist || null;
  const displayName =
    effectiveArtist?.stageName ||
    userProfile?.artist_name ||
    userProfile?.display_name ||
    userProfile?.full_name ||
    currentUser?.full_name ||
    "Mi catálogo";

  // Render a catalog section by key
  const renderSection = (key) => {
    switch (key) {
      case "tracks":
        if (!showAudioSection) return null;
        return (
          <div key="tracks">
            <SectionLabel label="Soundtracks" />
            <TracksSection jlyArtistId={effectiveArtist?.id || artistId} userEmail={catalogOwnerEmail} />
          </div>
        );
      case "video":
        if (!showVideoSection) return null;
        return (
          <div key="video">
            <SectionLabel label="Films" />
            <FilmsSection artistId={effectiveArtist?.id || artistId} userProfileId={userProfile?.id} userEmail={catalogOwnerEmail} />
          </div>
        );
      case "shorts":
        if (!showShortsSection) return null;
        return (
          <div key="shorts">
            <SectionLabel label="Shorts" />
            <ShortsSection
              artistId={effectiveArtist?.id || artistId}
              userProfileId={userProfile?.id}
              userEmail={catalogOwnerEmail}
            />
          </div>
        );
      case "projects":
        if (!showProjectsSection) return null;
        return (
          <div key="projects">
            <SectionLabel label="Proyectos" />
            <ProjectsSection jlyArtistId={effectiveArtist?.id} userEmail={catalogOwnerEmail} />
          </div>
        );
      case "photos":
        return null; // Movido al panel de cuenta
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={displayName} artistId={effectiveArtist?.id}>
        <ArtistAvatarButton
          artist={effectiveArtist || { stageName: displayName, avatar_url: userProfile?.profile_photo_url || userProfile?.avatar_url || "" }}
          onClick={() => setShowProfileDrawer(true)}
        />
      </DashboardNav>

      <MobileBottomNav artistId={effectiveArtist?.id} isAdmin={false} />

      <main className="pt-14 pb-32">
        <div className="px-4 sm:px-8 lg:px-12">

          {/* ── CATÁLOGO ── */}
          <div className="mt-4">
              {/* Header row */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1
                    className="font-black text-white"
                    style={{
                      fontFamily: "'Helvetica Neue', sans-serif",
                      letterSpacing: "-0.04em",
                      fontSize: isMobileView ? "1.5rem" : "2rem",
                    }}
                  >
                    Tu catálogo
                  </h1>
                </div>

                {/* Reorder button */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setShowOrderMenu(v => !v)}
                    className="flex items-center gap-1.5 rounded-xl border transition-all"
                    style={{
                      padding: isMobileView ? "9px 12px" : "8px 14px",
                      fontSize: isMobileView ? "12px" : "11px",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      fontWeight: 600,
                      background: showOrderMenu ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                      borderColor: showOrderMenu ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                      color: showOrderMenu ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    <GripVertical style={{ width: isMobileView ? 15 : 13, height: isMobileView ? 15 : 13 }} />
                    Ordenar
                  </button>
                  <AnimatePresence>
                    {showOrderMenu && (
                      <CatalogSectionOrder
                        order={sectionOrder}
                        onChange={handleOrderChange}
                        onClose={() => setShowOrderMenu(false)}
                        isMobile={isMobileView}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sections stacked in user order */}
              <div className="space-y-6">
                {sectionOrder.map(key => renderSection(key))}
                {showCampaignsSection && (
                  <div key="campaigns">
                    <SectionLabel label="Campañas" />
                    <BrandCampaignsSection userProfileId={userProfile?.id} />
                  </div>
                )}
              </div>
            </div>


        </div>
      </main>

      {(effectiveArtist || userProfile || profileUserId) && (
        <ArtistProfileDrawer
          artist={effectiveArtist}
          userProfile={userProfile}
          targetUserId={profileUserId}
          isOpen={showProfileDrawer}
          onClose={() => setShowProfileDrawer(false)}
        />
      )}
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <p
      className="text-base font-bold mb-1 text-white"
      style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </p>
  );
}