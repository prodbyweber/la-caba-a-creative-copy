import React from "react";
import { ArrowRight, CalendarClock, Check } from "lucide-react";
import { QUALIFICATION, RESULT_COPY } from "@/lib/admissionForm";

function withPrefill(base, submission) {
  try {
    const url = new URL(base);
    if (submission.email) url.searchParams.set("email", submission.email);
    if (submission.first_name) url.searchParams.set("firstname", submission.first_name);
    if (submission.last_name) url.searchParams.set("lastname", submission.last_name);
    return url.toString();
  } catch {
    return base;
  }
}

export default function AdmissionResult({ submission, settings }) {
  const status = submission?.qualification_status;
  const copy = RESULT_COPY[status] || RESULT_COPY[QUALIFICATION.EXPLORANDO];
  const meetings = String(settings?.meetings_url || "").trim();
  const canBook = status === QUALIFICATION.APTO;
  const bookUrl = canBook && meetings ? withPrefill(meetings, submission) : "";
  const pending = submission?.hubspot_sync_status === "error";

  return (
    <div className="adm-result">
      <span className="adm-result__mark">
        {canBook ? <CalendarClock size={20} /> : <Check size={20} />}
      </span>
      <h1 className="fa-display adm-stage__title">{copy.title}</h1>
      <p className="adm-result__text">{copy.text}</p>

      {canBook ? (
        <>
          <div className="adm-result__actions">
            {bookUrl ? (
              <a className="fa-btn" href={bookUrl} target="_blank" rel="noreferrer">
                Reservar una conversación
                <ArrowRight size={16} />
              </a>
            ) : (
              <span className="fa-btn" aria-disabled="true" style={{ opacity: 0.5, cursor: "default" }}>
                Agenda en configuración
              </span>
            )}
          </div>
          <p className="adm-result__mail">
            {bookUrl
              ? `Usa el mismo correo al reservar: ${submission.email}`
              : `Te escribiremos a ${submission.email} para reservar la conversación.`}
          </p>
          <p className="adm-result__note">
            La conversación es una valoración del proyecto: no supone la admisión automática en Cabaña Full Access.
          </p>
        </>
      ) : null}

      {pending ? (
        <p className="adm-result__note">
          Tu solicitud está guardada. La sincronización con el CRM queda pendiente y el equipo la revisará.
        </p>
      ) : null}
    </div>
  );
}