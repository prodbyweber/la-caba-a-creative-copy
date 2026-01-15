import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ArtistProfileCard from "@/components/dashboard/ArtistProfileCard";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import GrowthChart from "@/components/dashboard/GrowthChart";
import ClipActivityFeed from "@/components/dashboard/ClipActivityFeed";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import WalletCard from "@/components/dashboard/WalletCard";

export default function ArtistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("id");

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
        <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="lg:pl-64 pt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/5 rounded w-1/3" />
              <div className="h-64 bg-white/5 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="lg:pl-64 pt-16 p-6">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-gray-500">Artista no encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link 
            to={createPageUrl("AdminDashboard")} 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Admin Panel
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Dashboard de {artist.stageName}</h1>
            <p className="text-gray-500">Vista completa del artista</p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Artist Profile Card with custom data */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-b from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
              >
                <div className="relative">
                  <div className="relative h-[450px] sm:h-[500px] overflow-visible pt-8">
                    {artist.avatar_url ? (
                      <img 
                        src={artist.avatar_url}
                        alt={artist.stageName}
                        className="w-full h-full object-contain object-top scale-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <span className="text-6xl font-bold text-white/40">{artist.stageName[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="relative px-6 pb-6 z-20">
                    <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
                      <div className="space-y-2 bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                              {artist.stageName}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-400">{artist.genre || 'Artist'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <UpcomingSessionsCard artistId={artist.id} />
              <WalletCard />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-8 space-y-6">
              <PerformanceOverview />
              <ProjectsSection jlyArtistId={artist.id} />
              <TracksSection jlyArtistId={artist.id} />
              <GrowthChart />
              <ClipActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}