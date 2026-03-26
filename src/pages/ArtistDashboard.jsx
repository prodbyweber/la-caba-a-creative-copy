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
import ArtistProfileEditor from "@/components/dashboard/ArtistProfileEditor";
import ProjectsSection from "@/components/dashboard/ProjectsSection";
import TracksSection from "@/components/dashboard/TracksSection";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";
import SocialLinksCard from "@/components/dashboard/SocialLinksCard";

export default function ArtistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
        <DashboardNav />
        <main className="pt-16 p-6">
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
          {/* Header Compacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex items-center justify-end"
          >
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
             <ArtistProfileCard 
               compact={true} 
               artist={artist} 
               onEditProfile={() => setIsEditingProfile(true)}
             />
           </div>

           {/* Main Grid */}
           <div className="grid lg:grid-cols-12 gap-3">
             {/* Left Column */}
             <div className="lg:col-span-9 space-y-3">
               <ProjectsSection jlyArtistId={artist.id} />
               <TracksSection jlyArtistId={artist.id} />
             </div>

             {/* Right Column - Desktop only profile */}
             <div className="lg:col-span-3 space-y-3">
               <div className="hidden lg:block">
                 <ArtistProfileCard 
                   artist={artist} 
                   onEditProfile={() => setIsEditingProfile(true)}
                 />
               </div>
               <UpcomingSessionsCard artistId={artist.id} />
               <SocialLinksCard />
             </div>
           </div>
           </div>
           </main>
           </div>

           {/* Profile Editor Modal */}
           <ArtistProfileEditor 
           artist={artist} 
           isOpen={isEditingProfile} 
           onClose={() => setIsEditingProfile(false)} 
           />
           </div>
           );
           }