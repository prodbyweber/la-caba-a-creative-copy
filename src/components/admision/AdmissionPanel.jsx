import React from "react";
import { Check } from "lucide-react";
import { STAGES, REVIEW_INDEX } from "@/lib/admissionForm";

export default function AdmissionPanel({ step, stage }) {
  const total = STAGES.length;
  const completed = Math.min(step, total);
  const percent = Math.round((completed / total) * 100);
  const isReview = step === REVIEW_INDEX;

  return (
    <aside className="adm-panel">
      <div className="adm-panel__top">
        <span className="fa-eyebrow">Cabaña Full Access</span>
        <span className="adm-panel__pct">{percent}%</span>
      </div>

      <div className="adm-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <span className="adm-progress__fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="adm-panel__meta">
        <span>{isReview ? "Revisión" : `Etapa ${step + 1} de ${total}`}</span>
        <span>{completed} de {total} completadas</span>
      </div>

      <p className="adm-panel__stage">{stage.title}</p>
      <p className="adm-panel__desc">{stage.description}</p>

      <ol className="adm-steps">
        {STAGES.map((item, index) => {
          const state = index < step ? "is-done" : index === step ? "is-current" : "";
          return (
            <li key={item.key} className={`adm-step ${state}`}>
              <span className="adm-step__dot">{index < step ? <Check size={10} /> : index + 1}</span>
              {item.label}
            </li>
          );
        })}
        <li className={`adm-step ${isReview ? "is-current" : ""}`}>
          <span className="adm-step__dot">{isReview ? <Check size={10} /> : total + 1}</span>
          Revisión y envío
        </li>
      </ol>
    </aside>
  );
}