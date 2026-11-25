import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/** Solo un audio suena a la vez en toda la página. */
let activeEl = null;
const claim = (el) => {
  if (activeEl && activeEl !== el) activeEl.pause();
  activeEl = el;
};

export default function DemoMasterCard({ demo }) {
  const demoRef = useRef(null);
  const masterRef = useRef(null);
  const barRef = useRef(null);
  const [version, setVersion] = useState("demo");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrubbing = useRef(false);

  useEffect(() => {
    const audio = version === "demo" ? demoRef.current : masterRef.current;
    if (!audio) return undefined;

    const onTime = () => {
      if (!scrubbing.current && audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onPause = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onPause);
    };
  }, [version]);

  useEffect(
    () => () => {
      demoRef.current?.pause();
      masterRef.current?.pause();
    },
    []
  );

  const toggle = () => {
    const audio = version === "demo" ? demoRef.current : masterRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    claim(audio);
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  const switchVersion = (next) => {
    if (next === version) return;
    const from = version === "demo" ? demoRef.current : masterRef.current;
    const to = next === "demo" ? demoRef.current : masterRef.current;
    if (!to) return;

    const position = from?.currentTime || 0;
    const wasPlaying = !!from && !from.paused;
    from?.pause();
    setVersion(next);
    setProgress(0);

    const apply = () => {
      const max = Number.isFinite(to.duration) ? to.duration : 0;
      try {
        to.currentTime = max && position >= max ? 0 : position;
      } catch {
        to.currentTime = 0;
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

    if (to.readyState >= 1) apply();
    else to.addEventListener("loadedmetadata", apply, { once: true });
  };

  const seek = (event) => {
    const audio = version === "demo" ? demoRef.current : masterRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !audio.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

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
          >
            Demo
          </button>
          <button
            type="button"
            className={`fa-dmcard__opt${version === "master" ? " is-on" : ""}`}
            onClick={() => switchVersion("master")}
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
            aria-label="Progreso"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            onPointerDown={(event) => {
              scrubbing.current = true;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              seek(event);
            }}
            onPointerMove={(event) => {
              if (scrubbing.current) seek(event);
            }}
            onPointerUp={() => {
              scrubbing.current = false;
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
            }}
          >
            <span style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
          </div>
        </div>
      </div>

      <audio ref={demoRef} src={demo.demo_audio_url || undefined} preload="auto" />
      <audio ref={masterRef} src={demo.master_audio_url || undefined} preload="auto" />
    </article>
  );
}