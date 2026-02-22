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

      <main className="lg:pl-64 pt-14">
        <div className="px-3 py-2 max-w-full">
          {/* Header Compacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center justify-between"
          >
            <h1 className="text-xl font-bold">
              <span className="text-emerald-400">{artist.stageName}</span>
            </h1>
            <Link 
              to={createPageUrl("ArtistPanelList")} 
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver
            </Link>
          </motion.div>

          {/* Mobile Artist Profile (compact) */}
          <div className="lg:hidden mb-3">
            <ArtistProfileCard compact={true} />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-12 gap-3">
            {/* Left Column */}
            <div className="lg:col-span-9 space-y-3">
              <ProjectsSection jlyArtistId={artist.id} />
              <TracksSection jlyArtistId={artist.id} />
              <PerformanceOverview />
              <GrowthChart />
              <ClipActivityFeed />
            </div>

            {/* Right Column - Desktop only profile */}
            <div className="lg:col-span-3 space-y-3">
              <div className="hidden lg:block">
                <ArtistProfileCard />
              </div>
              <WalletCard />
              <UpcomingSessionsCard artistId={artist.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}