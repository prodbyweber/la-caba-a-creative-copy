import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import VimeoVSL from "@/components/fullaccess/VimeoVSL";

export default function HeroVSL({ settings, lead, onLead, unlocked, onUnlock, onRequestForm }) {
  return (
    <section className="fa-hero">
      <div className="fa-hero__glow" aria-hidden="true" />

      <div className="fa-wrap fa-hero__inner">
        <motion.div
          className="fa-hero__head"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fa-hero__tag">
            <span className="fa-eyebrow">{settings.hero_eyebrow}</span>
            <span className="fa-hero__tag-sep" />
            <span className="fa-micro">{settings.hero_kicker}</span>
          </div>

          <h1 className="fa-display fa-hero__title">{settings.hero_title}</h1>
          <p className="fa-hero__sub">{settings.hero_subtitle}</p>
        </motion.div>

        <motion.div
          className="fa-hero__video"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <VimeoVSL
            settings={settings}
            lead={lead}
            onLead={onLead}
            onUnlock={onUnlock}
            unlocked={unlocked}
          />
        </motion.div>

        {unlocked && (
          <motion.div
            className="fa-unlock is-open"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <span className="fa-micro">Admisión abierta</span>
              <h2 className="fa-h3" style={{ marginTop: 10, maxWidth: "24ch" }}>
                Tu proyecto merece una dirección propia.
              </h2>
              <p className="fa-unlock__text">
                Cuando termines de descubrir cómo trabajamos, podrás presentarnos tu música y
                solicitar una sesión de admisión.
              </p>
            </div>
            <button type="button" className="fa-btn" onClick={onRequestForm}>
              Presentar mi proyecto
              <ArrowRight size={15} />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}