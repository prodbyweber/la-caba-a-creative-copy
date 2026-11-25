import React, { useCallback, useEffect, useMemo, useState } from "react";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import { projectCover, UNLOCK_KEY } from "@/lib/fullAccess";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import HeroVSL from "@/components/fullaccess/HeroVSL";
import StatsSection from "@/components/fullaccess/StatsSection";
import ArtistsCarousel from "@/components/fullaccess/ArtistsCarousel";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";
import ProjectBriefModal from "@/components/fullaccess/ProjectBriefModal";

export default function Start() {
  const { settings, projects } = useFullAccessContent();
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [briefOpen, setBriefOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const openBrief = useCallback(() => setBriefOpen(true), []);
  const closeBrief = useCallback(() => setBriefOpen(false), []);

  const stageImages = useMemo(() => {
    const covers = (projects || []).map(projectCover).filter(Boolean);
    return [...covers, settings.hero_image_url].filter(Boolean);
  }, [projects, settings.hero_image_url]);

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
      <ArtistsCarousel />
      <SelectedProjects projects={projects} />
      <Methodology
        studioVideoUrl={settings.studio_video_url}
        images={stageImages}
      />

      <footer className="fa-wrap">
        <div className="fa-foot">
          <span>Cabaña Creative · Madrid</span>
          <span>Full Access · Programa de desarrollo artístico</span>
        </div>
      </footer>

      {briefOpen ? <ProjectBriefModal onClose={closeBrief} /> : null}
    </div>
  );
}