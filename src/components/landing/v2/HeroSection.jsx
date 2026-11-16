import React, { useEffect, useRef } from "react";
import PlatformMockup from "./PlatformMockup";
import CtaButton from "./CtaButton";
import { isVideoFile } from "@/lib/landingMedia";

export default function HeroSection({ section, settings, creators = [], onAccess }) {
  const bgRef = useRef(null);
  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  const videoSrc =
    (isMobile && settings?.hero_media_mobile_url) || settings?.hero_media_url || "";
  const poster = settings?.hero_poster_url || "";

  // Parallax suave del fondo (solo escritorio).
  useEffect(() => {
    if (isMobile) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = Math.min(window.scrollY, 900);
        if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isMobile]);

  return (
    <section className="cc-hero" id="top">
      {isVideoFile(videoSrc) ? (
        <video
          ref={bgRef}
          className="cc-hero__bg"
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
        <img ref={bgRef} className="cc-hero__bg" src={poster} alt="" aria-hidden="true" />
      ) : null}
      <div className="cc-hero__veil" />

      <div className="cc-wrap cc-hero__inner">
        <div className="cc-hero__copy" data-reveal>
          {section?.eyebrow && <span className="cc-eyebrow">{section.eyebrow}</span>}
          <h1 className="cc-h1">{section?.title}</h1>
          {section?.subtitle && <p className="cc-lead">{section.subtitle}</p>}

          <div className="cc-hero__ctas">
            <CtaButton
              label={section?.cta_label || settings?.login_label || "Acceder"}
              href={section?.cta_link || settings?.login_url || "/login"}
              variant="primary"
              onAccess={onAccess}
            />
            <CtaButton
              label={section?.cta2_label || settings?.request_label || "Solicitar acceso"}
              href={section?.cta2_link || "modal:access"}
              variant="ghost"
              onAccess={onAccess}
            />
          </div>

          <p className="cc-hero__note">Estudio de producción musical · Madrid</p>
        </div>

        <div className="cc-hero__mockup" data-reveal>
          <PlatformMockup creators={creators} />
        </div>
      </div>
    </section>
  );
}