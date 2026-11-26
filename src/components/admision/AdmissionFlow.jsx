import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdmissionPanel from "@/components/admision/AdmissionPanel";
import AdmissionStageBody from "@/components/admision/AdmissionStageBody";
import AdmissionReview from "@/components/admision/AdmissionReview";
import AdmissionResult from "@/components/admision/AdmissionResult";
import { EMPTY_FORM, REVIEW_INDEX, STAGES, validateStage } from "@/lib/admissionForm";

const REVIEW_STAGE = {
  title: "Tu proyecto está un paso más cerca.",
  description: "Revisa tus respuestas antes de enviar la solicitud.",
};

export default function AdmissionFlow({ settings }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const idempotencyRef = useRef("");
  const honeypotRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!idempotencyRef.current && typeof crypto !== "undefined" && crypto.randomUUID) {
      idempotencyRef.current = crypto.randomUUID();
    }
  }, []);

  const isReview = step === REVIEW_INDEX;
  const stage = isReview ? REVIEW_STAGE : STAGES[step];

  const set = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const scrollToCard = () => {
    if (!cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const goTo = (next) => {
    setStep(next);
    setSubmitError("");
    window.requestAnimationFrame(scrollToCard);
  };

  const submit = async () => {
    for (let index = 0; index < STAGES.length; index += 1) {
      const found = validateStage(index, data);
      if (Object.keys(found).length) {
        setErrors(found);
        setSubmitError("Revisa los campos marcados antes de enviar.");
        goTo(index);
        return;
      }
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const params = new URLSearchParams(window.location.search);
      const payload = {
        ...data,
        idempotency_key: idempotencyRef.current,
        company: honeypotRef.current?.value || "",
        source: "admision",
        referrer: typeof document !== "undefined" ? document.referrer || "" : "",
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || "",
      };

      const response = await base44.functions.invoke("submitAdmission", payload);
      const body = response?.data || {};
      if (body.error) throw new Error(body.error);
      if (!body.submission?.id) throw new Error("No hemos podido guardar tu solicitud.");
      setResult(body.submission);
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.error ||
          error?.message ||
          "No hemos podido enviar tu solicitud. Inténtalo de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (isReview) {
      submit();
      return;
    }
    const found = validateStage(step, data);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    setErrors({});
    goTo(step + 1);
  };

  const goBack = () => {
    setErrors({});
    goTo(Math.max(0, step - 1));
  };

  if (result) {
    return (
      <div className="adm-wrap">
        <AdmissionResult submission={result} settings={settings} />
      </div>
    );
  }

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="adm-wrap">
      <div className="adm-grid">
        <AdmissionPanel step={step} stage={stage} />

        <div className="adm-card" ref={cardRef}>
          <input
            ref={honeypotRef}
            className="adm-honeypot"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} className="adm-stage" {...motionProps}>
              <span className="adm-stage__count">
                {isReview ? "Revisión" : `Etapa ${step + 1} de ${STAGES.length}`}
              </span>
              <h1 className="fa-display adm-stage__title">{stage.title}</h1>
              <p className="adm-stage__desc">{stage.description}</p>

              {isReview ? (
                <AdmissionReview data={data} onEdit={goTo} />
              ) : (
                <>
                  <p className="adm-stage__question">{stage.question}</p>
                  <AdmissionStageBody step={step} data={data} set={set} errors={errors} />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {submitError ? <p className="fa-error">{submitError}</p> : null}

          <div className="adm-nav">
            {step > 0 ? (
              <button type="button" className="fa-btn fa-btn--ghost" onClick={goBack} disabled={submitting}>
                <ArrowLeft size={15} />
                Atrás
              </button>
            ) : null}

            <div className="adm-nav__right">
              <button type="button" className="fa-btn" onClick={goNext} disabled={submitting}>
                {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
                {isReview ? "Enviar mi solicitud" : "Continuar"}
                {submitting ? null : <ArrowRight size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}