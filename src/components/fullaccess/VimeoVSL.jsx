import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import {
  vimeoEmbedUrl,
  formatClock,
  readStoredLead,
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

export default function VimeoVSL({ settings, lead, onLead, onUnlock, unlocked }) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const leadRef = useRef(lead);
  const maxRatioRef = useRef(0);
  const gateRef = useRef(false);

  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ratio, setRatio] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  const [form, setForm] = useState({ name: lead?.name || "", email: lead?.email || "" });
  const [error, setError] = useState("");
  const [sdkError, setSdkError] = useState(false);

  useEffect(() => {
    leadRef.current = lead;
  }, [lead]);

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
          setSeconds(data.seconds || 0);
          setDuration(dur);
          const r = dur ? (data.seconds || 0) / dur : 0;
          setRatio(r);
          if (r > maxRatioRef.current) {
            maxRatioRef.current = r;
            try {
              localStorage.setItem(PROGRESS_KEY, String(data.seconds || 0));
            } catch {
              /* ignore */
            }
          }
          const gate = Number(settings.gate_seconds) || 65;
          if (!leadRef.current && !gateRef.current && data.seconds >= gate) {
            gateRef.current = true;
            player.pause().catch(() => {});
            setGateOpen(true);
          }
        });

        player.on("ended", () => {
          if (maxRatioRef.current >= 0.9) {
            try {
              localStorage.setItem(UNLOCK_KEY, "1");
            } catch {
              /* ignore */
            }
            onUnlock();
          }
        });

        player.ready().then(() => {
          const saved = Number(localStorage.getItem(PROGRESS_KEY) || 0);
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
  }, [settings.gate_seconds, onUnlock]);

  const submitGate = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name) return setError("Escribe tu nombre.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Revisa tu correo.");
    setError("");
    const next = { name, email };
    storeLead(next);
    onLead(next);
    setGateOpen(false);
    playerRef.current?.play?.().catch(() => {});
  };

  const messageIndex = ratio < 0.25 ? 0 : ratio < 0.55 ? 1 : ratio < 0.8 ? 2 : 3;

  return (
    <div>
      <div className="fa-vsl">
        <iframe
          ref={iframeRef}
          src={vimeoEmbedUrl(settings.vimeo_url)}
          title="Cabaña Full Access — VSL"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />

        <AnimatePresence>
          {gateOpen && (
            <motion.div
              className="fa-gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
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
                  <input
                    className="fa-input"
                    placeholder="Tu nombre"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                  />
                  <input
                    className="fa-input"
                    placeholder="Tu correo"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                  {error && <p className="fa-error">{error}</p>}
                  <button type="submit" className="fa-btn fa-btn--block">
                    Seguir viendo <ArrowRight size={15} />
                  </button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fa-vsl__track">
        <div className="fa-vsl__fill" style={{ width: `${Math.min(100, ratio * 100)}%` }} />
      </div>

      <div className="fa-vsl__foot">
        <span className="fa-vsl__msg">
          {sdkError ? "Vídeo no disponible en este navegador." : MESSAGES[messageIndex]}
        </span>
        <span className="fa-vsl__time">
          {formatClock(seconds)} / {duration ? formatClock(duration) : "--:--"}
        </span>
      </div>

      {sdkError && !unlocked && (
        <button
          type="button"
          className="fa-btn fa-btn--ghost"
          style={{ marginTop: 16 }}
          onClick={onUnlock}
        >
          Continuar al formulario
        </button>
      )}

      {!unlocked && !sdkError && (
        <p className="fa-tz" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock size={12} /> El formulario de admisión se desbloquea al terminar el vídeo.
        </p>
      )}
    </div>
  );
}