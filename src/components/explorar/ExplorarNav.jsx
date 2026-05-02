import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User, Home, BookOpen, Compass } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExplorarNav({ currentUser, activeSection, setActiveSection, searchOpen, setSearchOpen, searchQuery, setSearchQuery, onProfileOpen, artistId }) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const catalogPage = currentUser
    ? (artistId ? `ArtistDashboard?artistId=${artistId}` : "ArtistDashboard")
    : "GuestCatalogPreview";

  const bottomNavItems = [
    { icon: Home,     label: "Inicio",      page: "Landing" },
    { icon: Compass,  label: "Explorar",    page: "Explorar" },
    { icon: BookOpen, label: "Tu catálogo", page: catalogPage, highlight: true },
  ];

  const isActiveNav = (page) => location.pathname.includes(page.split("?")[0]);

  const navLinks = [
    { label: "Inicio", key: "inicio" },
    { label: "Música", key: "musica" },
    { label: "Films", key: "films" },
  ];

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
      style={{
        background: scrolled
          ? "rgba(8,8,8,0.97)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.04)" : "none",
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to={createPageUrl("Landing")}>
            <img
              src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
              alt="Cabaña Creative"
              className="h-10 w-auto cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => setActiveSection(link.key)}
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: activeSection === link.key ? "#fff" : "rgba(255,255,255,0.55)" }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Avatar — abre panel de perfil */}
          <button
            onClick={onProfileOpen}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all flex items-center justify-center bg-white/5 hover:bg-white/10 flex-shrink-0"
            title={currentUser?.full_name || "Perfil"}
          >
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white/50" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile bottom nav — always visible */}
      {(
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          style={{
            background: "#0a0a0b",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0px)",
          }}
        >
          <div className="flex items-center justify-around px-2 pt-2 pb-3">
            {bottomNavItems.map((item) => {
              const active = isActiveNav(item.page);
              const Icon = item.icon;
              return (
                <Link key={item.label} to={createPageUrl(item.page)} className="flex-1">
                  <button className="flex flex-col items-center gap-1 w-full py-1">
                    <div className="relative">
                      {item.highlight && (
                        <div
                          className="absolute inset-0 rounded-full blur-md opacity-40"
                          style={{ background: "rgba(255,88,51,0.5)", transform: "scale(1.8)" }}
                        />
                      )}
                      <Icon
                        className="w-6 h-6 relative z-10 transition-colors"
                        style={{
                          color: active
                            ? item.highlight ? "#ff5833" : "white"
                            : "rgba(255,255,255,0.35)",
                        }}
                      />
                      {active && (
                        <motion.div
                          layoutId="explorarBottomNavDot"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: item.highlight ? "#ff5833" : "white" }}
                        />
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium transition-colors leading-tight"
                      style={{
                        color: active
                          ? item.highlight ? "#ff5833" : "white"
                          : "rgba(255,255,255,0.35)",
                        fontFamily: "'Helvetica Neue', sans-serif",
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}