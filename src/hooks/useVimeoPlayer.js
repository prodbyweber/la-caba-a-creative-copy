import { useCallback, useEffect, useRef, useState } from "react";
import { unlockKey } from "@/lib/fullAccess";

const DEFAULT_UNLOCK = 249;
const JUMP_TOLERANCE = 1.5;
// Tiempo del fundido de vuelta a la portada al terminar el vídeo.
const LEAVE_MS = 700;

function loadSdk() {
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

const isTouchDevice = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const fullscreenElement = () =>
  (typeof document !== "undefined" &&
    (document.fullscreenElement || document.webkitFullscreenElement)) ||
  null;

const runPromise = (result) => {
  if (result && typeof result.catch === "function") return result.catch(() => {});
  return undefined;
};

/**
 * Reproductor del VSL: sin controles visibles, se pausa tocando el vídeo,
 * pantalla completa real (API / Vimeo / inmersiva) y desbloqueo por visionado.
 */
export default function useVimeoPlayer({ settings, unlocked, onUnlock, suspended }) {
  const wrapperRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const maxRef = useRef(0);
  const unlockedRef = useRef(unlocked);
  const firstPlayRef = useRef(true);
  const scrollRef = useRef(0);
  const immersiveRef = useRef(false);
  const endedRef = useRef(() => {});

  const [started, setStarted] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(unlocked ? 1 : 0);
  const [nativeFs, setNativeFs] = useState(false);
  const [immersive, setImmersive] = useState(false);

  useEffect(() => {
    unlockedRef.current = unlocked;
    if (unlocked) setProgress(1);
  }, [unlocked]);

  useEffect(() => {
    immersiveRef.current = immersive;
  }, [immersive]);

  const markUnlocked = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    try {
      localStorage.setItem(unlockKey(settings.vimeo_url), "1");
    } catch {
      /* almacenamiento no disponible */
    }
    setProgress(1);
    onUnlock();
  }, [onUnlock, settings.vimeo_url]);

  const activate = useCallback(() => setStarted(true), []);

  /* ---------------- pantalla completa ---------------- */
  const exitFullscreen = useCallback(async () => {
    if (fullscreenElement()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      try {
        await exit.call(document);
      } catch {
        /* el navegador ya salió */
      }
    }
    if (immersiveRef.current) setImmersive(false);
    try {
      await runPromise(playerRef.current?.exitFullscreen?.());
    } catch {
      /* no estaba en pantalla completa de Vimeo */
    }
    const y = scrollRef.current;
    if (y) window.requestAnimationFrame(() => window.scrollTo(0, y));
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (fullscreenElement() || immersiveRef.current) return;
    scrollRef.current = window.scrollY;

    // a) API del navegador sobre el marco limpio del reproductor.
    const el = wrapperRef.current;
    const request = el?.requestFullscreen || el?.webkitRequestFullscreen;
    if (request) {
      try {
        await request.call(el);
        return;
      } catch {
        /* sigue con el plan B */
      }
    }

    // b) iPhone Safari: pantalla completa nativa del propio Vimeo.
    const player = playerRef.current;
    if (player?.requestFullscreen) {
      try {
        await player.requestFullscreen();
        return;
      } catch {
        /* sigue con el plan C */
      }
    }

    // c) Modo inmersivo: ocupa la pantalla con estilos propios.
    setImmersive(true);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreenElement() || immersiveRef.current) exitFullscreen();
    else enterFullscreen();
  }, [enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const onChange = () => setNativeFs(Boolean(fullscreenElement()));
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  // Con la pantalla completa activa se bloquea el scroll y se intenta girar a horizontal.
  useEffect(() => {
    if (!immersive) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [immersive]);

  useEffect(() => {
    if (!nativeFs && !immersive) return undefined;
    try {
      runPromise(screen.orientation?.lock?.("landscape"));
    } catch {
      /* el navegador no permite bloquear la orientación */
    }
    return () => {
      try {
        screen.orientation?.unlock?.();
      } catch {
        /* sin bloqueo previo */
      }
    };
  }, [nativeFs, immersive]);

  // Al girar el móvil a horizontal se entra en pantalla completa; en vertical se vuelve.
  useEffect(() => {
    if (!started || !isTouchDevice()) return undefined;
    const query = window.matchMedia("(orientation: landscape)");
    const onChange = () => {
      if (query.matches) {
        if (!fullscreenElement() && !immersiveRef.current) enterFullscreen();
      } else if (immersiveRef.current) {
        setImmersive(false);
      }
    };
    query.addEventListener("change", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, [started, enterFullscreen]);

  /* ---------------- fin del vídeo ---------------- */
  const handleEnded = useCallback(async () => {
    const player = playerRef.current;
    setPlaying(false);
    markUnlocked();
    setProgress(1);
    await exitFullscreen();
    try {
      await player?.pause?.();
      await player?.setCurrentTime?.(0);
    } catch {
      /* el reproductor ya se ha liberado */
    }
    maxRef.current = 0;
    firstPlayRef.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      setLeaving(false);
      setStarted(false);
    }, LEAVE_MS);
  }, [exitFullscreen, markUnlocked]);

  useEffect(() => {
    endedRef.current = handleEnded;
  }, [handleEnded]);

  /* ---------------- reproductor ---------------- */
  useEffect(() => {
    if (!started) return undefined;
    let cancelled = false;
    let player;

    loadSdk()
      .then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        player = new Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on("timeupdate", (data) => {
          const now = data.seconds || 0;
          const duration = data.duration || 0;
          // Un salto hacia delante nunca desbloquea: se devuelve al último punto visto.
          if (now > maxRef.current + JUMP_TOLERANCE) {
            player.setCurrentTime(maxRef.current).catch(() => {});
            return;
          }
          if (now > maxRef.current) maxRef.current = now;

          const target = Number(settings.unlock_seconds) || DEFAULT_UNLOCK;
          const fullLength = duration > 0 && target >= duration - 1;
          const point = fullLength ? duration : target;
          if (point > 0) setProgress(Math.min(1, now / point));
          if (!fullLength && now >= target) markUnlocked();
        });

        player.on("ended", () => endedRef.current());

        // El vídeo arranca siempre con el audio activo.
        player.on("play", () => {
          setPlaying(true);
          if (firstPlayRef.current) {
            firstPlayRef.current = false;
            player.setMuted(false).catch(() => {});
            player.setVolume(1).catch(() => {});
          }
        });
        player.on("pause", () => setPlaying(false));

        player
          .ready()
          .then(() => {
            player.setPlaybackRate(1).catch(() => {});
            player.setMuted(false).catch(() => {});
            player.setVolume(1).catch(() => {});
            // Al cambiar de vista (ampliada / reducida) se retoma donde iba.
            if (maxRef.current > 0) player.setCurrentTime(maxRef.current).catch(() => {});
            return player.play();
          })
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      })
      .catch(() => {
        /* sin SDK no hay vídeo ni desbloqueo: el CTA sigue bloqueado */
      });

    return () => {
      cancelled = true;
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [started, markUnlocked, settings.unlock_seconds]);

  useEffect(() => {
    if (!suspended) return;
    const player = playerRef.current;
    if (player) player.pause().catch(() => {});
  }, [suspended]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pause().catch(() => {});
      return;
    }
    player.setMuted(false).catch(() => {});
    player.setVolume(1).catch(() => {});
    player.play().catch(() => setPlaying(false));
  }, [playing]);

  return {
    wrapperRef,
    iframeRef,
    started,
    leaving,
    playing,
    progress,
    immersive,
    isFullscreen: nativeFs || immersive,
    activate,
    togglePlay,
    toggleFullscreen,
  };
}