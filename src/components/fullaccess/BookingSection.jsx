import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Video } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { localTimeLabel } from "@/lib/fullAccess";

const tz = localTimeLabel();

const dayKey = (iso) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso)
  );
const dayLabel = (iso) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(
    new Date(iso)
  );
const timeLabel = (iso) =>
  new Intl.DateTimeFormat("es-ES", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const fullLabel = (iso) =>
  new Intl.DateTimeFormat("es-ES", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default function BookingSection({ application, settings }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);
  const [email, setEmail] = useState(application.email || "");
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("getAdmissionAvailability", {
          days: settings.booking_days_ahead,
          duration: settings.booking_duration,
          start_hour: settings.booking_start_hour,
          end_hour: settings.booking_end_hour,
          timezone: settings.booking_timezone,
        });
        if (!alive) return;
        if (res.data?.error) throw new Error(res.data.error);
        const list = res.data?.slots || [];
        setSlots(list);
        if (list.length) setDay(dayKey(list[0]));
      } catch (err) {
        if (alive) setError(err?.message || "La agenda no está disponible ahora mismo.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [settings.booking_days_ahead, settings.booking_duration, settings.booking_start_hour, settings.booking_end_hour, settings.booking_timezone]);

  const days = useMemo(() => {
    const map = new Map();
    slots.forEach((iso) => {
      const key = dayKey(iso);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(iso);
    });
    return Array.from(map.entries());
  }, [slots]);

  const book = async () => {
    if (!slot) return;
    setBooking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("bookAdmissionSession", {
        application_id: application.id,
        start: slot,
        email,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setConfirmed(res.data);
    } catch (err) {
      setError(err?.message || "No hemos podido confirmar la sesión.");
    } finally {
      setBooking(false);
    }
  };

  if (confirmed) {
    return (
      <div className="fa-confirm">
        <span className="fa-eyebrow">Admisión</span>
        <h3 className="fa-display fa-h3" style={{ marginTop: 12 }}>
          {settings.confirm_title}
        </h3>
        <p className="fa-lead" style={{ marginTop: 12 }}>
          {settings.confirm_text}
        </p>
        <div className="fa-confirm__rows">
          <div className="fa-confirm__row">
            <span>Artista</span>
            <span>{application.artist_name || application.contact_name}</span>
          </div>
          <div className="fa-confirm__row">
            <span>Fecha</span>
            <span>{fullLabel(confirmed.start)}</span>
          </div>
          <div className="fa-confirm__row">
            <span>Zona horaria</span>
            <span>{tz}</span>
          </div>
          {confirmed.meeting_link ? (
            <div className="fa-confirm__row">
              <span>Videollamada</span>
              <a href={confirmed.meeting_link} target="_blank" rel="noreferrer">
                Google Meet →
              </a>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="fa-booking">
      {loading ? (
        <p className="fa-lead" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 size={16} className="animate-spin" /> Consultando disponibilidad real...
        </p>
      ) : error && !days.length ? (
        <p className="fa-demo__empty">
          {error} Escríbenos y coordinamos la sesión manualmente.
        </p>
      ) : (
        <>
          <div className="fa-days">
            {days.map(([key, list]) => (
              <button
                type="button"
                key={key}
                className={`fa-day${day === key ? " is-on" : ""}`}
                onClick={() => {
                  setDay(key);
                  setSlot(null);
                }}
              >
                <span className="fa-day__dow">{dayLabel(list[0]).split(" ")[0]}</span>
                <span className="fa-day__num">{dayLabel(list[0]).split(" ")[1]}</span>
                <span className="fa-day__mon">{dayLabel(list[0]).split(" ").slice(-1)[0]}</span>
              </button>
            ))}
          </div>

          <div className="fa-slots">
            {(days.find(([key]) => key === day)?.[1] || []).map((iso) => (
              <button
                type="button"
                key={iso}
                className={`fa-slot${slot === iso ? " is-on" : ""}`}
                onClick={() => setSlot(iso)}
              >
                {timeLabel(iso)}
              </button>
            ))}
          </div>

          <p className="fa-tz">
            Horarios en tu zona horaria ({tz}). Sesión de {settings.booking_duration} minutos.
          </p>

          <div style={{ marginTop: 22, maxWidth: 420 }}>
            <label className="fa-field">
              <span className="fa-label">Confirma tu correo</span>
              <input className="fa-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>

          {error ? <p className="fa-error">{error}</p> : null}

          <button
            type="button"
            className="fa-btn"
            style={{ marginTop: 20 }}
            onClick={book}
            disabled={!slot || booking}
          >
            {booking ? <Loader2 size={15} className="animate-spin" /> : <Video size={15} />}
            Confirmar sesión
          </button>
        </>
      )}
    </div>
  );
}