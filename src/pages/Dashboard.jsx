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
      // NO redirigir automáticamente al AdminDashboard
      // El admin puede estar viendo el dashboard de un artista
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
      <DashboardNav artistId={jlyArtistId} />

      <main className="pt-14">
        <div className="px-4 py-3 max-w-[1920px] mx-auto">
          {/* Mobile Artist Profile (compact) */}
          <div className="lg:hidden mb-3">
            <ArtistProfileCard compact={true} />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-12 gap-3">
            {/* Left Column */}
            <div className="lg:col-span-9 space-y-3">
              <ProjectsSection jlyArtistId={jlyArtistId} />
              <TracksSection jlyArtistId={jlyArtistId} />
            </div>

            {/* Right Column - Desktop only profile */}
            <div className="lg:col-span-3 space-y-3">
              <div className="hidden lg:block">
                <ArtistProfileCard />
              </div>
              <UpcomingSessionsCard artistId={jlyArtistId} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}