import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Agenda de Google Calendar de Cabaña Creative (valor por defecto del ajuste "Booking URL"). */
export const DEFAULT_BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1pN3McfXODse1eNt3OZsbUqLoCBduWIL5nlYTmIhxhZCrD6F59OS836yvUiROEGT95bfPqvDUp?gv=true";

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      return true;
    } catch {
      return false;
    }
  }
}

export default function BookingScreen({ data, settings }) {
  const src = (settings?.booking_url || "").trim() || DEFAULT_BOOKING_URL;
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState("");

  const rows = [
    { key: "first_name", label: "Nombre", value: data.first_name || "" },
    { key: "last_name", label: "Apellido", value: data.last_name || "" },
    { key: "email", label: "Email", value: data.email || "" },
  ];

  const copy = async (key, value) => {
    if (!value) return;
    const done = await writeClipboard(value);
    if (!done) return;
    setCopied(key);
    setTimeout(() => setCopied(""), 1800);
  };

  return (
    <div>
      <h1 className="adm-title">Reserva tu videollamada.</h1>

      <div className="adm-copydata">
        <p className="adm-copydata__title">Reserva con estos datos</p>
        <ul className="adm-copydata__list">
          {rows.map((row) => (
            <li key={row.key}>
              <span className="adm-copydata__label">{row.label}</span>
              <span className="adm-copydata__value">{row.value || "—"}</span>
              <button
                type="button"
                onClick={() => copy(row.key, row.value)}
                aria-label={`Copiar ${row.label.toLowerCase()}`}
                disabled={!row.value}
              >
                {copied === row.key ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="adm-copydata__all"
          onClick={() => copy("all", rows.map((row) => row.value).join("\n"))}
        >
          {copied === "all" ? "Copiado" : "Copiar todo"}
        </button>
      </div>

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