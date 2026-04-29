import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Film } from "lucide-react";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ArtistProfileCard from "@/components/dashboard/ArtistProfileCard";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import ClipsLibrary from "@/components/clips/ClipsLibrary";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [artistId, setArtistId] = useState(null);
  const [jlyArtistId, setJlyArtistId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  // All hooks must be called unconditionally before any early returns
  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
    enabled: !!user && user.role === 'admin',
  });

  // Obtener usuario actual y su artista
  useEffect(() => {
    const loadUserAndArtist = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (userData.role === 'admin') {
          return; // Admins permanecen en Dashboard general
        }

        // Para usuarios normales: verificar si ya completó el onboarding
        const profiles = await base44.entities.UserProfile.filter({ user_id: userData.id });
        if (profiles.length === 0) {
          // No tiene perfil → mostrar onboarding
          setShowOnboarding(true);
          return;
        }

        // Tiene perfil → crear/sincronizar artista (la función actualiza si ya existe)
        const response = await base44.functions.invoke('createArtistProfileForNewUser', {});
        if (response.data?.artistId) {
          setArtistId(response.data.artistId);
          navigate(`${createPageUrl('ArtistDashboard')}?artistId=${response.data.artistId}`);
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
      }
    };
    loadUserAndArtist();
  }, [navigate]);

  useEffect(() => {
    const jlyArtist = artists.find(artist => artist.stageName === "JLY");
    if (jlyArtist) {
      setJlyArtistId(jlyArtist.id);
    }
  }, [artists]);

  // Mostrar onboarding para usuarios sin perfil
  if (showOnboarding && user) {
    return (
      <OnboardingForm
        user={user}
        onComplete={async () => {
          setShowOnboarding(false);
          // Crear/sincronizar artista con datos del onboarding y redirigir
          const response = await base44.functions.invoke('createArtistProfileForNewUser', {});
          if (response.data?.artistId) {
            navigate(`${createPageUrl('ArtistDashboard')}?artistId=${response.data.artistId}`);
          }
        }}
      />
    );
  }

  // No mostrar nada mientras se verifica el usuario
  if (!user) {
    return null;
  }

  // Si es admin, mostrar dashboard general
  if (user.role !== 'admin') {
    return null; // Los usuarios normales serán redirigidos
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
              {/* Videos Section */}
              <div className="sm:bg-gradient-to-br sm:from-[#141414] sm:to-black sm:rounded-2xl sm:border sm:border-white/5" style={{ overflow: "visible" }}>
                <div className="px-0 sm:px-4 sm:py-3 sm:border-b sm:border-white/5 flex items-center justify-between mb-3 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
                      <Film className="w-4 h-4 text-white/40" />
                    </div>
                    <h3 className="text-base font-bold text-white">Clips & Video</h3>
                  </div>
                </div>
                <div className="sm:px-4 sm:pb-4" style={{ overflowX: "auto", overflowY: "visible", padding: "60px 16px 200px", margin: "-60px 0 -200px", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  <ClipsLibrary filters={{ status: "all", platform: [], artist: jlyArtistId || "all", dateRange: null, search: "" }} />
                </div>
              </div>
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