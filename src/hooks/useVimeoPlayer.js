import { useCallback, useEffect, useRef, useState } from "react";
import { unlockKey } from "@/lib/fullAccess";

const DEFAULT_UNLOCK = 249;
const JUMP_TOLERANCE = 1.5;

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

/**
 * Reproductor del VSL: sin saltos, sin controles nativos, con sonido activado,
 * audio conmutable y desbloqueo solo por visionado real.
 */
export default function useVimeoPlayer({ settings, unlocked, onUnlock, suspended }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const maxRef = useRef(0);
  const unlockedRef = useRef(unlocked);
  const mutedRef = useRef(false);
  const firstPlayRef = useRef(true);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(unlocked ? 1 : 0);

  useEffect(() => {
    unlockedRef.current = unlocked;
    if (unlocked) setProgress(1);
  }, [unlocked]);

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

        player.on("ended", () => {
          setPlaying(false);
          setProgress(1);
          markUnlocked();
        });

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

        // El icono de audio sigue siempre el estado real del reproductor.
        player.on("volumechange", (data) => {
          const value = Number(data?.volume);
          const next = data?.muted === true || value === 0;
          mutedRef.current = next;
          setMuted(next);
        });

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
          .catch(() => {});
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

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pause().catch(() => {});
      return;
    }
    if (mutedRef.current) {
      player.setMuted(false).catch(() => {});
      player.setVolume(1).catch(() => {});
    }
    player.play().catch(() => setPlaying(false));
  }, [playing]);

  // Pantalla completa del propio reproductor de Vimeo.
  const requestFullscreen = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      const result = player.requestFullscreen?.();
      if (result && typeof result.catch === "function") result.catch(() => {});
    } catch {
      /* el reproductor ya no está disponible */
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    player.setMuted(next).catch(() => {});
    player.setVolume(next ? 0 : 1).catch(() => {});
  }, []);

  return {
    iframeRef,
    started,
    playing,
    muted,
    progress,
    activate,
    toggle,
    toggleMute,
    requestFullscreen,
  };
}