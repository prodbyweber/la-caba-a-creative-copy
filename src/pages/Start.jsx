import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import "@/components/fullaccess/fa-v4.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import HeroVSL from "@/components/fullaccess/HeroVSL";
import StatsSection from "@/components/fullaccess/StatsSection";
import BrandsStrip from "@/components/fullaccess/BrandsStrip";
import ArtistsCarousel from "@/components/fullaccess/ArtistsCarousel";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";

export default function Start() {
  const { settings, projects, demos, artists } = useFullAccessContent();
  const [unlocked, setUnlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // El CTA arranca siempre bloqueado: solo se abre al llegar al minuto marcado.

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  // El CTA mantiene su diseño y su desbloqueo: solo cambia el destino.
  const openBrief = useCallback(() => navigate("/admision"), [navigate]);

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

      <StatsSection />
      <BrandsStrip />
      <ArtistsCarousel artists={artists} settings={settings} />
      <SelectedProjects projects={projects} />
      <Methodology settings={settings} demos={demos} />

      <footer className="fa-wrap">
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

    </div>
  );
}