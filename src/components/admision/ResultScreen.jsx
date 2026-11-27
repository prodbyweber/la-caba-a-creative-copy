import React from "react";
import { QUALIFIED_STATUS } from "@/lib/admissionScreens";

/** Resultado de la admisión: solo la calificación por presupuesto decide. */
export default function ResultScreen({ qualification, settings, onBook }) {
  const qualified = qualification === QUALIFIED_STATUS;
  const spots = Number(settings?.available_spots || 0);

  if (!qualified) {
    return (
      <div>
        <h1 className="adm-title">Gracias por compartir tu proyecto.</h1>
        <p className="adm-result__text">
          Hemos recibido tu información correctamente. En Cabaña Creative creemos que cada
          proyecto tiene su momento. Te invitamos a seguir desarrollando tu propuesta y volver a
          contactarnos cuando tengas disponibilidad para invertir en esta etapa.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="adm-title">Has completado tu proceso de admisión.</h1>

      <p className="adm-result__text">
        Gracias por compartir tu proyecto con nosotros. Hemos recibido tu información y queremos
        conocer mejor tu propuesta artística. A continuación, te invitamos a reservar una sesión de
        descubrimiento.
      </p>

      <p className="adm-result__subtitle">El siguiente paso es conocernos.</p>

      <p className="adm-result__text">
        Será un primer encuentro por videollamada para hablar sobre tu música, conocer tu visión
        artística y explorar cómo podemos ayudarte a desarrollar tu proyecto. Queremos entender
        dónde estás y descubrir si Cabaña Full Access es el camino adecuado para ti.
      </p>

      {spots > 0 ? (
        <div className="adm-spots">
          <span className="adm-spots__number">{spots}</span>
          <span className="adm-spots__label">plazas disponibles</span>
        </div>
      ) : (
        <p className="adm-result__text adm-result__text--muted">
          Trabajamos con plazas limitadas para dedicar a cada artista el tiempo y la dirección que
          necesita.
        </p>
      )}

      <button type="button" className="adm-accept adm-result__cta" onClick={onBook}>
        Agendar sesión de descubrimiento
      </button>
    </div>
  );
}