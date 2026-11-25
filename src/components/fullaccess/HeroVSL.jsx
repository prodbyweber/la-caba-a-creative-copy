import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import VimeoVSL from "@/components/fullaccess/VimeoVSL";

export default function HeroVSL({ settings, lead, onLead, unlocked, onUnlock, onRequestForm }) {
  return (
    <>
      <section className="fa-hero">
        {settings.hero_image_url && (
          <img
            className="fa-hero__img"
            src={settings.hero_image_url}
            alt="Santiago Weber, Cabaña Creative"
            loading="eager"
          />
        )}
        <div className="fa-hero__veil" />

        <div className="fa-wrap fa-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="fa-hero__tag">
              <span className="fa-eyebrow">{settings.hero_eyebrow}</span>
              <span className="fa-hero__tag-sep" />
              <span className="fa-micro">Programa de desarrollo artístico</span>
            </div>

            <h1 className="fa-display fa-hero__title">{settings.hero_title}</h1>
            <p className="fa-hero__sub">{settings.hero_subtitle}</p>
            <span className="fa-hero__scroll">Ver el vídeo ↓</span>
          </motion.div>
        </div>
      </section>

      <div className="fa-vsl-sec">
        <div className="fa-wrap">
          <VimeoVSL
            settings={settings}
            lead={lead}
            onLead={onLead}
            onUnlock={onUnlock}
            unlocked={unlocked}
          />

          <div className="fa-unlock">
            <div>
              <span className="fa-micro">
                {unlocked ? "Admisión abierta" : "Admisión"}
              </span>
              <h2 className="fa-h3" style={{ marginTop: 10, maxWidth: "26ch" }}>
                {unlocked
                  ? "Tu proyecto merece una dirección propia."
                  : "El siguiente paso es conocer tu música."}
              </h2>
            </div>
            <button type="button" className="fa-btn" onClick={onRequestForm}>
              {unlocked ? "Presentar mi proyecto" : "Ir al formulario"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}