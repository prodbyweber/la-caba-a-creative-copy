import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ContactScreen from "@/components/admision/ContactScreen";
import CountryScreen from "@/components/admision/CountryScreen";
import StageScreen from "@/components/admision/StageScreen";
import SoundScreen from "@/components/admision/SoundScreen";
import MusicScreen from "@/components/admision/MusicScreen";
import ReleaseScreen from "@/components/admision/ReleaseScreen";
import BudgetScreen from "@/components/admision/BudgetScreen";
import AvailabilityScreen from "@/components/admision/AvailabilityScreen";
import BookingScreen from "@/components/admision/BookingScreen";
import ResultScreen from "@/components/admision/ResultScreen";
import LegalModal from "@/components/admision/LegalModal";
import {
  createEmptyAdmission,
  QUALIFIED_STATUS,
  validateScreen,
} from "@/lib/admissionScreens";
import { browserCountryCode } from "@/lib/phoneCountries";

const SCREENS = [
  ContactScreen,
  CountryScreen,
  StageScreen,
  SoundScreen,
  MusicScreen,
  ReleaseScreen,
  BudgetScreen,
  AvailabilityScreen,
];
const LAST_FORM_SCREEN = SCREENS.length - 1;

const readParams = () => new URLSearchParams(window.location.search);

const LOGO =
  "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/7947f343ed3f736881e57cb4f568e85d_isotipo-cabana-creative.png/v1/fit/w_192,h_192,al_c,q_90/file.png";

