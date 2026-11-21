import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";
import CtaLink from "./CtaLink";

export default function Hero3({ section, settings }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const src = (isMobile && settings?.hero_media_mobile_url) || settings?.hero_media_url || "";
  const poster = settings?.hero_poster_url || "";

  const title = (section?.title || "Más que lo que se escucha.").trim();
  const words = title.split(" ");
  const last = words.length > 1 ? words.pop() : "";
  const head = words.join(" ");

  return (
    <section className="ccl-snap ccl-snap--dark ccl-hero" id="top">
      <div className="ccl-hero__media">
        {isVideoFile(src) ? (
          <AmbientVideo src={src} poster={poster} />
        ) : src ? (
          <img className="ccl-media__el" src={src} alt="" aria-hidden="true" />
        ) : null}
      </div>
      <div className="ccl-hero__veil" />

      <div className="ccl-wrap ccl-snap__inner">
        {section?.eyebrow && <span className="ccl-eyebrow">{section.eyebrow}</span>}

        <h1 className="ccl-display ccl-h1 ccl-hero__title">
          {head} {last && <em>{last}</em>}
        </h1>

        {section?.subtitle && <p className="ccl-lead">{section.subtitle}</p>}
        {section?.body && <p className="ccl-hero__note">{section.body}</p>}

        <div className="ccl-hero__ctas">
          {section?.cta_label && (
            <CtaLink to={section.cta_link} className="ccl-btn ccl-btn--primary">
              {section.cta_label} <ArrowRight size={14} />
            </CtaLink>
          )}
          {section?.cta2_label && (
            <CtaLink to={section.cta2_link} className="ccl-btn ccl-btn--ghost">
              {section.cta2_label}
            </CtaLink>
          )}
        </div>
      </div>
    </section>
  );
}