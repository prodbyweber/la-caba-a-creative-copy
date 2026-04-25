import React, { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, Home, BarChart3, BookOpen, Music2, FolderKanban, Share2, Calendar, Palette, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";


export default function DashboardNav({ artistName, artistId }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  
  const menuItems = [
    { icon: BookOpen, label: "Catálogo", page: artistId ? `ArtistDashboard?artistId=${artistId}` : "Dashboard" },
    { icon: BarChart3, label: "Análisis", page: artistId ? `Analytics?artistId=${artistId}` : "Analytics" },
    { icon: FolderKanban, label: "Proyectos", page: artistId ? `ArtistProjects?artistId=${artistId}` : "Projects" },
    { icon: Calendar, label: "Calendario", page: artistId ? `Calendars?artistId=${artistId}` : "Calendars" },
    { icon: Palette, label: "ADN", page: artistId ? `ADNdeMarca?artistId=${artistId}` : "ADNdeMarca" },
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
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

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
          {/* Admin button only visible for admin users */}
          {isAdmin && (
            <Link to={createPageUrl("AdminDashboard")}>
              <button 
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
                title="Panel Admin"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">Admin</span>
              </button>
            </Link>
          )}


        </div>
      </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0a0a0b] border-r border-white/5 z-50 md:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img 
                    src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
                    alt="La Cabaña Creative"
                    className="h-10 w-auto"
                  />
                  <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, color: '#ff5833', fontWeight: 900, fontSize: '1rem' }}>
                      Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.5rem', fontWeight: 400, lineHeight: 1, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
                    </span>
                    <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, color: 'white', fontWeight: 900, fontSize: '1rem' }}>Creative</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <div className="space-y-1">
                  {menuItems.map((item, i) => {
                    const Icon = item.icon;
                    const active = isActivePage(item.page);
                    return (
                      <Link key={i} to={createPageUrl(item.page)}>
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            active 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      </Link>
                    );
                  })}
                </div>

                {/* Admin Button - solo para admins */}
                {isAdmin && (
                  <>
                    <div className="my-4 border-t border-white/5" />
                    <Link to={createPageUrl("AdminDashboard")}>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-medium"
                      >
                        <Home className="w-5 h-5" />
                        Panel Admin
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}