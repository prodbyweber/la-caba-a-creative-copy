import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Artistas", href: "#artists" },
  { label: "Marcas", href: "#brands" },
  { label: "Plataforma", href: "/Explorar" },
  { label: "Contacto", href: "#cta" },
];

export default function StartNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 h-16"
        style={{
          background: scrolled ? "rgba(12,12,12,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease",
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <img
            src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png"
            alt="Cabaña Creative"
            className="h-9 w-auto"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={link.href.startsWith("#") ? (e) => handleNavClick(e, link.href) : undefined}
              className="text-xs font-semibold uppercase tracking-[0.18em] transition-colors"
              style={{ color: "rgba(240,237,232,0.5)", letterSpacing: "0.18em" }}
              onMouseEnter={e => e.target.style.color = "#f0ede8"}
              onMouseLeave={e => e.target.style.color = "rgba(240,237,232,0.5)"}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-4">
          <a
            href="#cta"
            onClick={e => handleNavClick(e, "#cta")}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border"
            style={{
              background: "rgba(240,237,232,0.07)",
              borderColor: "rgba(240,237,232,0.15)",
              color: "#f0ede8",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(240,237,232,0.15)"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(240,237,232,0.07)"; e.currentTarget.style.borderColor = "rgba(240,237,232,0.15)"; }}
          >
            Contactar
          </a>
          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-1">
            {menuOpen ? <X className="w-5 h-5" style={{ color: "#f0ede8" }} /> : <Menu className="w-5 h-5" style={{ color: "#f0ede8" }} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 flex flex-col px-6 py-6 gap-5"
            style={{ background: "rgba(12,12,12,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={link.href.startsWith("#") ? (e) => handleNavClick(e, link.href) : undefined}
                className="text-sm font-semibold uppercase tracking-widest"
                style={{ color: "rgba(240,237,232,0.7)" }}
              >
                {link.label}
              </a>
            ))}
            <a href="#cta" onClick={e => handleNavClick(e, "#cta")}
              className="mt-2 py-3 text-center rounded-full text-xs font-bold uppercase tracking-wider border"
              style={{ borderColor: "rgba(240,237,232,0.2)", color: "#f0ede8" }}>
              Agendar reunión
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}