import React, { useState } from "react";

/** Agenda de Google Calendar de Cabaña Creative (valor por defecto del ajuste "Booking URL"). */
export const DEFAULT_BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1pN3McfXODse1eNt3OZsbUqLoCBduWIL5nlYTmIhxhZCrD6F59OS836yvUiROEGT95bfPqvDUp?gv=true";

/** La agenda manda: solo el título, dos líneas de contexto y el calendario. */
export default function BookingScreen({ settings }) {
  const src = (settings?.booking_url || "").trim() || DEFAULT_BOOKING_URL;
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="adm-booking-screen">
      <h1 className="adm-title">Reserva tu videollamada de descubrimiento</h1>
      <p className="adm-hint-inline">
        Una conversación 1 a 1 para conocer tu música y valorar si Cabaña Full Access es el camino
        adecuado para ti.
      </p>

      <div className="adm-booking">
        {!loaded ? <div className="adm-booking__skeleton" aria-hidden="true" /> : null}
        <iframe
          src={src}
          title="Reserva tu videollamada con Cabaña Creative"
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>
    </div>
  );
}