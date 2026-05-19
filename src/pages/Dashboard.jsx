import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { GripVertical } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import ArtistProfileDrawer, { ArtistAvatarButton } from "@/components/dashboard/ArtistProfileDrawer";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import PhotosGallery from "@/components/dashboard/PhotosGallery";
import CatalogSectionOrder, { DEFAULT_SECTION_ORDER } from "@/components/dashboard/CatalogSectionOrder";
import OnboardingForm from "@/components/onboarding/OnboardingForm";

function SectionLabel({ label }) {
  return (
    <p
      className="text-[10px] font-bold uppercase mb-3"
      style={{
        fontFamily: "'Helvetica Neue', sans-serif",
        letterSpacing: "0.28em",
        color: "rgba(255,255,255,0.2)",
      }}
    >
      {label}
    </p>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [jlyArtistId, setJlyArtistId] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const navigate = useNavigate();

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobileView = windowWidth < 768;

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list(),
    enabled: !!user && user.role === 'admin',
  });

  useEffect(() => {
    const loadUserAndArtist = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (userData.role === 'admin') return;

        const profiles = await base44.entities.UserProfile.filter({ user_id: userData.id });
        if (profiles.length === 0) {
          setShowOnboarding(true);
          return;
        }

        const response = await base44.functions.invoke('createArtistProfileForNewUser', {});
        if (response.data?.artistId) {
          navigate(`${createPageUrl('ArtistDashboard')}?artistId=${response.data.artistId}`);
        }
      } catch (err) {
        console.error('Error al obtener usuario:', err);
      }
    };
    loadUserAndArtist();
  }, [navigate]);

  useEffect(() => {
    const jlyArtist = artists.find(a => a.stageName === "JLY");
    if (jlyArtist) setJlyArtistId(jlyArtist.id);
  }, [artists]);

  const { data: jlyArtist } = useQuery({
    queryKey: ["jly-artist-obj", jlyArtistId],
    queryFn: async () => {
      if (!jlyArtistId) return null;
      const results = await base44.entities.Artist.filter({ id: jlyArtistId });
      return results[0] || null;
    },
    enabled: !!jlyArtistId,
  });

  const { data: jlyUserProfile } = useQuery({
    queryKey: ["jly-userProfile", jlyArtist?.user_id],
    queryFn: async () => {
      if (!jlyArtist?.user_id) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: jlyArtist.user_id });
      return profiles[0] || null;
    },
    enabled: !!jlyArtist?.user_id,
  });

  const storageKey = `catalog_order_admin_${user?.id || "default"}`;
  const [sectionOrder, setSectionOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_SECTION_ORDER;
    } catch {
      return DEFAULT_SECTION_ORDER;
    }
  });

  const handleOrderChange = (newOrder) => {
    setSectionOrder(newOrder);
    try { localStorage.setItem(storageKey, JSON.stringify(newOrder)); } catch {}
  };

  if (showOnboarding && user) {
    return (
      <OnboardingForm
        user={user}
        onComplete={async () => {
          setShowOnboarding(false);
          const response = await base44.functions.invoke('createArtistProfileForNewUser', {});
          if (response.data?.artistId) {
            navigate(`${createPageUrl('ArtistDashboard')}?artistId=${response.data.artistId}`);
          }
        }}
      />
    );
  }

  if (!user) return null;
  if (user.role !== 'admin') return null;

  const displayName = jlyArtist?.stageName || user?.full_name || "Dashboard";

  const renderSection = (key) => {
    switch (key) {
      case "tracks":
        return (
          <div key="tracks">
            <SectionLabel label="Soundtracks" />
            <TracksSection jlyArtistId={jlyArtistId} />
          </div>
        );
      case "projects":
        return (
          <div key="projects">
            <SectionLabel label="Proyectos" />
            <ProjectsSection jlyArtistId={jlyArtistId} />
          </div>
        );
      case "photos":
        return (
          <div key="photos">
            <SectionLabel label="Fotos" />
            <PhotosGallery userProfileId={jlyUserProfile?.id} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={displayName} artistId={jlyArtistId}>
        <ArtistAvatarButton
          artist={jlyArtist || { stageName: displayName, avatar_url: null }}
          onClick={() => setShowProfileDrawer(true)}
        />
      </DashboardNav>

      <MobileBottomNav artistId={jlyArtistId} isAdmin={true} />

      <main className="pt-14 pb-32">
        <div className="px-4 sm:px-8 lg:px-12">
          <div className="mt-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1
                  className="font-black text-white"
                  style={{
                    fontFamily: "'Helvetica Neue', sans-serif",
                    letterSpacing: "-0.04em",
                    fontSize: isMobileView ? "1.5rem" : "2rem",
                  }}
                >
                  Tu catálogo
                </h1>
                <p className="text-[11px] text-white/25 mt-0.5">Todo el contenido en un solo lugar</p>
              </div>

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowOrderMenu(v => !v)}
                  className="flex items-center gap-1.5 rounded-xl border transition-all"
                  style={{
                    padding: isMobileView ? "9px 12px" : "8px 14px",
                    fontSize: isMobileView ? "12px" : "11px",
                    fontFamily: "'Helvetica Neue', sans-serif",
                    fontWeight: 600,
                    background: showOrderMenu ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                    borderColor: showOrderMenu ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                    color: showOrderMenu ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                  }}
                >
                  <GripVertical style={{ width: isMobileView ? 15 : 13, height: isMobileView ? 15 : 13 }} />
                  Ordenar
                </button>
                <AnimatePresence>
                  {showOrderMenu && (
                    <CatalogSectionOrder
                      order={sectionOrder}
                      onChange={handleOrderChange}
                      onClose={() => setShowOrderMenu(false)}
                      isMobile={isMobileView}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sectionOrder.map(key => renderSection(key))}
            </div>
          </div>
        </div>
      </main>

      <ArtistProfileDrawer
        artist={jlyArtist}
        userProfile={jlyUserProfile}
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
}