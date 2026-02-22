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

      <main className="lg:pl-64 pt-14 px-2 pb-4 lg:px-3">
        <div className="max-w-[1600px] mx-auto">
          {/* Grid Principal Optimizado */}
          <div className="grid lg:grid-cols-12 gap-2 lg:gap-3">
            {/* Columna Izquierda - Avatar + Wallet + Stats */}
            <div className="lg:col-span-3 space-y-2">
              {/* Avatar Compacto Premium */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-b from-[#141414] to-black rounded-lg border border-white/5 overflow-hidden"
              >
                <div className="relative">
                  <div className="relative h-48 lg:h-56 overflow-hidden">
                    {artist.avatar_url ? (
                      <img 
                        src={artist.avatar_url}
                        alt={artist.stageName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <span className="text-5xl font-bold text-white/40">{artist.stageName[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>

                  <div className="relative px-2.5 pb-2.5 -mt-10 z-20">
                    <div className="bg-black/90 backdrop-blur-md rounded-lg p-2.5 border border-white/10">
                      <h3 className="text-base font-black text-white uppercase tracking-tight mb-0.5 truncate">
                        {artist.stageName}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 truncate block">{artist.genre || 'Artist'}</span>
                      <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <div className="text-gray-500">Status</div>
                          <div className="text-emerald-400 font-semibold truncate">{artist.status}</div>
                        </div>
                        {artist.location && (
                          <div className="text-right">
                            <div className="text-gray-500">Location</div>
                            <div className="text-white font-semibold truncate">{artist.location}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <UpcomingSessionsCard artistId={artist.id} />
              <WalletCard />
              <PerformanceOverview />
            </div>

            {/* Columna Central - Proyectos y Tracks (PROTAGONISTAS) */}
            <div className="lg:col-span-9 space-y-2 lg:space-y-3">
              <div className="flex items-center justify-end">
                <Link 
                  to={createPageUrl("ArtistPanelList")} 
                  className="text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden lg:inline">Volver</span>
                </Link>
              </div>
              <ProjectsSection jlyArtistId={artist.id} />
              <TracksSection jlyArtistId={artist.id} />
              <GrowthChart />
              <SocialMetricsCard artist={artist} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}