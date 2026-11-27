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
    <div className="adm-result">
      <h1 className="adm-title">Tu proyecto ha pasado a la siguiente etapa.</h1>

      <p className="adm-result__text">Tu propuesta encaja con lo que buscamos.</p>

      <p className="adm-result__subtitle">
        El próximo paso es reservar tu sesión de descubrimiento.
      </p>

      <p className="adm-result__text">
        En esta videollamada hablaremos sobre tu música, conoceremos tu visión artística,
        resolveremos tus dudas y valoraremos si Cabaña Full Access es el programa adecuado para ti.
      </p>

      <p className="adm-result__text">
        <strong>Reserva una fecha y guárdala en tu calendario.</strong> Revisaremos el material que
        nos has compartido y, si todo está en orden, confirmaremos nuestra reunión. Si no podemos
        avanzar, te lo comunicaremos personalmente por correo electrónico.
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