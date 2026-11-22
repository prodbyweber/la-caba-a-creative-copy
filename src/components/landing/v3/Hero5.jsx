import React, { useEffect, useMemo, useState } from "react";
import { isVideoFile } from "@/lib/landingMedia";
import AmbientVideo from "./AmbientVideo";
import HeroRotator, { normalizeFrames } from "./HeroRotator";

const ROTATE_MS = 8000;
const IS_MP4 = /\.mp4(\?|$)/i;

/** Hero cinemático: vídeo de fondo con sombreado y el texto animado por encima. */
export default function Hero5({ settings }) {
  const sources = useMemo(() => {
    const list = [
      settings?.hero_media_url,
      settings?.journey_media_url,
      ...(Array.isArray(settings?.hero_videos) ? settings.hero_videos : []),
    ].filter((url) => isVideoFile(url));

    const unique = [...new Set(list)];
    // MP4 H.264 primero: los .MOV no se reproducen en todos los navegadores.
    const mp4 = unique.filter((url) => IS_MP4.test(url));
    return mp4.length ? [...mp4, ...unique.filter((url) => !IS_MP4.test(url))] : unique;
  }, [settings]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (sources.length < 2) return undefined;
    const timer = setInterval(() => setIndex((v) => (v + 1) % sources.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [sources.length]);

  const src = sources[index] || "";
  const poster = settings?.hero_poster_url || "";

  const frames = useMemo(() => normalizeFrames(settings?.hero_frames), [settings]);
  const finalTop = settings?.hero_final_top || "La";
  const finalWord = settings?.hero_final_word || "Cabaña";
  const subtitle = settings?.hero_subtitle || "";
  const lastFrame = frames[frames.length - 1];

  const headline = lastFrame
    ? `${lastFrame.top} ${lastFrame.prefix} ${lastFrame.word}`.replace(/\s+/g, " ").trim()
    : "";
  const subtitleSentence = subtitle
    ? `${subtitle.charAt(0).toLowerCase()}${subtitle.slice(1)}`
    : "";
  const hiddenTitle = `${headline} ${finalTop} ${finalWord}: ${subtitleSentence}`
    .replace(/\s+/g, " ")
    .trim();

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
        <h1 className="ccl-sr-only">{hiddenTitle}</h1>
        <HeroRotator
          frames={frames}
          finalTop={finalTop}
          finalWord={finalWord}
          finalHold={settings?.hero_final_hold_ms}
          subtitle={subtitle}
        />
      </div>
    </section>
  );
}