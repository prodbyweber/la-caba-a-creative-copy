import React, { useCallback, useEffect, useState } from "react";
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
import DemoMasterRow from "@/components/fullaccess/DemoMasterRow";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";
import ProjectBriefModal from "@/components/fullaccess/ProjectBriefModal";

export default function Start() {
  const { settings, projects, demos, artists } = useFullAccessContent();
  const [unlocked, setUnlocked] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // El CTA arranca siempre bloqueado: solo se abre al llegar al minuto marcado.

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const openBrief = useCallback(() => setBriefOpen(true), []);
  const closeBrief = useCallback(() => setBriefOpen(false), []);

  return (
    <div className="fa">
      <FullAccessNav />

      <div id="video">
        <HeroVSL
          settings={settings}
          unlocked={unlocked}
          onUnlock={handleUnlock}
          onOpenForm={openBrief}
          suspended={briefOpen}
        />
      </div>

      <StatsSection />
      <BrandsStrip />
      <ArtistsCarousel artists={artists} settings={settings} />
      <DemoMasterRow eyebrow={settings.demo_eyebrow} projects={demos} />
      <SelectedProjects projects={projects} />
      <Methodology settings={settings} />

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

      {briefOpen ? <ProjectBriefModal onClose={closeBrief} /> : null}
    </div>
  );
}