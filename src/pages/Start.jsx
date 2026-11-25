import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import "@/components/fullaccess/fa.css";
import "@/components/fullaccess/fa-landing.css";
import useFullAccessContent from "@/hooks/useFullAccessContent";
import { readStoredLead, UNLOCK_KEY } from "@/lib/fullAccess";
import FullAccessNav from "@/components/fullaccess/FullAccessNav";
import HeroVSL from "@/components/fullaccess/HeroVSL";
import StatsSection from "@/components/fullaccess/StatsSection";
import CollabsStrip from "@/components/fullaccess/CollabsStrip";
import DemoToMaster from "@/components/fullaccess/DemoToMaster";
import SelectedProjects from "@/components/fullaccess/SelectedProjects";
import Methodology from "@/components/fullaccess/Methodology";
import AdmissionForm from "@/components/fullaccess/AdmissionForm";
import BookingSection from "@/components/fullaccess/BookingSection";

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function Start() {
  const { settings, stats, projects, demos, stages, collabLogos } = useFullAccessContent();
  const [lead, setLead] = useState(() => readStoredLead());
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [application, setApplication] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    setTimeout(() => scrollTo("admision"), 600);
  }, []);

  const goToForm = () => {
    if (!unlocked) return scrollTo("video");
    scrollTo("admision");
  };

  return (
    <div className="fa">
      <FullAccessNav />

      <div id="video">
        <HeroVSL
          settings={settings}
          lead={lead}
          onLead={setLead}
          unlocked={unlocked}
          onUnlock={handleUnlock}
          onRequestForm={goToForm}
        />
      </div>

      <StatsSection settings={settings} stats={stats} />
      <CollabsStrip title={settings.collabs_title} logos={collabLogos} />
      <DemoToMaster settings={settings} demos={demos} />
      <SelectedProjects settings={settings} projects={projects} />
      <Methodology settings={settings} stages={stages} />

      <section className="fa-sec fa-sec--line" id="admision">
        <div className="fa-wrap">
          {!unlocked ? (
            <div className="fa-confirm">
              <span className="fa-eyebrow">Admisión</span>
              <h2 className="fa-display fa-h2" style={{ marginTop: 14, maxWidth: "20ch" }}>
                Tu proyecto merece una dirección propia.
              </h2>
              <p className="fa-lead" style={{ marginTop: 14, maxWidth: "48ch" }}>
                El siguiente paso es conocer tu proyecto. Cuando termines de descubrir cómo
                trabajamos, podrás presentarnos tu música y solicitar una sesión de admisión.
              </p>
              <button type="button" className="fa-btn" style={{ marginTop: 22 }} onClick={() => scrollTo("video")}>
                Seguir viendo
              </button>
            </div>
          ) : application ? (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="fa-eyebrow">Solicitud recibida</span>
              <h2 className="fa-display fa-h2" style={{ marginTop: 14 }}>
                Hemos recibido tu proyecto.
              </h2>
              <p className="fa-lead" style={{ marginTop: 14, maxWidth: "46ch" }}>
                Tu proyecto ya está en nuestras manos. El siguiente paso es conocernos.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="fa-sec-head">
                <span className="fa-eyebrow">Admisión</span>
                <h2 className="fa-display fa-h2">Presenta tu proyecto</h2>
                <p className="fa-lead">{settings.form_intro}</p>
              </div>
              <AdmissionForm lead={lead} settings={settings} onSubmitted={setApplication} />
            </>
          )}
        </div>
      </section>

      {application ? (
        <section className="fa-sec fa-sec--tight" id="sesion">
          <div className="fa-wrap">
            <div className="fa-sec-head">
              <span className="fa-eyebrow">Sesión de admisión</span>
              <h2 className="fa-display fa-h2">Reserva tu videollamada</h2>
              <p className="fa-lead">
                {settings.booking_duration} minutos con Santiago Weber para conocer tu proyecto.
              </p>
            </div>
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
    </div>
  );
}