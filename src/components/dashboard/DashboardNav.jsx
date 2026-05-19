import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, BookOpen, Compass, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";


export default function DashboardNav({ artistName, artistId, children }) {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        setIsAdmin(currentUser?.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Fetch LandingConfig para saber si Analytics está habilitado
  const { data: landingConfig } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs[0];
    }
  });

  const analyticsEnabled = landingConfig?.sections_enabled?.analytics !== false;
  
  const menuItems = [
    { icon: BookOpen, label: "Catálogo", page: artistId ? `ArtistDashboard?artistId=${artistId}` : "Dashboard" },
    { icon: Compass, label: "Explorar", page: "Explorar" },
  ];

  const isActivePage = (page) => {
    const pageName = page.split('?')[0];
    return location.pathname.includes(pageName);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left */}
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
              <img 
                src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
                alt="La Cabaña Creative"
                className="h-12 w-auto"
              />
              <div className="hidden lg:flex items-start gap-0" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, flexDirection: 'column' }}>
                <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, color: '#ff5833', fontWeight: 900, fontSize: '1.1rem' }}>
                   Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.55rem', fontWeight: 400, lineHeight: 1, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
                 </span>
                <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>Creative</span>
              </div>
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
                          ? 'bg-transparent text-orange-400 border border-orange-500/40 hover:border-orange-500/60' 
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
            {/* Admin button only visible for admin users */}
            {isAdmin && (
              <Link to={createPageUrl("AdminDashboard")}>
                <button 
                 className="px-2.5 py-1.5 rounded-lg bg-transparent border border-orange-500/40 text-orange-400 hover:border-orange-500/60 transition-all flex items-center gap-1.5"
                 title="Panel Admin"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium hidden sm:inline">Admin</span>
                </button>
              </Link>
            )}
            {/* Avatar / profile slot — passed as children */}
            {children}
          </div>
      </div>
      </nav>


    </>
  );
}