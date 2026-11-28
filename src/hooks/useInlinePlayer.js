import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { claimPlayback, releasePlayback } from "@/lib/videoBus";
import { parseVideoSource } from "@/lib/videoEmbed";
import { loadVimeoPlayer } from "@/lib/vimeoPlayer";

let counter = 0;

const runPromise = (result) =>
  result && typeof result.catch === "function" ? result.catch(() => {}) : undefined;

/**
 * Reproductor en línea de testimonios y podcast.
 * El iframe se monta una sola vez al cargar la página y el reproductor de Vimeo
 * se engancha cuando el iframe ya ha cargado, así que responde a la primera.
 * El clic del visitante arranca el vídeo con audio dentro de su propio gesto.
 * Si en ese gesto el reproductor no respondiera, hay dos redes: el play se
 * ejecuta en cuanto esté listo y, como último recurso, el propio iframe arranca
 * solo en silencio y el audio entra al instante. Nunca hace falta un 2º clic.
 */
export default function useInlinePlayer(rawUrl) {
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ytAutoplay, setYtAutoplay] = useState(false);
  const [selfAutoplay, setSelfAutoplay] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [playing, setPlaying] = useState(false);

  const source = useMemo(
    () =>
      parseVideoSource(rawUrl, {
        autoplay: ytAutoplay || selfAutoplay,
        chromeless: true,
        muted: selfAutoplay,
      }),
    [rawUrl, ytAutoplay, selfAutoplay]
  );
  const embedUrl = source?.embedUrl || "";
  const interactive = source?.kind === "vimeo";

  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const pendingRef = useRef(false);
  const mutedStartRef = useRef(false);
  const startedRef = useRef(false);
  const clickTimerRef = useRef(null);
  const idRef = useRef("");

  if (!idRef.current) {
    counter += 1;
    idRef.current = `inline-${counter}`;
  }

  // Se prepara al cargar la página, igual que el VSL.
  useEffect(() => {
    if (!interactive || mounted) return undefined;
    const boot = () => setMounted(true);
    if (typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(boot, { timeout: 1200 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(boot, 400);
    return () => window.clearTimeout(timer);
  }, [interactive, mounted]);

  // Red de seguridad: si el evento load del iframe no llegara, se engancha igual.
  useEffect(() => {
    if (!mounted || !interactive || loaded) return undefined;
    const timer = window.setTimeout(() => setLoaded(true), 3000);
    return () => window.clearTimeout(timer);
  }, [mounted, interactive, loaded]);

  useEffect(() => () => window.clearTimeout(clickTimerRef.current), []);

  const handleIframeLoad = useCallback(() => setLoaded(true), []);

  const pause = useCallback(() => {
    window.clearTimeout(clickTimerRef.current);
    setPlaying(false);
    releasePlayback(idRef.current);
    const player = playerRef.current;
    if (player) runPromise(player.pause());
  }, []);

  // Arranque con sonido; si el navegador exige silencio, arranca en silencio y
  // el audio se activa en cuanto el vídeo empieza.
  const startPlayback = useCallback((player) => {
    if (!player) return;
    runPromise(player.setMuted(false));
    runPromise(player.setVolume(1));
    const result = player.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        mutedStartRef.current = true;
        player
          .setMuted(true)
          .then(() => player.play())
          .catch(() => {
            mutedStartRef.current = false;
          });
      });
    }
  }, []);

  // El play se resuelve siempre dentro del gesto del visitante.
  const play = useCallback(() => {
    claimPlayback(idRef.current, pause);
    setMounted(true);
    if (!interactive) {
      // Fuente sin SDK (YouTube): arranca con el autoplay del propio iframe.
      setEngaged(true);
      setYtAutoplay(true);
      return;
    }

    const player = playerRef.current;
    if (player && readyRef.current) startPlayback(player);
    else pendingRef.current = true;

    // Último recurso: si el reproductor no responde, el iframe se remonta con
    // autoplay en silencio y el audio entra en cuanto empieza.
    window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => {
      if (startedRef.current || readyRef.current || selfAutoplay) return;
      pendingRef.current = true;
      mutedStartRef.current = true;
      setLoaded(false);
      setSelfAutoplay(true);
      setReloadKey((key) => key + 1);
    }, 1600);
  }, [interactive, pause, startPlayback, selfAutoplay]);

  useEffect(() => {
    if (!mounted || !loaded || !interactive || !iframeRef.current) return undefined;
    let cancelled = false;
    let player;

    loadVimeoPlayer()
      .then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        player = new Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on("playing", () => {
          startedRef.current = true;
          window.clearTimeout(clickTimerRef.current);
          setPlaying(true);
          setEngaged(true);
          claimPlayback(idRef.current, pause);
          // Solo si el navegador obligó a arrancar en silencio.
          if (mutedStartRef.current) {
            mutedStartRef.current = false;
            runPromise(player.setMuted(false));
            runPromise(player.setVolume(1));
          }
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
            if (cancelled) return;
            readyRef.current = true;
            runPromise(player.setMuted(false));
            runPromise(player.setVolume(1));
            if (pendingRef.current) {
              pendingRef.current = false;
              startPlayback(player);
            }
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
  }, [mounted, loaded, interactive, pause, startPlayback, reloadKey]);

  return {
    mounted,
    engaged,
    playing,
    interactive,
    reloadKey,
    containerRef,
    iframeRef,
    embedUrl,
    play,
    pause,
    handleIframeLoad,
  };
}