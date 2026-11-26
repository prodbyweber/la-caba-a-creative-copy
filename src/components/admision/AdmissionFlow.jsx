import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ContactScreen from "@/components/admision/ContactScreen";
import StageScreen from "@/components/admision/StageScreen";
import LocationScreen from "@/components/admision/LocationScreen";
import SoundScreen from "@/components/admision/SoundScreen";
import GoalsScreen from "@/components/admision/GoalsScreen";
import BlockerScreen from "@/components/admision/BlockerScreen";
import ReleaseScreen from "@/components/admision/ReleaseScreen";
import AvailabilityScreen from "@/components/admision/AvailabilityScreen";
import BookingScreen from "@/components/admision/BookingScreen";
import ResultScreen from "@/components/admision/ResultScreen";
import {
  createEmptyAdmission,
  QUALIFIED_STATUS,
  validateScreen,
} from "@/lib/admissionScreens";
import { browserCountryCode } from "@/lib/phoneCountries";

const SCREENS = [
  ContactScreen,
  StageScreen,
  LocationScreen,
  SoundScreen,
  GoalsScreen,
  BlockerScreen,
  ReleaseScreen,
  AvailabilityScreen,
];
const LAST_FORM_SCREEN = SCREENS.length - 1;
const FINAL_SCREEN = SCREENS.length;

const readParams = () => new URLSearchParams(window.location.search);

export default function AdmissionFlow({ settings }) {
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [data, setData] = useState(() => createEmptyAdmission(browserCountryCode()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [result, setResult] = useState(null);
  const submissionRef = useRef(null);
  const honeypotRef = useRef(null);
  const screenRef = useRef(null);
  const lockRef = useRef(false);

  const done = screen === FINAL_SCREEN;
  const Screen = SCREENS[screen] || null;
  const qualified = result?.qualification_status === QUALIFIED_STATUS;

  // La tarjeta sigue al teclado: el campo enfocado y el botón quedan visibles.
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
    if (saving || lockRef.current || done) return;

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
        lockRef.current = true;
        await finish();
        goTo(FINAL_SCREEN);
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
    <div className="adm-wrap">
      <form className="adm-shell" onSubmit={handleSubmit} noValidate>
        <div className="adm-card">
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
              <motion.div key={done ? "final" : screen} className="adm-screen__inner" {...motionProps}>
                {done ? (
                  qualified ? (
                    <BookingScreen data={data} settings={settings} />
                  ) : (
                    <ResultScreen qualification={result?.qualification_status} />
                  )
                ) : (
                  <Screen data={data} set={set} errors={errors} settings={settings} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {saveError ? <p className="adm-error adm-error--block">{saveError}</p> : null}

          {!done ? (
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
        </div>
      </form>
    </div>
  );
}