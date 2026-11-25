import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, Maximize2, Minimize2, Play } from "lucide-react";
import { vimeoEmbedUrl, UNLOCK_KEY } from "@/lib/fullAccess";

const DEFAULT_UNLOCK = 249;
const JUMP_TOLERANCE = 1.5;

function loadVimeoSdk() {
  if (window.Vimeo?.Player) return Promise.resolve(window.Vimeo);
  if (window.__faVimeoPromise) return window.__faVimeoPromise;
  window.__faVimeoPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    script.onload = () => resolve(window.Vimeo);
    script.onerror = () => reject(new Error("Vimeo no disponible"));
    document.head.appendChild(script);
  });
  return window.__faVimeoPromise;
}

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function VimeoVSL({ settings, poster, ratio, unlocked, onUnlock, onOpenForm }) {
  const shellRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const previewRef = useRef(null);
  const maxRef = useRef(0);
  const unlockedRef = useRef(unlocked);

  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(unlocked ? 1 : 0);
  const [fullscreen, setFullscreen] = useState(false);

  const previewUrl = settings.preview_video_url || "";

  useEffect(() => {
    unlockedRef.current = unlocked;
    if (unlocked) setProgress(1);
  }, [unlocked]);

  const unlockPoint = useCallback((duration) => {
    const target = Number(settings.unlock_seconds) || DEFAULT_UNLOCK;
    return duration && target > duration ? duration * 0.97 : target;
  }, [settings.unlock_seconds]);

  const markUnlocked = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* almacenamiento no disponible */
    }
    setProgress(1);
    onUnlock();
  }, [onUnlock]);

  /* ---------- portada en movimiento (opcional) ---------- */
  useEffect(() => {
    if (activated || !previewUrl || reducedMotion()) return undefined;
    const el = previewRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [activated, previewUrl]);

  /* ---------- reproductor: se monta solo al pulsar play ---------- */
  useEffect(() => {
    if (!activated) return undefined;
    let cancelled = false;
    let player;

    loadVimeoSdk()
      .then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        player = new Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on("timeupdate", (data) => {
          const now = data.seconds || 0;
          const duration = data.duration || 0;
          if (now > maxRef.current + JUMP_TOLERANCE) {
            player.setCurrentTime(maxRef.current).catch(() => {});
            return;
          }
          if (now > maxRef.current) maxRef.current = now;
          const target = unlockPoint(duration);
          if (target > 0) setProgress(Math.min(1, now / target));
          if (now >= target) markUnlocked();
        });

        player.on("play", () => setPlaying(true));
        player.on("pause", () => setPlaying(false));

        player
          .ready()
          .then(() => {
            player.setPlaybackRate(1).catch(() => {});
            return player.play();
          })
          .catch(() => {});
      })
      .catch(() => {
        // Si el reproductor no carga, el acceso no se queda bloqueado.
        markUnlocked();
      });

    return () => {
      cancelled = true;
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [activated, markUnlocked, unlockPoint]);

  /* ---------- pantalla completa sin reiniciar la sesión ---------- */
  useEffect(() => {
    const sync = () => {
      const active = document.fullscreenElement || document.webkitFullscreenElement;
      setFullscreen(!!active && shellRef.current?.contains(active));
    };
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    const active = document.fullscreenElement || document.webkitFullscreenElement;
    if (active) {
      try {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch {
        /* ignore */
      }
      return;
    }
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
        return;
      } catch {
        /* ignore */
      }
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      return;
    }
    try {
      await playerRef.current?.requestFullscreen?.();
    } catch {
      /* ignore */
    }
  }, []);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pause().catch(() => {});
    else player.play().catch(() => {});
  }, [playing]);

  const showPreview = Boolean(previewUrl) && !reducedMotion();

  return (
    <div className={`fa-vsl-shell${fullscreen ? " is-fs" : ""}`} ref={shellRef}>
      <div className="fa-vsl" style={{ "--vsl-ratio": ratio }}>
        {activated ? (
          <>
            <iframe
              ref={iframeRef}
              src={vimeoEmbedUrl(settings.vimeo_url, { autoplay: "1", controls: "0", pip: "0" })}
              title="Cabaña Full Access"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <button
              type="button"
              className="fa-vsl__tap"
              onClick={togglePlayback}
              aria-label={playing ? "Pausar el vídeo" : "Reproducir el vídeo"}
            >
              {!playing && (
                <span className="fa-vsl__tap-icon">
                  <Play size={22} fill="currentColor" strokeWidth={0} />
                </span>
              )}
            </button>
            <button
              type="button"
              className="fa-vsl__fs"
              onClick={toggleFullscreen}
              aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </>
        ) : (
          <div className="fa-vsl__media">
            {showPreview ? (
              <video
                ref={previewRef}
                src={previewUrl}
                poster={poster || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : poster ? (
              <img src={poster} alt="" />
            ) : null}
            <span className="fa-vsl__veil" aria-hidden="true" />
            <button
              type="button"
              className="fa-vsl__play"
              onClick={() => setActivated(true)}
              aria-label="Reproducir el vídeo"
            >
              <Play size={24} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        )}
      </div>

      <div className="fa-vsl__bar" aria-hidden="true">
        <span className="fa-vsl__bar-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>

      <button
        type="button"
        className={`fa-cta${unlocked ? " is-open" : ""}`}
        aria-disabled={!unlocked}
        disabled={!unlocked}
        onClick={unlocked ? onOpenForm : undefined}
      >
        Creemos tu catálogo
        {unlocked ? <ArrowRight size={17} /> : <Lock size={15} />}
      </button>
    </div>
  );
}