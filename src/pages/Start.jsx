import React, { useEffect, useState } from "react";
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

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-application-modal", handler);
    return () => window.removeEventListener("open-application-modal", handler);
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

      {/* 3. Sección del Proceso — acordeones desplegables */}
      <HowItWorksAccordion />

      {/* 4. Catálogo / Portafolio */}
      <CatalogoCarousel />

      {/* 5. Cierre de embudo — "Comenzar" con Calendly integrado */}
      <div id="contacto">
        <StartChoosePath />
      </div>

      <StartFooter />

      {/* Application Modal — controlled from here */}
      <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}