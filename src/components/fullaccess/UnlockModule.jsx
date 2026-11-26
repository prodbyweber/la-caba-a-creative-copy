import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Lock } from "lucide-react";

export default function UnlockModule({ progress, unlocked, onOpenForm }) {
  const wasUnlocked = useRef(unlocked);
  const [pulse, setPulse] = useState(false);

  // Un solo latido, y solo cuando el CTA se abre en esta visita.
  useEffect(() => {
    if (unlocked && !wasUnlocked.current) {
      wasUnlocked.current = true;
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 1500);
      return () => clearTimeout(timer);
    }
    wasUnlocked.current = unlocked;
    return undefined;
  }, [unlocked]);

  return (
    <div className="fa-unlockmod">
      <p className="fa-unlockmod__hint">
        Termina de ver el video para desbloquear el acceso y enviarnos tu proyecto
      </p>

      <div className="fa-progress" aria-hidden="true">
        <span
          className="fa-progress__fill"
          style={{ width: `${Math.min(100, Math.max(0, progress) * 100)}%` }}
        />
      </div>

      <button
        type="button"
        className={`fa-cta${unlocked ? " is-open" : ""}${pulse ? " is-pulse" : ""}`}
        aria-disabled={!unlocked}
        disabled={!unlocked}
        onClick={unlocked ? onOpenForm : undefined}
      >
        Envía tu proyecto
        {unlocked ? <ArrowRight size={17} /> : <Lock size={15} />}
      </button>
    </div>
  );
}