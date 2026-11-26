import React, { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Play } from "lucide-react";
import UnlockModule from "@/components/fullaccess/UnlockModule";
import useVimeoPlayer from "@/hooks/useVimeoPlayer";
import useVimeoThumb from "@/hooks/useVimeoThumb";
import { vimeoEmbedUrl } from "@/lib/fullAccess";

// Sin barra de Vimeo: durante la reproducción solo se ve el botón de pantalla completa.
const EMBED = {
  autoplay: "1",
  controls: "0",
  title: "0",
  byline: "0",
  portrait: "0",
  speed: "0",
  pip: "0",
  keyboard: "0",
  dnt: "1",
  playsinline: "1",
  like: "0",
  share: "0",
  watch_later: "0",
  badge: "0",
  logo: "0",
  outro: "0",
  cards: "0",
  cc: "0",
  chapters: "0",
  transparent: "0",
};

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HeroVSL({ settings, unlocked, onUnlock, onOpenForm, suspended }) {
  const previewRef = useRef(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const { poster, ratio } = useVimeoThumb(
    settings.vimeo_url,
    settings.vimeo_poster_url || settings.hero_image_url
  );
  const {
    wrapperRef,
    iframeRef,
    started,
    leaving,
    playing,
    progress,
    immersive,
    isFullscreen,
    activate,
    togglePlay,
    toggleFullscreen,
  } = useVimeoPlayer({ settings, unlocked, onUnlock, suspended });

  const previewUrl = settings.preview_video_url || "";
  const showPreview = Boolean(previewUrl) && !previewFailed && !reducedMotion();

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return undefined;
    if (started || !showPreview) {
      el.pause();
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.pause();
    };
  }, [started, showPreview]);

  return (
    <section className="fa-hero">
      <div
        className={`fa-cover${started ? " is-playing" : ""}`}
        style={{ "--vsl-ratio": ratio }}
        onContextMenu={(event) => event.preventDefault()}
      >
        {started || leaving ? (
          <div
            ref={wrapperRef}
            className={`fa-cover__frame${immersive ? " is-immersive" : ""}${
              leaving ? " is-leaving" : ""
            }`}
          >
            <div className="fa-cover__crop">
              <iframe
                ref={iframeRef}
                src={vimeoEmbedUrl(settings.vimeo_url, EMBED)}
                title="Cabaña Full Access"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Escudo transparente: cualquier clic o toque pausa o reanuda. */}
            <button
              type="button"
              className="fa-cover__tap"
              onClick={togglePlay}
              aria-label={playing ? "Pausar el vídeo" : "Reproducir el vídeo"}
            />

            {!playing && !leaving ? (
              <button
                type="button"
                className="fa-glass fa-cover__play"
                onClick={togglePlay}
                aria-label="Reproducir el vídeo"
              >
                <Play size={26} fill="currentColor" strokeWidth={0} />
              </button>
            ) : null}

            <div className="fa-cover__tools">
              <button
                type="button"
                className="fa-glass fa-glass--sm"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={`fa-cover__media${started && !leaving ? " is-hidden" : ""}`}
          aria-hidden={started && !leaving}
        >
          {showPreview ? (
            <video
              ref={previewRef}
              src={previewUrl}
              poster={poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setPreviewFailed(true)}
            />
          ) : poster ? (
            <img src={poster} alt="" />
          ) : null}
          <span className="fa-cover__vignette" aria-hidden="true" />
        </div>

        <div className={`fa-cover__content${started && !leaving ? " is-hidden" : ""}`}>
          <div className="fa-wrap">
            <div className="fa-cover__text">
              <h1 className="fa-display fa-cover__title">{settings.hero_title}</h1>
              <p className="fa-cover__line">{settings.hero_subtitle}</p>
            </div>
          </div>
        </div>

        {!started ? (
          <button
            type="button"
            className="fa-glass fa-cover__play"
            onClick={activate}
            aria-label="Reproducir el vídeo"
          >
            <Play size={28} fill="currentColor" strokeWidth={0} />
          </button>
        ) : null}
      </div>

      <UnlockModule progress={progress} unlocked={unlocked} onOpenForm={onOpenForm} />
    </section>
  );
}