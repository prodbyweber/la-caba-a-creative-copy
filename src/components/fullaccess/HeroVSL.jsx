import React from "react";
import { motion } from "framer-motion";
import VimeoVSL from "@/components/fullaccess/VimeoVSL";
import useVimeoThumb from "@/hooks/useVimeoThumb";

export default function HeroVSL({ settings, unlocked, onUnlock, onOpenForm }) {
  const { poster, ratio } = useVimeoThumb(
    settings.vimeo_url,
    settings.vimeo_poster_url || settings.hero_image_url
  );

  return (
    <section className="fa-hero">
      <div className="fa-hero__bg" aria-hidden="true">
        {poster ? <img src={poster} alt="" /> : null}
      </div>

      <div className="fa-wrap fa-hero__inner">
        <motion.div
          className="fa-hero__head"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="fa-display fa-hero__title">{settings.hero_title}</h1>
          <p className="fa-hero__lead">{settings.hero_subtitle}</p>
        </motion.div>

        <motion.div
          className="fa-hero__video"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <VimeoVSL
            settings={settings}
            poster={poster}
            ratio={ratio}
            unlocked={unlocked}
            onUnlock={onUnlock}
            onOpenForm={onOpenForm}
          />
        </motion.div>
      </div>
    </section>
  );
}