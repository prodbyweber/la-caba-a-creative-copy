import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StartNav from "@/components/start/StartNav";
import StartHero from "@/components/start/StartHero";
import CatalogoCarousel from "@/components/start/CatalogoCarousel";
import ProblemSolution from "@/components/start/ProblemSolution";
import HowItWorksAccordion from "@/components/start/HowItWorksAccordion";
import StartChoosePath from "@/components/start/StartChoosePath";
import StartFooter from "@/components/start/StartFooter";
import ApplicationModal from "@/components/start/ApplicationModal";

export default function Start() {
  const [modalOpen, setModalOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-application-modal", handler);
    return () => window.removeEventListener("open-application-modal", handler);
  }, []);

  // Sticky mobile CTA: show after hero, hide at "comenzar" section
  useEffect(() => {
    const heroEl = document.getElementById("hero");
    const contactoEl = document.getElementById("contacto");
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
      const contactoTop = contactoEl ? contactoEl.offsetTop : Infinity;

      if (currentScrollY > heroBottom && currentScrollY < contactoTop - window.innerHeight / 2) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      background: "#080808",
      color: "#f0ede8",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      overflowX: "hidden",
      minHeight: "100dvh",
      maxWidth: "1920px",
      margin: "0 auto",
    }}>
      <StartNav />

      {/* 1. Hero — con YouTube embed, CTA y carrusel de marcas */}
      <StartHero />

      {/* 2. Sección de Agitación del Problema */}
      <ProblemSolution />

      {/* 3. Catálogo Prod. by Weber — debajo de El Problema */}
      <CatalogoCarousel />

      {/* 4. Sección del Proceso — acordeones desplegables */}
      <HowItWorksAccordion />

      {/* 5. Cierre de embudo — "Comenzar" con Calendly integrado */}
      <div id="contacto">
        <StartChoosePath />
      </div>

      <StartFooter />

      {/* Sticky Mobile CTA */}
      <style>{`
        .sticky-mobile-cta { display: flex; }
        @media (min-width: 768px) { .sticky-mobile-cta { display: none !important; } }
      `}</style>
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            className="sticky-mobile-cta"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              justifyContent: "center",
              padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 0px))",
              background: "linear-gradient(to top, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.92) 60%, transparent 100%)",
            }}
          >
            <button
              onClick={() => { document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
              style={{
                fontFamily: "'Helvetica Neue', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                background: "#ff5833",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 28px",
                cursor: "pointer",
                width: "100%",
                maxWidth: "360px",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(255,88,51,0.35)",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e04a28"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ff5833"; }}
            >
              Sesión de descubrimiento gratis →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Modal — controlled from here */}
      <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}