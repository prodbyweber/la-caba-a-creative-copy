import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ContactScreen from "@/components/admision/ContactScreen";
import StageScreen from "@/components/admision/StageScreen";
import LocationScreen from "@/components/admision/LocationScreen";
import ReleaseScreen from "@/components/admision/ReleaseScreen";
import BookingScreen from "@/components/admision/BookingScreen";
import { EMPTY_ADMISSION, stepValues, validateScreen } from "@/lib/admissionScreens";

const SCREENS = [ContactScreen, StageScreen, LocationScreen, ReleaseScreen, BookingScreen];
const LAST_FORM_SCREEN = 3;

export default function AdmissionFlow({ settings }) {
  const reduce = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [data, setData] = useState(EMPTY_ADMISSION);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const submissionRef = useRef(null);
  const honeypotRef = useRef(null);

  const Screen = SCREENS[screen];

  const set = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const persist = async (step) => {
    const params = new URLSearchParams(window.location.search);
    const response = await base44.functions.invoke("saveAdmissionStep", {
      step,
      submission_id: submissionRef.current?.submission_id || "",
      values: stepValues(step, data),
      company: honeypotRef.current?.value || "",
      source: "admision",
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    });

    const body = response?.data || {};
    if (body.error) {
      const error = new Error(body.error);
      error.fields = body.errors || {};
      throw error;
    }
    if (!body.submission?.id) throw new Error("No hemos podido guardar tus datos.");
    submissionRef.current = body.submission;
    return body.submission;
  };

  const goTo = (next) => {
    setScreen(next);
    setErrors({});
    setSaveError("");
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || screen === SCREENS.length - 1) return;

    const found = validateScreen(screen, data);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      await persist(screen + 1);
      goTo(screen + 1);
    } catch (error) {
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

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={screen} className="adm-screen" {...motionProps}>
              <Screen data={data} set={set} errors={errors} settings={settings} />
            </motion.div>
          </AnimatePresence>

          {saveError ? <p className="adm-error adm-error--block">{saveError}</p> : null}

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

            {screen <= LAST_FORM_SCREEN ? (
              <button type="submit" className="adm-accept" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Aceptar
              </button>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}