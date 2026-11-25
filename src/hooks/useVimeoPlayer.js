import { useCallback, useEffect, useRef, useState } from "react";
import { UNLOCK_KEY } from "@/lib/fullAccess";

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

/** Reproductor del VSL: sin saltos, sin controles nativos, con desbloqueo por visionado. */
export default function useVimeoPlayer({ settings, unlocked, onUnlock, suspended }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const maxRef = useRef(0);
  const unlockedRef = useRef(unlocked);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(unlocked ? 1 : 0);

  useEffect(() => {
    unlockedRef.current = unlocked;
    if (unlocked) setProgress(1);
  }, [unlocked]);

  const unlockPoint = useCallback(
    (duration) => {
      const target = Number(settings.unlock_seconds) || DEFAULT_UNLOCK;
      return duration && target > duration ? duration * 0.97 : target;
    },
    [settings.unlock_seconds]
  );

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
      .catch(() => markUnlocked());

    return () => {
      cancelled = true;
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [started, markUnlocked, unlockPoint]);

  useEffect(() => {
    if (!suspended) return;
    const player = playerRef.current;
    if (player) player.pause().catch(() => {});
  }, [suspended]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pause().catch(() => {});
    else player.play().catch(() => {});
  }, [playing]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const next = !muted;
    player.setVolume(next ? 0 : 1).catch(() => {});
    setMuted(next);
  }, [muted]);

  return { iframeRef, started, playing, muted, progress, activate, toggle, toggleMute };
}