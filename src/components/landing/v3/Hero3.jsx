import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isVideoFile } from "@/lib/landingMedia";
import { SESSION_CTA } from "./constants";
import { scrollToSection } from "./scrollToSection";

export default function Hero3({ settings }) {
  const [isMobile, setIsMobile] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const src = (isMobile && settings?.hero_media_mobile_url) || settings?.hero_media_url || "";
  const poster = settings?.hero_poster_url || "";
  const showVideo = isVideoFile(src) && !videoFailed;

  return (
    <section className="ccl-snap ccl-snap--dark ccl-hero" id="top">
      <div className="ccl-hero__media">
        {showVideo ? (
          <video
            src={src}
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          />
        ) : poster ? (
          <img src={poster} alt="" aria-hidden="true" />
        ) : null}
      </div>
      <div className="ccl-hero__veil" />

      <div className="ccl-wrap ccl-snap__inner">
        <span className="ccl-eyebrow">Cabaña Creative · Madrid</span>

        <h1 className="ccl-display ccl-h1 ccl-hero__title">
          Construye tu catálogo.
          <br />
          <em>Lánzalo al mundo.</em>
        </h1>

        <p className="ccl-lead">
          La plataforma creativa para artistas que quieren desarrollar su música, descubrir su sonido y
          llevarlo al mercado.
        </p>

        <div className="ccl-hero__ctas">
          <button type="button" className="ccl-btn ccl-btn--primary" onClick={() => scrollToSection("tendencia")}>
            Explorar <ArrowRight size={14} />
          </button>
          <Link to={SESSION_CTA} className="ccl-btn ccl-btn--ghost">
            Agendar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}