import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ArtistProfileCard from "@/components/dashboard/ArtistProfileCard";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import GrowthChart from "@/components/dashboard/GrowthChart";
import ClipActivityFeed from "@/components/dashboard/ClipActivityFeed";
import WalletCard from "@/components/dashboard/WalletCard";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jlyArtistId, setJlyArtistId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Obtener usuario actual
  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      // Si es admin, redirigir al AdminDashboard
      if (userData.role === 'admin') {
        navigate(createPageUrl('AdminDashboard'));
      }
    }).catch(err => {
      console.error('Error al obtener usuario:', err);
    });
  }, [navigate]);

  // Obtener el artista JLY de la base de datos
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  useEffect(() => {
    const jlyArtist = artists.find(artist => artist.stageName === "JLY");
    if (jlyArtist) {
      setJlyArtistId(jlyArtist.id);
    }
  }, [artists]);

  // No mostrar nada mientras se verifica el usuario
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Bienvenido de nuevo, <span className="text-emerald-400">JLY</span></h1>
            <p className="text-gray-500">Esto es lo que está pasando con tu música hoy.</p>
          </motion.div>

          {/* Mobile Artist Profile (compact) */}
          <div className="lg:hidden mb-6">
            <ArtistProfileCard compact={true} />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ProjectsSection jlyArtistId={jlyArtistId} />
              <TracksSection jlyArtistId={jlyArtistId} />
              <PerformanceOverview />
              <GrowthChart />
              <ClipActivityFeed />
            </div>

            {/* Right Column - Desktop only profile */}
            <div className="space-y-6">
              <div className="hidden lg:block">
                <ArtistProfileCard />
              </div>
              <WalletCard />
              <UpcomingSessionsCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}