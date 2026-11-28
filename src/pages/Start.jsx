import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import "@/components/fullaccess/fa-v4.css";
import "@/components/fullaccess/fa-sections.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import HeroVSL from "@/components/fullaccess/HeroVSL";
import StatsSection from "@/components/fullaccess/StatsSection";
import BrandsStrip from "@/components/fullaccess/BrandsStrip";
import PodcastSection from "@/components/fullaccess/PodcastSection";
import ArtistsCarousel from "@/components/fullaccess/ArtistsCarousel";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";
import DemoMasterSection from "@/components/fullaccess/DemoMasterSection";
import TestimonialsSection from "@/components/fullaccess/TestimonialsSection";

export default function Start() {
  const { settings, projects, demos, artists, podcast, testimonials, sectionOrder } =
    useFullAccessContent();
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // El CTA arranca siempre bloqueado: solo se abre al llegar al minuto marcado.

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  // El CTA mantiene su diseño y su desbloqueo: solo cambia el destino.
  // Va al mismo formulario de /admision y conserva los parámetros UTM.
  const openBrief = useCallback(() => {
    const current = new URLSearchParams(window.location.search);
    const next = new URLSearchParams({ source: "vsl" });
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = current.get(key);
      if (value) next.set(key, value);
    });
    navigate(`/admision?${next.toString()}`);
  }, [navigate]);

  // Orden de secciones editable desde el panel (Full Access → Secciones).
  const sections = {
    stats: <StatsSection key="stats" />,
    brands: <BrandsStrip key="brands" />,
    podcast: <PodcastSection key="podcast" podcast={podcast} />,
    artists: <ArtistsCarousel key="artists" artists={artists} settings={settings} />,
    projects: <SelectedProjects key="projects" projects={projects} />,
    methodology: <Methodology key="methodology" settings={settings} />,
    demos: <DemoMasterSection key="demos" settings={settings} demos={demos} />,
    testimonials: <TestimonialsSection key="testimonials" items={testimonials} />,
    closing: (
      <footer className="fa-wrap" key="closing">
        <div className="fa-endcta">
          <button type="button" className="fa-cta" onClick={openBrief}>
            Envía tu proyecto
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="fa-foot">
          <span>Cabaña Creative · Madrid</span>
          <span>Full Access · Programa de desarrollo artístico</span>
        </div>
      </footer>
    ),
  };

  return (
    <div className="fa">
      <FullAccessNav />

      <div id="video">
        <HeroVSL
          settings={settings}
          unlocked={unlocked}
          onUnlock={handleUnlock}
          onOpenForm={openBrief}
        />
      </div>

      {sectionOrder.map((key) => sections[key] || null)}
    </div>
  );
}