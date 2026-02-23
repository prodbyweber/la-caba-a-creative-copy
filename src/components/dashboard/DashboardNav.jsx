import React from "react";
import { motion } from "framer-motion";
import { Bell, Search, Settings, Home, BarChart3, Film, Music2, FolderKanban, Share2, Calendar, Palette } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DashboardNav({ artistName, artistId }) {
  const location = useLocation();
  
  const menuItems = [
    { icon: BarChart3, label: "Análisis", page: artistId ? `Analytics?artistId=${artistId}` : "Analytics" },
    { icon: Film, label: "Clips", page: artistId ? `Clips?artistId=${artistId}` : "Clips" },
    { icon: Music2, label: "Tracks", page: artistId ? `ArtistTracks?artistId=${artistId}` : "Tracks" },
    { icon: FolderKanban, label: "Proyectos", page: artistId ? `ArtistProjects?artistId=${artistId}` : "Projects" },
    { icon: Share2, label: "Redes", page: artistId ? `SocialAccounts?artistId=${artistId}` : "SocialAccounts" },
    { icon: Calendar, label: "Calendario", page: artistId ? `Calendars?artistId=${artistId}` : "Calendars" },
    { icon: Palette, label: "ADN", page: artistId ? `ADNdeMarca?artistId=${artistId}` : "ADNdeMarca" },
  ];

  const isActivePage = (page) => {
    const pageName = page.split('?')[0];
    return location.pathname.includes(pageName);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6966ddf48947f217e81ea27c/2b10817bf_LOGOPNGTRANSPARENTCABANACREATIVE.png" 
              alt="La Cabaña Creative"
              className="h-8 w-auto"
            />
            <span className="text-base font-semibold tracking-tight hidden lg:block">
              La Cabaña <span className="text-orange-500">Creative</span>
            </span>
          </Link>
          
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, i) => {
              const Icon = item.icon;
              const active = isActivePage(item.page);
              return (
                <Link key={i} to={createPageUrl(item.page)}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      active 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("AdminDashboard")}>
            <button 
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
              title="Panel Admin"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="text-xs font-medium hidden sm:inline">Admin</span>
            </button>
          </Link>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all hidden sm:block">
            <Settings className="w-4 h-4" />
          </button>
          
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
            JV
          </div>
        </div>
      </div>
    </nav>
  );
}