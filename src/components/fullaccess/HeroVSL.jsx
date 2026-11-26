import React, { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import UnlockModule from "@/components/fullaccess/UnlockModule";
import useVimeoPlayer from "@/hooks/useVimeoPlayer";
import useVimeoThumb from "@/hooks/useVimeoThumb";
import { vimeoEmbedUrl } from "@/lib/fullAccess";

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

const clock = (seconds) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function HeroVSL({ settings, unlocked, onUnlock, onOpenForm, suspended }) {
  const coverRef = useRef(null);
  const previewRef = useRef(null);
  const [domFullscreen, setDomFullscreen] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const { poster, ratio } = useVimeoThumb(
    settings.vimeo_url,
    settings.vimeo_poster_url || settings.hero_image_url
  );
  const {
    iframeRef,
    started,
    playing,
    muted,
    progress,
    currentTime,
    duration,
    vimeoFullscreen,
    activate,
    toggle,
    toggleMute,
    seek,
    requestVimeoFullscreen,
    exitVimeoFullscreen,
  } = useVimeoPlayer({ settings, unlocked, onUnlock, suspended });

  const isFullscreen = domFullscreen || vimeoFullscreen;
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

  useEffect(() => {
    const sync = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      setDomFullscreen(Boolean(active && coverRef.current?.contains(active)));
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const lockLandscape = useCallback(() => {
    try {
      const request = screen.orientation?.lock?.("landscape");
      if (request?.catch) request.catch(() => {});
    } catch {
      /* el navegador decide la orientación */
    }
  }, []);

  const unlockOrientation = useCallback(() => {
    try {
      screen.orientation?.unlock?.();
    } catch {
      /* ignore */
    }
  }, []);

  /**
   * Pantalla completa real, siempre desde el clic del usuario:
   * 1) API del navegador sobre el contenedor del reproductor (Chrome, Firefox,
   *    Safari de escritorio y Android): no recrea el iframe ni reinicia el vídeo.
   * 2) En iPhone, donde el contenedor no admite pantalla completa, se pide al
   *    Vimeo Player SDK su propio modo a pantalla completa.
   */
  const toggleFullscreen = useCallback(async () => {
    const el = coverRef.current;
    const active = document.fullscreenElement || document.webkitFullscreenElement;

    if (active) {
      unlockOrientation();
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch {
        /* ignore */
      }
      return;
    }

    if (vimeoFullscreen) {
      unlockOrientation();
      await exitVimeoFullscreen();
      return;
    }

    try {
      if (el?.requestFullscreen) {
        await el.requestFullscreen();
        lockLandscape();
        return;
      }
      if (el?.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
        lockLandscape();
        return;
      }
    } catch {
      /* seguimos con el reproductor de Vimeo */
    }

    const ok = await requestVimeoFullscreen();
    if (ok) lockLandscape();
  }, [exitVimeoFullscreen, lockLandscape, requestVimeoFullscreen, unlockOrientation, vimeoFullscreen]);

  const onSeek = (event) => {
    seek(Number(event.target.value));
  };

  return (
    <section className="fa-hero">
      <div
        className={`fa-cover${started ? " is-playing" : ""}`}
        ref={coverRef}
        style={{ "--vsl-ratio": ratio }}
        onContextMenu={(event) => event.preventDefault()}
      >
        {started ? (
          <div className="fa-cover__frame">
            <iframe
              ref={iframeRef}
              src={vimeoEmbedUrl(settings.vimeo_url, EMBED)}
              title="Cabaña Full Access"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            />
            <button
              type="button"
              className="fa-cover__tap"
              onClick={toggle}
              aria-label={playing ? "Pausar el vídeo" : "Reproducir el vídeo"}
            >
              {!playing && (
                <span className="fa-glass fa-cover__center">
                  <Play size={26} fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </button>

            <div className="fa-cover__bar">
              <button
                type="button"
                className="fa-cover__btn"
                onClick={toggle}
                aria-label={playing ? "Pausar" : "Reproducir"}
              >
                {playing ? <Pause size={15} /> : <Play size={15} />}
              </button>

              <span className="fa-cover__time">{clock(currentTime)}</span>

              <input
                className="fa-cover__range"
                type="range"
                min={0}
                max={Math.max(1, Math.floor(duration))}
                step={1}
                value={Math.min(Math.floor(currentTime), Math.max(1, Math.floor(duration)))}
                onChange={onSeek}
                aria-label="Posición del vídeo"
              />

              <span className="fa-cover__time fa-cover__time--total">{clock(duration)}</span>

              <button
                type="button"
                className="fa-cover__btn"
                onClick={toggleMute}
                aria-label={muted ? "Activar el sonido" : "Silenciar"}
                aria-pressed={muted}
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                type="button"
                className="fa-cover__btn"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </div>
        ) : null}

        <div className={`fa-cover__media${started ? " is-hidden" : ""}`} aria-hidden={started}>
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

        <div className={`fa-cover__content${started ? " is-hidden" : ""}`}>
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