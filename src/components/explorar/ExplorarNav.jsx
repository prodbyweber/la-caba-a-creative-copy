import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Home, BookOpen, Compass, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ExplorarNav({ currentUser, activeSection, setActiveSection, searchOpen, setSearchOpen, searchQuery, setSearchQuery, onProfileOpen, artistId, onParaTiOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const guestMenuRef = useRef(null);
  const location = useLocation();

  // Close guest menu when clicking outside
  useEffect(() => {
    if (!guestMenuOpen) return;
    const handler = (e) => { if (guestMenuRef.current && !guestMenuRef.current.contains(e.target)) setGuestMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [guestMenuOpen]);

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
    { icon: Sparkles, label: "Para Ti",     page: null, action: onParaTiOpen },
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
          {/* Para Ti button — solo desktop */}
          <button
            onClick={onParaTiOpen}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white text-xs font-semibold tracking-wide"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            Para Ti
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Avatar — abre panel de perfil o menú guest */}
          <div className="relative" ref={guestMenuRef}>
            <button
              onClick={() => currentUser ? onProfileOpen() : setGuestMenuOpen(v => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-all flex items-center justify-center bg-white/5 hover:bg-white/10 flex-shrink-0"
              title={currentUser?.full_name || "Iniciar sesión"}
            >
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white/50" strokeWidth={1.5} />
              )}
            </button>

            {/* Guest login/register dropdown */}
            <AnimatePresence>
              {!currentUser && guestMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-11 z-50 w-56 rounded-2xl p-4"
                  style={{ background: "rgba(10,10,11,0.97)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}
                >
                  <p className="text-white text-xs font-bold mb-0.5" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.02em" }}>Cabaña Creative</p>
                  <p className="text-white/40 text-[10px] mb-3">Accede a contenido exclusivo</p>
                  <button
                    onClick={() => { setGuestMenuOpen(false); base44.auth.redirectToLogin(window.location.href); }}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-black mb-2 transition-all hover:scale-[1.02]"
                    style={{ background: "white" }}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => { setGuestMenuOpen(false); base44.auth.redirectToLogin(window.location.href); }}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-colors hover:text-white"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Registrarse
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
          }}
        >
          <div className="flex items-center justify-around px-2 pt-2 pb-3">
            {bottomNavItems.map((item) => {
              const active = item.page ? isActiveNav(item.page) : false;
              const Icon = item.icon;
              const inner = (
                <button
                  className="flex flex-col items-center gap-1 w-full py-1"
                  onClick={item.action || undefined}
                >
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
              );
              return item.page ? (
                <Link key={item.label} to={createPageUrl(item.page)} className="flex-1">{inner}</Link>
              ) : (
                <div key={item.label} className="flex-1">{inner}</div>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}