import React from "react";
import { ArrowRight, Lock } from "lucide-react";

export default function UnlockModule({ progress, unlocked, onOpenForm }) {
  return (
    <div className="fa-unlockmod">
      <p className="fa-unlockmod__hint">Es importante que entiendas el programa</p>

      <div className="fa-progress" aria-hidden="true">
        <span
          className="fa-progress__fill"
          style={{ width: `${Math.min(100, Math.max(0, progress) * 100)}%` }}
        />
      </div>

      <button
        type="button"
        className={`fa-cta${unlocked ? " is-open" : ""}`}
        aria-disabled={!unlocked}
        disabled={!unlocked}
        onClick={unlocked ? onOpenForm : undefined}
      >
        Enviar proyecto
        {unlocked ? <ArrowRight size={17} /> : <Lock size={15} />}
      </button>
    </div>
  );
}