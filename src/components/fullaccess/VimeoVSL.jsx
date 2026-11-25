import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Maximize2, Minimize2, Play } from "lucide-react";
import {
  vimeoEmbedUrl,
  formatClock,
  storeLead,
  UNLOCK_KEY,
  PROGRESS_KEY,
} from "@/lib/fullAccess";

const MESSAGES = [
  "Cada proyecto tiene una historia que contar.",
  "Tu sonido necesita una dirección.",
  "Descubre cómo podemos construirla.",
  "El siguiente paso es conocer tu música.",
];

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function VimeoVSL({ settings, lead, onLead, onUnlock, unlocked }) {
  const shellRef = useRef(null);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const leadRef = useRef(lead);
  const maxRatioRef = useRef(0);
  const gateRef = useRef(false);
  const gateSecondsRef = useRef(Number(settings.gate_seconds) || 65);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [form, setForm] = useState({ name: lead?.name || "", email: lead?.email || "" });
  const [error, setError] = useState("");
  const [sdkError, setSdkError] = useState(false);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

  useEffect(() => {
    gateSecondsRef.current = Number(settings.gate_seconds) || 65;
  }, [settings.gate_seconds]);

  /* ---------- reproductor: un único iframe, una única sesión ---------- */
  useEffect(() => {
    let cancelled = false;
    let player;

    loadVimeoSdk()
      .then((Vimeo) => {
        if (cancelled || !iframeRef.current) return;
        player = new Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on("timeupdate", (data) => {
          const dur = data.duration || 0;
          const now = data.seconds || 0;
          setSeconds(now);
          setDuration(dur);
          const r = dur ? now / dur : 0;
          setRatio(r);
          if (r > maxRatioRef.current) {
            maxRatioRef.current = r;
            try {
              localStorage.setItem(PROGRESS_KEY, String(now));
            } catch {
              /* almacenamiento no disponible */
            }
          }
          if (!leadRef.current && !gateRef.current && now >= gateSecondsRef.current) {
            gateRef.current = true;
            player.pause().catch(() => {});
            setGateOpen(true);
          }
        });

        player.on("play", () => {
          setStarted(true);
          setPlaying(true);
        });
        player.on("pause", () => setPlaying(false));

        player.on("ended", () => {
          setPlaying(false);
          if (maxRatioRef.current >= 0.9) {
            try {
              localStorage.setItem(UNLOCK_KEY, "1");
            } catch {
              /* almacenamiento no disponible */
            }
            onUnlock();
          }
        });

        player.ready().then(() => {
          let saved = 0;
          try {
            saved = Number(localStorage.getItem(PROGRESS_KEY) || 0);
          } catch {
            saved = 0;
          }
          if (saved > 10) player.setCurrentTime(saved).catch(() => {});
        });
      })
      .catch(() => setSdkError(true));

    return () => {
      cancelled = true;
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [onUnlock]);

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
    const player = playerRef.current;
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
        /* seguimos con el reproductor */
      }
    } else if (el?.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
      return;
    }

    // Safari móvil no permite pantalla completa de un contenedor:
    // la pedimos al propio reproductor, que mantiene la misma sesión.
    try {
      await player?.requestFullscreen?.();
    } catch {
      /* ignore */
    }
  }, []);

  const startPlayback = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    try {
      await player.ready();
      await player.play();
      setStarted(true);
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const seek = (event) => {
    const player = playerRef.current;
    if (!player || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    player.setCurrentTime(pct * duration).catch(() => {});
    setRatio(pct);
  };

  const submitGate = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError("Escribe tu nombre.");
    if (!EMAIL_RE.test(email)) return setError("Revisa tu correo electrónico.");
    setError("");
    const next = { name, email };
    storeLead(next);
    onLead(next);
    leadRef.current = next;
    setGateOpen(false);
    playerRef.current?.play?.().catch(() => {});
  };

  const poster = settings.vimeo_poster_url || settings.hero_image_url;
  const messageIndex = ratio < 0.25 ? 0 : ratio < 0.55 ? 1 : ratio < 0.8 ? 2 : 3;
  const percent = Math.round(Math.min(1, ratio) * 100);

  return (
    <div className={`fa-vsl-shell${fullscreen ? " is-fs" : ""}`} ref={shellRef}>
      <div className="fa-vsl">
        <iframe
          ref={iframeRef}
          className={`fa-vsl__frame${started ? " is-on" : ""}`}
          src={vimeoEmbedUrl(settings.vimeo_url)}
          title="Cabaña Full Access — VSL"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />

        <div className={`fa-vsl__poster${started ? " is-off" : ""}`}>
          {poster ? <img src={poster} alt="" loading="eager" /> : null}
          <span className="fa-vsl__poster-veil" aria-hidden="true" />
          <button
            type="button"
            className="fa-vsl__play"
            onClick={startPlayback}
            aria-label="Reproducir el vídeo"
          >
            <Play size={26} fill="currentColor" strokeWidth={0} />
          </button>
          <span className="fa-vsl__poster-note">Ver el programa completo</span>
        </div>

        <AnimatePresence>
          {gateOpen && (
            <motion.div
              className="fa-gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.form
                className="fa-gate__box"
                onSubmit={submitGate}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="fa-micro">Cabaña Full Access</span>
                <h3 className="fa-gate__title">{settings.gate_title}</h3>
                <p className="fa-gate__text">{settings.gate_text}</p>
                <div className="fa-gate__fields">
                  <label className="fa-gate__field">
                    <span>¿Cómo te llamas?</span>
                    <input
                      className="fa-input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      autoComplete="name"
                      enterKeyHint="next"
                    />
                  </label>
                  <label className="fa-gate__field">
                    <span>Tu correo electrónico</span>
                    <input
                      className="fa-input"
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                      enterKeyHint="go"
                    />
                  </label>
                  {error && <p className="fa-error">{error}</p>}
                  <button type="submit" className="fa-btn fa-btn--block">
                    Continuar viendo <ArrowRight size={15} />
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>

        {started && (
          <button
            type="button"
            className="fa-vsl__fs"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        )}

      </div>

      <div
        className="fa-vsl__bar"
        onClick={seek}
        role="presentation"
        aria-hidden="true"
      >
        <span className="fa-vsl__bar-fill" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>

      <div className="fa-vsl__foot">
        <span className="fa-vsl__msg">
          {sdkError ? "El vídeo no se ha podido cargar en este navegador." : MESSAGES[messageIndex]}
        </span>
        <span className="fa-vsl__time">
          {formatClock(seconds)} / {duration ? formatClock(duration) : "--:--"} · {percent}%
        </span>
      </div>

      {sdkError && !unlocked && (
        <button type="button" className="fa-btn fa-btn--ghost" onClick={onUnlock}>
          Continuar al formulario
        </button>
      )}

      {!unlocked && !sdkError && (
        <p className="fa-vsl__lock">
          <Lock size={12} />
          {started
            ? "El formulario de admisión se abre al terminar el vídeo."
            : "Pulsa play para empezar."}
        </p>
      )}
    </div>
  );
}