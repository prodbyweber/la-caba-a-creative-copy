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
import SocialMetricsCard from "@/components/dashboard/SocialMetricsCard";

export default function ArtistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId") || urlParams.get("id");

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
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} artistName={artist.stageName} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-14 px-3 pb-6 lg:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Compacto */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-3">
              {artist.avatar_url ? (
                <img 
                  src={artist.avatar_url}
                  alt={artist.stageName}
                  className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center border border-emerald-500/30">
                  <span className="text-lg font-bold text-white">{artist.stageName[0]}</span>
                </div>
              )}
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-white">{artist.stageName}</h1>
                <p className="text-xs text-gray-500">{artist.genre || 'Artist'} • {artist.location || 'Location'}</p>
              </div>
            </div>
            <Link 
              to={createPageUrl("ArtistPanelList")} 
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden lg:inline">Volver</span>
            </Link>
          </motion.div>

          {/* Grid Principal Compacto */}
          <div className="grid lg:grid-cols-12 gap-3 lg:gap-4">
            {/* Columna Izquierda - Wallet y Stats */}
            <div className="lg:col-span-3 space-y-3 lg:space-y-4">
              <WalletCard />
              <PerformanceOverview />
              <UpcomingSessionsCard artistId={artist.id} />
            </div>

            {/* Columna Central - Proyectos y Tracks (PRIORIDAD) */}
            <div className="lg:col-span-9 space-y-3 lg:space-y-4">
              <ProjectsSection jlyArtistId={artist.id} />
              <TracksSection jlyArtistId={artist.id} />
              <SocialMetricsCard artist={artist} />
              <GrowthChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}