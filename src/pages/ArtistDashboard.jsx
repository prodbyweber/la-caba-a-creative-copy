import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Film } from "lucide-react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ArtistProfileDrawer, { ArtistAvatarButton } from "@/components/dashboard/ArtistProfileDrawer";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import ClipsLibrary from "@/components/clips/ClipsLibrary";


export default function ArtistDashboard() {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [catalogMode, setCatalogMode] = useState("audio"); // "audio" | "video"
  const [currentUser, setCurrentUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId") || urlParams.get("id");

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
  }, []);

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
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.id === artistId);
    },
    enabled: !!artistId
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', artist?.user_id],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles.find(p => p.user_id === artist?.user_id) || null;
    },
    enabled: !!artist?.user_id
  });

  if (isLoading) {
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

  if (!artist) {
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={artist.stageName} artistId={artist.id}>
        <ArtistAvatarButton artist={artist} onClick={() => setShowProfileDrawer(true)} />
      </DashboardNav>

      <main className="pt-14">
        <div className="px-4 sm:px-8 lg:px-12 py-5 [&_.mobile-carousel]:!-mx-4">

          {/* Header — selector Audio/Video */}
          <div className="mb-5">
            {/* Selector Audio / Video — estilo cinematico minimalista */}
            <div className="flex items-center gap-0 border-b border-white/10 w-fit">
              <button
                onClick={() => setCatalogMode("audio")}
                className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200"
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
              <button
                onClick={() => setCatalogMode("video")}
                className="relative flex items-center gap-2 px-4 pb-2.5 pt-0.5 text-xs font-medium tracking-wide transition-colors duration-200"
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
            </div>
          </div>

          {/* ── MODO Audio ── */}
          <AnimatePresence mode="wait">
            {catalogMode === "audio" && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="space-y-4">
                  <ProjectsSection jlyArtistId={artist.id} />
                  <TracksSection jlyArtistId={artist.id} />
                </div>
              </motion.div>
            )}

            {/* ── MODO Video (Clips) ── */}
            {catalogMode === "video" && (
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
          </AnimatePresence>
        </div>
      </main>

      <ArtistProfileDrawer
        artist={artist}
        userProfile={userProfile}
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
}