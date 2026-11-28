import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/** Solo un audio suena a la vez en toda la página. */
let activeEl = null;
const claim = (el) => {
  if (activeEl && activeEl !== el) activeEl.pause();
  activeEl = el;
};

const clamp01 = (n) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export default function DemoMasterCard({ demo }) {
  const demoRef = useRef(null);
  const masterRef = useRef(null);
  const barRef = useRef(null);

  const [version, setVersion] = useState("demo");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const versionRef = useRef("demo");
  const scrubbing = useRef(false);
  const rafSeek = useRef(0);
  const seekToken = useRef(0);

  /** Elemento de audio de la versión que se está escuchando. */
  const current = useCallback(
    () => (versionRef.current === "demo" ? demoRef.current : masterRef.current),
    []
  );

  // Las dos versiones quedan precargadas (preload="auto"): el cambio es inmediato.
  // Eventos de ambos elementos: solo la versión activa manda en el estado.
  useEffect(() => {
    const nodes = [demoRef.current, masterRef.current].filter(Boolean);
    const offs = [];

    nodes.forEach((node) => {
      const isActive = () => node === current();

      const onMeta = () => {
        if (!isActive() || !node.duration) return;
        if (!scrubbing.current) setProgress(clamp01(node.currentTime / node.duration));
      };
      const onPlay = () => {
        if (isActive()) setPlaying(true);
      };
      const onPause = () => {
        if (isActive()) setPlaying(false);
      };
      const onEnded = () => {
        if (!isActive()) return;
        setPlaying(false);
        setProgress(0);
      };

      node.addEventListener("loadedmetadata", onMeta);
      node.addEventListener("play", onPlay);
      node.addEventListener("pause", onPause);
      node.addEventListener("ended", onEnded);

      offs.push(() => {
        node.removeEventListener("loadedmetadata", onMeta);
        node.removeEventListener("play", onPlay);
        node.removeEventListener("pause", onPause);
        node.removeEventListener("ended", onEnded);
      });
    });

    return () => offs.forEach((off) => off());
  }, [current]);

  // Barra en tiempo real mientras suena.
  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    let last = 0;

    const tick = (now) => {
      if (now - last > 60) {
        last = now;
        const audio = current();
        if (audio && audio.duration && !scrubbing.current) {
          setProgress(clamp01(audio.currentTime / audio.duration));
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, current]);

  // Al desmontar no queda nada sonando.
  useEffect(
    () => () => {
      demoRef.current?.pause();
      masterRef.current?.pause();
      if (rafSeek.current) cancelAnimationFrame(rafSeek.current);
    },
    []
  );

  const toggle = () => {
    const audio = current();
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    claim(audio);
    if (audio.ended) {
      try {
        audio.currentTime = 0;
      } catch {
        /* noop */
      }
    }
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const switchVersion = (next) => {
    if (next === versionRef.current) return;
    const from = current();
    const to = next === "demo" ? demoRef.current : masterRef.current;
    if (!to) return;

    const position = from && Number.isFinite(from.currentTime) ? from.currentTime : 0;
    const wasPlaying = !!from && !from.paused && !from.ended;
    if (from) from.pause();

    versionRef.current = next;
    setVersion(next);

    const token = ++seekToken.current;

    // Arranca la nueva versión en el mismo punto, sin esperas.
    const applySeek = () => {
      if (seekToken.current !== token) return;
      const total = Number.isFinite(to.duration) ? to.duration : 0;
      if (!total) return;
      const target = position >= total - 0.35 ? 0 : position;
      try {
        to.currentTime = target;
      } catch {
        /* noop */
      }
      setProgress(clamp01(target / total));
    };

    if (to.readyState >= 1) {
      applySeek();
    } else {
      setProgress(0);
      to.addEventListener("loadedmetadata", applySeek, { once: true });
    }

    if (wasPlaying) {
      claim(to);
      to.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      setPlaying(false);
    }
  };

  const commitSeek = (ratio) => {
    const audio = current();
    if (!audio) return;

    if (!Number.isFinite(audio.duration) || !audio.duration) {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          if (audio.duration) audio.currentTime = ratio * audio.duration;
        },
        { once: true }
      );
      return;
    }

    try {
      audio.currentTime = ratio * audio.duration;
    } catch {
      /* noop */
    }
  };

  const handlePointer = (event) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = clamp01((event.clientX - rect.left) / (rect.width || 1));

    setProgress(ratio);

    // El salto real se aplica una vez por frame: la barra sigue siendo fluida.
    if (rafSeek.current) cancelAnimationFrame(rafSeek.current);
    rafSeek.current = requestAnimationFrame(() => {
      rafSeek.current = 0;
      commitSeek(ratio);
    });
  };

  const nudge = (delta) => {
    const audio = current();
    if (!audio || !audio.duration) return;
    const next = Math.min(audio.duration, Math.max(0, audio.currentTime + delta));
    try {
      audio.currentTime = next;
    } catch {
      /* noop */
    }
    setProgress(clamp01(next / audio.duration));
  };

  const percent = clamp01(progress) * 100;

  return (
    <article className="fa-dmcard">
      <div className="fa-dmcard__media">
        {demo.cover_url ? <img src={demo.cover_url} alt="" loading="lazy" /> : null}
      </div>

      <div className="fa-dmcard__body">
        <h3 className="fa-dmcard__artist">{demo.artist}</h3>
        {demo.song ? <p className="fa-dmcard__song">{demo.song}</p> : null}
        {demo.description ? <p className="fa-dmcard__desc">{demo.description}</p> : null}

        <div className="fa-dmcard__switch" role="group" aria-label="Versión">
          <button
            type="button"
            className={`fa-dmcard__opt${version === "demo" ? " is-on" : ""}`}
            onClick={() => switchVersion("demo")}
            aria-pressed={version === "demo"}
          >
            Demo
          </button>
          <button
            type="button"
            className={`fa-dmcard__opt${version === "master" ? " is-on" : ""}`}
            onClick={() => switchVersion("master")}
            aria-pressed={version === "master"}
          >
            Master
          </button>
        </div>

        <div className="fa-dmcard__transport">
          <button
            type="button"
            className="fa-glass fa-glass--sm"
            onClick={toggle}
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            {playing ? (
              <Pause size={14} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={14} fill="currentColor" strokeWidth={0} />
            )}
          </button>

          <div
            className="fa-dmcard__bar"
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label={`Progreso de la ${version}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percent)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && event.button !== 0) return;
              scrubbing.current = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              handlePointer(event);
            }}
            onPointerMove={(event) => {
              if (scrubbing.current) handlePointer(event);
            }}
            onPointerUp={(event) => {
              if (!scrubbing.current) return;
              handlePointer(event);
              scrubbing.current = false;
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
            }}
            onLostPointerCapture={() => {
              scrubbing.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                nudge(5);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                nudge(-5);
              }
            }}
          >
            <span className="fa-dmcard__fill" style={{ width: `${percent}%` }} />
            <span className="fa-dmcard__knob" style={{ left: `${percent}%` }} />
          </div>
        </div>
      </div>

      <audio ref={demoRef} src={demo.demo_audio_url || undefined} preload="auto" />
      <audio ref={masterRef} src={demo.master_audio_url || undefined} preload="auto" />
    </article>
  );
}