export default function AdmissionFlow({ settings }) {
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [phase, setPhase] = useState("form");
  const [legal, setLegal] = useState(null);
  const [data, setData] = useState(() => createEmptyAdmission(browserCountryCode()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [result, setResult] = useState(null);
  const submissionRef = useRef(null);
  const honeypotRef = useRef(null);
  const screenRef = useRef(null);
  const lockRef = useRef(false);

  const booking = phase === "booking";
  const Screen = SCREENS[screen] || null;
  const qualified = result?.qualification_status === QUALIFIED_STATUS;

  // La tarjeta sigue al teclado: se ancla al área visible real del navegador.
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty("--adm-viewport", `${Math.round(viewport.height)}px`);
      root.style.setProperty("--adm-offset", `${Math.round(viewport.offsetTop)}px`);
    };
    apply();
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    return () => {
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
      root.style.removeProperty("--adm-viewport");
      root.style.removeProperty("--adm-offset");
    };
  }, []);

  // El campo que se está escribiendo nunca queda bajo el teclado.
  useEffect(() => {
    const keepVisible = (field) => {
      const box = screenRef.current;
      if (!box || !field) return;
      const frame = box.getBoundingClientRect();
      const rect = field.getBoundingClientRect();
      const top = frame.top + 58;
      const bottom = frame.bottom - 22;
      if (rect.top < top) box.scrollTop -= top - rect.top;
      else if (rect.bottom > bottom) box.scrollTop += rect.bottom - bottom;
    };

    const focused = () => {
      const el = document.activeElement;
      return el && el.closest && el.closest(".adm-screen") ? el : null;
    };

    const onFocus = (event) => {
      const field = event.target;
      if (!field.matches || !field.matches("input, textarea, select")) return;
      // El teclado tarda en asentarse: se recoloca cuando ya tiene su altura final.
      [120, 320, 620].forEach((delay) => {
        setTimeout(() => {
          if (document.activeElement === field) keepVisible(field);
        }, delay);
      });
    };

    const onViewportChange = () => {
      const field = focused();
      if (field) setTimeout(() => keepVisible(field), 80);
    };

    const viewport = window.visualViewport;
    document.addEventListener("focusin", onFocus);
    if (viewport) {
      viewport.addEventListener("resize", onViewportChange);
      viewport.addEventListener("scroll", onViewportChange);
    }
    return () => {
      document.removeEventListener("focusin", onFocus);
      if (viewport) {
        viewport.removeEventListener("resize", onViewportChange);
        viewport.removeEventListener("scroll", onViewportChange);
      }
    };
  }, []);

  const set = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const goTo = (next) => {
    setScreen(next);
    setErrors({});
    setSaveError("");
    if (screenRef.current) screenRef.current.scrollTop = 0;
  };

  const tracking = () => {
    const params = readParams();
    return {
      source: params.get("source") || "direct",
      source_url: window.location.href,
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    };
  };

  /** Borrador: se guarda al final de cada pantalla, sin sincronizar con HubSpot. */
  const persist = async (step) => {
    const response = await base44.functions.invoke("saveAdmissionStep", {
      step,
      submission_id: submissionRef.current?.submission_id || "",
      values: data,
      company: honeypotRef.current?.value || "",
      ...tracking(),
    });

    const body = response?.data || {};
    if (body.error) {
      const error = new Error(body.error);
      error.fields = body.errors || {};
      throw error;
    }
    if (!body.submission?.submission_id) throw new Error("No hemos podido guardar tus datos.");
    submissionRef.current = body.submission;
    return body.submission;
  };

  /** Envío único con todas las respuestas; después se sincroniza con HubSpot. */
  const finish = async () => {
    const response = await base44.functions.invoke("completeAdmission", {
      submission_id: submissionRef.current?.submission_id || "",
      values: data,
      ...tracking(),
    });

    const body = response?.data || {};
    if (body.error) {
      const error = new Error(body.error);
      error.fields = body.errors || {};
      throw error;
    }
    if (!body.submission) throw new Error("No hemos podido enviar tu solicitud.");
    submissionRef.current = body.submission;
    setResult(body.submission);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || lockRef.current || phase !== "form") return;

    const found = validateScreen(screen, data);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      if (screen < LAST_FORM_SCREEN) {
        await persist(screen + 1);
        goTo(screen + 1);
      } else {
        // Doble clic: se bloquea el botón hasta confirmar el guardado.
        lockRef.current = true;
        await finish();
        setPhase("result");
      }
    } catch (error) {
      lockRef.current = false;
      setSaveError(
        error?.response?.data?.error ||
          error?.message ||
          "No hemos podido guardar tus datos. Inténtalo de nuevo."
      );
      if (error?.fields) setErrors(error.fields);
    } finally {
      setSaving(false);
    }
  };

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <>
      <div className="adm-wrap">
        <form
          className={`adm-shell${booking ? " adm-shell--wide" : ""}`}
          onSubmit={handleSubmit}
          noValidate
        >
          <div className={`adm-card${booking ? " adm-card--booking" : ""}`}>
            <a className="adm-brand" href="/start" aria-label="Cabaña Creative">
              <img
                src={LOGO}
                alt="Cabaña Creative"
                width="30"
                height="30"
                loading="eager"
                decoding="async"
                draggable={false}
              />
            </a>

            <input
              ref={honeypotRef}
              className="adm-honeypot"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="adm-screen" ref={screenRef}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={phase === "form" ? screen : phase}
                  className="adm-screen__inner"
                  {...motionProps}
                >
                  {phase === "booking" ? (
                    <BookingScreen settings={settings} />
                  ) : phase === "result" ? (
                    <ResultScreen
                      qualification={result?.qualification_status}
                      settings={settings}
                      onBook={() => setPhase("booking")}
                    />
                  ) : (
                    <Screen data={data} set={set} errors={errors} settings={settings} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {saveError ? <p className="adm-error adm-error--block">{saveError}</p> : null}

            {phase === "form" ? (
              <div className="adm-nav">
                {screen > 0 ? (
                  <button
                    type="button"
                    className="adm-back"
                    onClick={() => goTo(screen - 1)}
                    disabled={saving}
                    aria-label="Atrás"
                  >
                    <ArrowLeft size={18} />
                  </button>
                ) : null}

                <button type="submit" className="adm-accept" disabled={saving}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Aceptar
                </button>
              </div>
            ) : null}

            <div className="adm-legal">
              <button
                type="button"
                className="adm-legal__link"
                onClick={() => setLegal("privacy")}
              >
                Privacidad
              </button>
              <span className="adm-legal__dot" aria-hidden="true">
                ·
              </span>
              <button type="button" className="adm-legal__link" onClick={() => setLegal("data")}>
                Protección de datos
              </button>
            </div>
          </div>
        </form>
      </div>

      {legal ? <LegalModal doc={legal} onClose={() => setLegal(null)} /> : null}
    </>
  );
}