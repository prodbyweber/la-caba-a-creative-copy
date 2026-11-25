import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import VimeoVSL from "@/components/fullaccess/VimeoVSL";

export default function HeroVSL({ settings, lead, onLead, unlocked, onUnlock, onRequestForm }) {
  const [signal, setSignal] = useState(0);
  const playerRef = useRef(null);

  const loop = settings.hero_loop_video_url;
  const poster = settings.vimeo_poster_url || settings.hero_image_url;

  const start = () => {
    setSignal((value) => value + 1);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 90);
  };

  return (
    <section className="fa-hero">
      <div className="fa-hero__stage">
        <div className="fa-hero__media" aria-hidden="true">
          {loop ? (
            <video
              className="fa-hero__bg"
              src={loop}
              poster={poster || undefined}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : poster ? (
            <img className="fa-hero__photo" src={poster} alt="" />
          ) : null}
          <span className="fa-hero__shade" />
          <span className="fa-hero__vignette" />
        </div>

        {!loop && poster ? (
          <button
            type="button"
            className="fa-hero__play"
            onClick={start}
            aria-label="Reproducir el vídeo"
          >
            <Play size={26} fill="currentColor" strokeWidth={0} />
          </button>
        ) : null}

        <motion.h1
          className="fa-hero__title"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {settings.hero_title}
        </motion.h1>

        <p className="fa-hero__sub">{settings.hero_subtitle}</p>
      </div>

      <div className="fa-wrap fa-hero__body">
        <button type="button" className="fa-hero__cta" onClick={start}>
          {settings.hero_cta_label || "Empecemos"}
          <ArrowRight size={18} />
        </button>

        <div className="fa-hero__player" ref={playerRef}>
          <VimeoVSL
            settings={settings}
            lead={lead}
            onLead={onLead}
            onUnlock={onUnlock}
            unlocked={unlocked}
            startSignal={signal}
          />
        </div>

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