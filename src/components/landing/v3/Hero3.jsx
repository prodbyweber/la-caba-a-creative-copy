import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { isVideoFile } from "@/lib/landingMedia";
import { CATALOG_CTA, DISCIPLINES, PROJECT_CTA } from "./constants";

export default function Hero3({ section, settings }) {
  const [isMobile, setIsMobile] = useState(false);
  const bgRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Parallax suave solo en escritorio.
  useEffect(() => {
    if (isMobile) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = Math.min(window.scrollY, 800);
        if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${y * 0.1}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  const videoSrc = (isMobile && settings?.hero_media_mobile_url) || settings?.hero_media_url || "";
  const poster = settings?.hero_poster_url || "";
  const title = section?.title || "TU SONIDO.\nTU IDENTIDAD.\nTU PRÓXIMO MOVIMIENTO.";
  const lines = title.split("\n");

  return (
    <section className="ccl-hero" id="top">
      {isVideoFile(videoSrc) ? (
        <video
          ref={bgRef}
          className="ccl-hero__bg"
          src={videoSrc}
          poster={poster || undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      ) : poster ? (
        <img ref={bgRef} className="ccl-hero__bg" src={poster} alt="" aria-hidden="true" />
      ) : null}
      <div className="ccl-hero__veil" />

      <div className="ccl-wrap ccl-hero__inner">
        <div data-reveal className="is-in">
          <span className="ccl-eyebrow">Producción musical · Madrid</span>
          <h1 className="ccl-hero__title">
            {lines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p className="ccl-hero__lead">
            {section?.subtitle ||
              "Desarrollamos artistas a través de producción musical, dirección creativa y estrategias para construir proyectos con identidad."}
          </p>

          <div className="ccl-hero__ctas">
            <Link to={PROJECT_CTA} className="ccl-btn ccl-btn--primary">
              Enviar mi proyecto <ArrowRight size={14} />
            </Link>
            <Link to={CATALOG_CTA} className="ccl-btn ccl-btn--ghost">
              Explorar catálogo
            </Link>
          </div>

          <p className="ccl-hero__note">Compañía de producción musical · Venezuela 2020 · Madrid</p>
        </div>
      </div>

      <div className="ccl-marquee" aria-hidden="true">
        <div className="ccl-marquee__track">
          {[0, 1].map((group) => (
            <div className="ccl-marquee__group" key={group}>
              {DISCIPLINES.map((item) => (
                <React.Fragment key={`${group}-${item}`}>
                  <span className="ccl-marquee__item">{item}</span>
                  <span className="ccl-marquee__dot" />
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}