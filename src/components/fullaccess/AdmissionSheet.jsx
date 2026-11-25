import React, { useEffect } from "react";
import { X } from "lucide-react";
import AdmissionForm from "@/components/fullaccess/AdmissionForm";

export default function AdmissionSheet({ lead, settings, onSubmitted, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fa-sheet" role="dialog" aria-modal="true" aria-label="Presenta tu proyecto">
      <div className="fa-sheet__panel">
        <button
          type="button"
          className="fa-sheet__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="fa-sec-head">
          <span className="fa-eyebrow">Admisión</span>
          <h2 className="fa-display fa-h2">Presenta tu proyecto</h2>
        </div>

        <div style={{ marginTop: 22 }}>
          <AdmissionForm lead={lead} settings={settings} onSubmitted={onSubmitted} />
        </div>
      </div>
    </div>
  );
}