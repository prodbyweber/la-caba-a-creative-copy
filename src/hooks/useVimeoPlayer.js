import { useCallback, useEffect, useRef, useState } from "react";
import { unlockKey } from "@/lib/fullAccess";

const DEFAULT_UNLOCK = 249;
// Un salto en la línea de tiempo nunca cuenta como visionado.
const MAX_TICK = 1.5;

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
 * Reproductor del VSL: una sola instancia, audio conmutable, barra real y
 * desbloqueo solo por tiempo realmente visionado (arrastrar no desbloquea).
 */
export default function useVimeoPlayer({ settings, unlocked, onUnlock, suspended }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const watchedRef = useRef(0);
  const lastTickRef = useRef(0);
  const unlockedRef = useRef(unlocked);
  const mutedRef = useRef(false);
  const playingRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [vimeoFullscreen, setVimeoFullscreen] = useState(false);
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
          const now = Number(data?.seconds) || 0;
          const total = Number(data?.duration) || 0;
          setCurrentTime(now);
          if (total > 0) setDuration(total);

          const delta = now - lastTickRef.current;
          lastTickRef.current = now;
          if (delta > 0 && delta <= MAX_TICK) watchedRef.current += delta;

          const target = Number(settings.unlock_seconds) || DEFAULT_UNLOCK;
          const fullLength = total > 0 && target >= total - 1;
          const point = fullLength ? total : target;
          if (point > 0 && !unlockedRef.current) {
            setProgress(Math.min(1, watchedRef.current / point));
          }
          if (!fullLength && watchedRef.current >= target) markUnlocked();
        });

        player.on("ended", () => {
          playingRef.current = false;
          setPlaying(false);
          setProgress(1);
          markUnlocked();
        });

        player.on("play", () => {
          playingRef.current = true;
          setPlaying(true);
        });
        player.on("pause", () => {
          playingRef.current = false;
          setPlaying(false);
        });

        // El icono de audio sigue siempre el estado real del reproductor.
        player.on("volumechange", (data) => {
          const value = Number(data?.volume);
          const next = data?.muted === true || value === 0;
          mutedRef.current = next;
          setMuted(next);
        });

        player.on("fullscreenchange", (data) => {
          setVimeoFullscreen(Boolean(data?.fullscreen));
        });

        player
          .ready()
          .then(() => {
            player.setPlaybackRate(1).catch(() => {});
            player.setMuted(false).catch(() => {});
            player.setVolume(1).catch(() => {});
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
      playerRef.current = null;
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
    if (playingRef.current) {
      player.pause().catch(() => {});
      return;
    }
    if (mutedRef.current) {
      player.setMuted(false).catch(() => {});
      player.setVolume(1).catch(() => {});
    }
    player.play().catch(() => setPlaying(false));
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

  // Avanzar o retroceder no suma tiempo visionado.
  const seek = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player) return;
    const value = Math.max(0, seconds);
    lastTickRef.current = value;
    setCurrentTime(value);
    player.setCurrentTime(value).catch(() => {});
  }, []);

  const requestVimeoFullscreen = useCallback(async () => {
    const player = playerRef.current;
    if (!player?.requestFullscreen) return false;
    try {
      await player.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }, []);

  const exitVimeoFullscreen = useCallback(async () => {
    const player = playerRef.current;
    if (!player?.exitFullscreen) return false;
    try {
      await player.exitFullscreen();
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
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
  };
}