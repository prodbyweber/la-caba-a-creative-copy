import React, { useEffect, useMemo, useState } from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";
import RotatingWord from "./RotatingWord";

const ROTATE_MS = 8000;
const EXTRA_WORDS = ["sonido", "historia"];

/** Hero cinemático: vídeo de fondo con sombreado y el texto por encima. */
export default function Hero5({ section, settings }) {
  const sources = useMemo(() => {
    const list = [
      settings?.hero_media_url,
      settings?.journey_media_url,
      ...(Array.isArray(settings?.hero_videos) ? settings.hero_videos : []),
    ].filter((url) => isVideoFile(url));
    return [...new Set(list)];
  }, [settings]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sources.length < 2) return undefined;
    const timer = setInterval(() => setIndex((v) => (v + 1) % sources.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [sources.length]);

  const src = sources[index] || "";
  const poster = settings?.hero_poster_url || "";

  const rawTitle = (section?.title || "Todo empieza con tu catálogo").trim().replace(/[.!?]+$/, "");
  const words = rawTitle.split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words[words.length - 1] : "";
  const prefix = last ? words.slice(0, -1).join(" ") : rawTitle;
  const rotating = last ? [last, ...EXTRA_WORDS] : EXTRA_WORDS;

  return (
    <section className="ccl-snap ccl-hero5" id="top">
      <div className="ccl-hero5__media">
        {src ? (
          <div className="ccl-hero5__frame" key={src}>
            <AmbientVideo src={src} poster={poster} />
          </div>
        ) : poster ? (
          <img className="ccl-media__el" src={poster} alt="" aria-hidden="true" />
        ) : null}
        <span className="ccl-hero5__shade" aria-hidden="true" />
        <span className="ccl-hero5__vignette" aria-hidden="true" />
      </div>

      <div className="ccl-wrap ccl-snap__inner ccl-hero5__inner">
        <p className="ccl-display ccl-hero5__brand">La Cabaña</p>
        <h1 className="ccl-display ccl-hero5__title">
          {prefix} <RotatingWord words={rotating} className="ccl-hero5__rot" />
        </h1>
        {section?.subtitle && <p className="ccl-hero5__sub">{section.subtitle}</p>}
      </div>
    </section>
  );
}