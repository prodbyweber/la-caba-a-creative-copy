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
import ClipsCalendar from "@/components/clips/ClipsCalendar";
import ClipsHeader from "@/components/clips/ClipsHeader";
import { LayoutGrid, Calendar } from "lucide-react";

export default function ArtistDashboard() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [catalogMode, setCatalogMode] = useState("audio"); // "audio" | "video"
  const [clipsTab, setClipsTab] = useState("library");

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId") || urlParams.get("id");

  const [clipsFilters, setClipsFilters] = useState({
    status: "all",
    platform: [],
    artist: artistId || "all",
    dateRange: null,
    search: ""
  });

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
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={createPageUrl("ArtistPanelList")}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver
            </Link>

            {/* Selector Audio / Video animado */}
            <div className="relative flex items-center bg-[#1a1a1c] border border-white/10 rounded-full p-1 gap-0">
              {/* Pill animado */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`absolute top-1 bottom-1 rounded-full ${
                  catalogMode === "audio"
                    ? "bg-purple-600 left-1 right-[calc(50%+2px)]"
                    : "bg-orange-500 left-[calc(50%+2px)] right-1"
                }`}
              />

              <button
                onClick={() => setCatalogMode("audio")}
                className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                  catalogMode === "audio" ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Music2 className="w-3.5 h-3.5" />
                Audio
              </button>

              <button
                onClick={() => setCatalogMode("video")}
                className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                  catalogMode === "video" ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                Video
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

          {/* ── MODO AUDIO ── */}
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

            {/* ── MODO VIDEO (Clips) ── */}
            {catalogMode === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Tabs dentro del panel de clips */}
                <div className="flex items-center gap-1 mb-4 border-b border-white/5">
                  <button
                    onClick={() => setClipsTab("library")}
                    className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition-all relative ${
                      clipsTab === "library" ? "text-orange-400" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Biblioteca
                    {clipsTab === "library" && (
                      <motion.div layoutId="clipsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setClipsTab("calendar")}
                    className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition-all relative ${
                      clipsTab === "calendar" ? "text-orange-400" : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Calendario
                    {clipsTab === "calendar" && (
                      <motion.div layoutId="clipsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400" />
                    )}
                  </button>
                </div>

                <ClipsHeader
                  filters={clipsFilters}
                  setFilters={setClipsFilters}
                  activeTab={clipsTab}
                  artistId={artistId}
                />

                <motion.div
                  key={clipsTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {clipsTab === "library" ? (
                    <ClipsLibrary filters={clipsFilters} />
                  ) : (
                    <ClipsCalendar filters={clipsFilters} />
                  )}
                </motion.div>
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