import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Music2, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ArtistProfileCard from "@/components/dashboard/ArtistProfileCard";
import ArtistProfileEditor from "@/components/dashboard/ArtistProfileEditor";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import SocialLinksCard from "@/components/dashboard/SocialLinksCard";
import StudioHoursBlock from "@/components/dashboard/StudioHoursBlock";
import ClipsLibrary from "@/components/clips/ClipsLibrary";


export default function ArtistDashboard() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [catalogMode, setCatalogMode] = useState("audio"); // "audio" | "video"


  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId") || urlParams.get("id");

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
      <DashboardNav artistName={artist.stageName} artistId={artist.id} />

      <main className="pt-14">
        <div className="px-6 sm:px-12 lg:px-16 xl:px-24 py-6 max-w-[1600px] mx-auto">

          {/* Header con volver + selector Audio/Video */}
          <div className="mb-5 flex items-center gap-4">
            <Link
              to={createPageUrl("ArtistPanelList")}
              className="text-xs text-white/30 hover:text-white/70 transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver
            </Link>

            {/* Selector Audio / Video — estilo cinematico minimalista */}
            <div className="flex items-center gap-0 border-b border-white/10">
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

          {/* Mobile Artist Profile */}
          <div className="lg:hidden mb-3">
            <ArtistProfileCard
              compact={true}
              artist={artist}
              onEditProfile={() => setIsEditingProfile(true)}
            />
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
                <div className="grid lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-9 space-y-3">
                    <ProjectsSection jlyArtistId={artist.id} />
                    <TracksSection jlyArtistId={artist.id} />
                  </div>
                  <div className="lg:col-span-3 space-y-3">
                    <div className="hidden lg:block">
                      <ArtistProfileCard
                        artist={artist}
                        onEditProfile={() => setIsEditingProfile(true)}
                      />
                    </div>
                    <StudioHoursBlock artist={artist} />
                    <UpcomingSessionsCard artistId={artist.id} />
                    <SocialLinksCard />
                  </div>
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

      <ArtistProfileEditor
        artist={artist}
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
      />
    </div>
  );
}