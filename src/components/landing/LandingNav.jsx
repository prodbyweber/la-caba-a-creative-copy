import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, LogOut, Home, Compass } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleAccountClick = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.role === "admin") {
        navigate(createPageUrl("AdminDashboard"));
      } else {
        navigate(createPageUrl("Dashboard"));
      }
    } catch {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout(createPageUrl("Landing"));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 60);
      if (currentY > lastScrollY.current && currentY > 80) {
        setScrollingDown(true);
      } else {
        setScrollingDown(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${
          scrollingDown
            ? "bg-transparent backdrop-blur-none"
            : scrolled
              ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/5"
              : "bg-transparent"
        }`}
        style={{ padding: "clamp(20px, 4vw, 32px) clamp(24px, 6vw, 56px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {/* Logo — siempre visible, grande */}
        <Link
          to={createPageUrl("Landing")}
          className="flex items-center select-none"
          style={{ textDecoration: "none", gap: "clamp(8px, 1.5vw, 14px)" }}
        >
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt="Cabaña Creative"
            style={{ height: "clamp(2.2rem, 5vw, 3rem)", width: "auto" }}
          />
          <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: "flex", flexDirection: "column" }}>
            <span style={{ letterSpacing: "-0.04em", display: "inline-flex", alignItems: "flex-start", lineHeight: 1, color: "#ff5833", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.4rem)" }}>
              Cabaña<sup style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.5em", fontWeight: 400, marginLeft: "3px", verticalAlign: "super" }}>®</sup>
            </span>
            <span style={{ letterSpacing: "-0.04em", display: "block", lineHeight: 1, color: "white", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.4rem)" }}>Creative</span>
          </div>
        </Link>

        {/* Right side: Explorar + perfil/registro + hamburger mobile */}
        <div className="flex items-center" style={{ gap: "clamp(10px, 2vw, 20px)" }}>

          {/* Explorar button — desktop only */}
          <button
            className="hidden sm:block"
            onClick={() => navigate("/Explorar")}
            style={{
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
              letterSpacing: "0.05em",
              background: "#ff5833",
              border: "1px solid #ff5833",
              color: "#fff",
              padding: "8px 18px",
              borderRadius: "99px",
              cursor: "pointer",
              transition: "background 0.2s ease, border-color 0.2s ease",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e04a20"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; }}
          >
            Explorar
          </button>

          {/* Profile or Login button — desktop */}
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#ff5833]/60"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#ff5833] font-bold text-sm border-2 border-[#ff5833]/60">
                    {user.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {accountMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px]"
                  >
                    <button
                      onClick={() => { handleAccountClick(); setAccountMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors text-left"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </button>
                    <div className="border-t border-white/5" />
                    <button
                      onClick={() => { handleLogout(); setAccountMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="hidden sm:block"
              style={{
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
                letterSpacing: "0.05em",
                background: "#f0ede8",
                color: "#0c0c0c",
                border: "none",
                padding: "8px 18px",
                borderRadius: "99px",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#ff5833"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#f0ede8"; e.currentTarget.style.color = "#0c0c0c"; }}
            >
              Registrarse
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#080808]/97 backdrop-blur-xl md:hidden"
          >
            <div className="p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <img
                  src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
                  alt="Cabaña Creative"
                  className="h-12 w-auto"
                />
                <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User profile if logged in */}
              {user && (
                <button
                  onClick={() => { handleAccountClick(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-lg mb-6 hover:bg-white/10 transition-colors text-left"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#ff5833]/60 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff5833] to-orange-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <p className="text-white font-semibold text-sm">{user.full_name}</p>
                    {user.role === "admin" && (
                      <p className="text-[#ff5833] text-xs font-bold uppercase tracking-wide">Admin</p>
                    )}
                  </div>
                </button>
              )}

              {/* Explorar button */}
              <button
                onClick={() => {
                  navigate("/Explorar");
                  setMobileOpen(false);
                }}
                className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-[#ff5833] text-white font-medium hover:bg-[#e04a20] transition-colors mb-3"
              >
                <Compass className="w-4 h-4" />
                Explorar
              </button>

              {/* Auth buttons */}
              <div className="space-y-3">
                  {user ? (
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { base44.auth.redirectToLogin(window.location.href); setMobileOpen(false); }}
                        className="block w-full py-3 rounded-lg bg-white text-black text-center font-medium hover:bg-gray-100 transition-colors"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        onClick={() => { base44.auth.redirectToLogin(window.location.href); setMobileOpen(false); }}
                        className="block w-full py-3 rounded-lg bg-transparent border border-white/20 text-white text-center font-medium hover:bg-white/10 transition-colors"
                      >
                        Registrarse
                      </button>
                    </>
                  )}
                  </div>
                  </div>
                  </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}