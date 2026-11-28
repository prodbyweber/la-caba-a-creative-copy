import { useCallback, useEffect, useRef, useState } from "react";
import { claimPlayback, releasePlayback } from "@/lib/videoBus";
import { parseVideoSource } from "@/lib/videoEmbed";
import { loadVimeoPlayer } from "@/lib/vimeoPlayer";

let counter = 0;

const runPromise = (result) =>
  result && typeof result.catch === "function" ? result.catch(() => {}) : undefined;

/**
 * Reproductor en línea de testimonios y podcast.
 * Se prepara en silencio al entrar en pantalla y solo arranca con el clic del
 * visitante (con sonido, en el mismo gesto). Un único vídeo suena en la página
 * y, al terminar, vuelve a su portada original.
 */
export default function useInlinePlayer(rawUrl) {
  const source = parseVideoSource(rawUrl, { chromeless: true });
  const embedUrl = source?.embedUrl || "";
  const interactive = source?.kind === "vimeo";

  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const pendingRef = useRef(false);
  const idRef = useRef("");

  if (!idRef.current) {
    counter += 1;
    idRef.current = `inline-${counter}`;
  }

  const [mounted, setMounted] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Preparado en silencio en cuanto se ve: nunca en reproducción automática.
  useEffect(() => {
    if (!interactive || mounted) return undefined;
    const node = containerRef.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver !== "function") {
      setMounted(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setMounted(true);
      },
      { rootMargin: "160px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [interactive, mounted]);

  const pause = useCallback(() => {
    setPlaying(false);
    releasePlayback(idRef.current);
    const player = playerRef.current;
    if (player) runPromise(player.pause());
  }, []);

  // Siempre dentro del gesto del visitante: arranca con sonido, sin segundo clic.
  const play = useCallback(() => {
    claimPlayback(idRef.current, pause);
    setMounted(true);
    setEngaged(true);
    const player = playerRef.current;
    if (!player || !readyRef.current) {
      pendingRef.current = true;
      return;
    }
    runPromise(player.setMuted(false));
    runPromise(player.setVolume(1));
    runPromise(player.play());
  }, [pause]);

  useEffect(() => {
    if (!mounted || !interactive || !iframeRef.current) return undefined;
    let cancelled = false;
    let player;

    loadVimeoPlayer()
      .then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        player = new Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on("playing", () => {
          setPlaying(true);
          claimPlayback(idRef.current, pause);
        });

        player.on("pause", () => {
          setPlaying(false);
          releasePlayback(idRef.current);
        });

        // Al terminar: se para, vuelve al inicio y reaparece la portada.
        player.on("ended", () => {
          setPlaying(false);
          releasePlayback(idRef.current);
          runPromise(player.setCurrentTime(0));
          runPromise(player.pause());
          setEngaged(false);
        });

        player
          .ready()
          .then(() => {
            readyRef.current = true;
            runPromise(player.setPlaybackRate(1));
            if (pendingRef.current) {
              pendingRef.current = false;
              claimPlayback(idRef.current, pause);
              runPromise(player.setMuted(false));
              runPromise(player.setVolume(1));
              runPromise(player.play());
            }
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      readyRef.current = false;
      pendingRef.current = false;
      releasePlayback(idRef.current);
      try {
        player?.destroy?.();
      } catch {
        /* el reproductor ya no existe */
      }
      playerRef.current = null;
    };
  }, [mounted, interactive, pause]);

  return { mounted, engaged, playing, interactive, containerRef, iframeRef, embedUrl, play, pause };
}