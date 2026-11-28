import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { claimPlayback, releasePlayback } from "@/lib/videoBus";
import { parseVideoSource } from "@/lib/videoEmbed";
import { loadVimeoPlayer } from "@/lib/vimeoPlayer";

let counter = 0;

const runPromise = (result) =>
  result && typeof result.catch === "function" ? result.catch(() => {}) : undefined;

/**
 * Reproductor en línea de testimonios y podcast.
 * Se prepara en silencio al entrar en pantalla, pero el primer clic siempre
 * arranca el vídeo con sonido: si el reproductor aún no está listo, el propio
 * iframe arranca con autoplay desde ese mismo clic. Nunca se deja el play
 * pendiente fuera del gesto del visitante (eso obligaba a pulsar dos veces).
 */
export default function useInlinePlayer(rawUrl) {
  const [mounted, setMounted] = useState(false);
  const [autoplayOn, setAutoplayOn] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [playing, setPlaying] = useState(false);

  const source = useMemo(
    () => parseVideoSource(rawUrl, { autoplay: autoplayOn, chromeless: true }),
    [rawUrl, autoplayOn]
  );
  const embedUrl = source?.embedUrl || "";
  const interactive = source?.kind === "vimeo";

  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const idRef = useRef("");

  if (!idRef.current) {
    counter += 1;
    idRef.current = `inline-${counter}`;
  }

  // Preparado en silencio antes de que llegue el clic, nunca en reproducción.
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
      { rootMargin: "400px" }
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

  // Todo ocurre dentro del gesto: el vídeo suena desde el primer clic.
  const play = useCallback(() => {
    claimPlayback(idRef.current, pause);
    setMounted(true);
    if (!interactive) {
      // Fuente sin SDK (YouTube): arranca con el autoplay del propio iframe.
      setEngaged(true);
      setAutoplayOn(true);
      return;
    }
    const player = playerRef.current;
    if (!player || !readyRef.current) {
      // Sin reproductor listo: el iframe arranca solo con este mismo clic.
      setAutoplayOn(true);
      return;
    }
    runPromise(player.setMuted(false));
    runPromise(player.setVolume(1));
    const result = player.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => setAutoplayOn(true));
    }
  }, [interactive, pause]);

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
          setEngaged(true);
          claimPlayback(idRef.current, pause);
          // Si el navegador arrancó en silencio, el audio se activa al momento.
          runPromise(player.setMuted(false));
          runPromise(player.setVolume(1));
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
          })
          .catch(() => {});
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      readyRef.current = false;
      releasePlayback(idRef.current);
      try {
        player?.destroy?.();
      } catch {
        /* el reproductor ya no existe */
      }
      playerRef.current = null;
    };
  }, [mounted, autoplayOn, interactive, pause]);

  return { mounted, engaged, playing, interactive, containerRef, iframeRef, embedUrl, play, pause };
}