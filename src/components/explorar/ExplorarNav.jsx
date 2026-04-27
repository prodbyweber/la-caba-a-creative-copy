import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExplorarNav({ currentUser, activeSection, setActiveSection, searchOpen, setSearchOpen, searchQuery, setSearchQuery }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Inicio", key: "home" },
    { label: "Artistas", key: "artists" },
    { label: "Films", key: "films" },
    { label: "Explorar", key: "explore" },
  ];

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
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

          {/* Back to Dashboard */}
          <Link to={createPageUrl("ArtistPanelList")}>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all">
              Dashboard
            </button>
          </Link>

          {/* Avatar — icono minimalista */}
          <button
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            title={currentUser?.full_name || "Perfil"}
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </nav>
  );
}