import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import { readStoredLead, projectCover, UNLOCK_KEY } from "@/lib/fullAccess";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import HeroVSL from "@/components/fullaccess/HeroVSL";
import StatsSection from "@/components/fullaccess/StatsSection";
import ArtistsCarousel from "@/components/fullaccess/ArtistsCarousel";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";
import AdmissionSheet from "@/components/fullaccess/AdmissionSheet";
import BookingSection from "@/components/fullaccess/BookingSection";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Start() {
  const { settings, projects } = useFullAccessContent();
  const [lead] = useState(() => readStoredLead());
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [application, setApplication] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmitted = useCallback((app) => {
    setApplication(app);
    setFormOpen(false);
    setTimeout(() => scrollTo("sesion"), 300);
  }, []);

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
          onOpenForm={() => setFormOpen(true)}
        />
      </div>

      <StatsSection />
      <ArtistsCarousel />
      <SelectedProjects settings={settings} projects={projects} />
      <Methodology
        settings={settings}
        studioVideoUrl={settings.studio_video_url}
        images={stageImages}
      />

      {application ? (
        <section className="fa-sec fa-sec--tight" id="sesion">
          <div className="fa-wrap">
            <motion.div
              className="fa-sec-head"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="fa-eyebrow">Sesión de admisión</span>
              <h2 className="fa-display fa-h2">Reserva tu videollamada</h2>
              <p className="fa-lead">
                {settings.booking_duration} minutos con Santiago Weber para conocer tu proyecto.
              </p>
            </motion.div>
            <BookingSection application={application} settings={settings} />
          </div>
        </section>
      ) : null}

      <footer className="fa-wrap">
        <div className="fa-foot">
          <span>Cabaña Creative · Madrid</span>
          <span>Full Access · Programa de desarrollo artístico</span>
        </div>
      </footer>

      {formOpen ? (
        <AdmissionSheet
          lead={lead}
          settings={settings}
          onSubmitted={handleSubmitted}
          onClose={closeForm}
        />
      ) : null}
    </div>
  );
}