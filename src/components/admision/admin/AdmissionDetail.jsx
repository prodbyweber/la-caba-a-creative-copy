import React from "react";
import { Loader2, RefreshCw, X } from "lucide-react";

const QUALIFICATIONS = ["APTO PARA AGENDAR", "EN EXPLORACIÓN", "SIN PRESUPUESTO DISPONIBLE"];

const dateLabel = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const Row = ({ label, value }) => (
  <div className="border-b border-white/5 py-2">
    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
    <p className="mt-1 break-words text-sm text-zinc-200">{value || "—"}</p>
  </div>
);

export default function AdmissionDetail({ item, onClose, onSaved, onRetry, busy }) {
  const [notes, setNotes] = React.useState(item.admin_notes || "");
  const [status, setStatus] = React.useState(item.qualification_status || QUALIFICATIONS[0]);
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSaved(item.id, { admin_notes: notes, qualification_status: status });
    } finally {
      setSaving(false);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(item.hubspot_contact_id || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#0b0b0c] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#ff5833]">Solicitud</p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              {item.first_name} {item.last_name}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {dateLabel(item.created_date)} · {item.submission_id}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md border border-white/10 p-2 text-zinc-400 hover:text-white">
            <X size={15} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Contacto</p>
            <div className="mt-2">
              <Row label="Correo" value={item.email} />
              <Row label="Teléfono" value={item.phone} />
              <Row label="País / Ciudad" value={[item.country, item.city].filter(Boolean).join(" · ")} />
              <Row label="Instagram" value={item.instagram} />
              <Row label="Música / perfil" value={item.music_link} />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Situación</p>
            <div className="mt-2">
              <Row label="Etapa del proyecto" value={item.project_stage} />
              <Row label="Géneros" value={(item.genres || []).join(", ")} />
              <Row label="Otro género" value={item.genre_other} />
              <Row label="Objetivos" value={(item.goals || []).join(" · ")} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Row label="Principal bloqueo" value={item.main_blocker} />
          <Row label="Tipo de lanzamiento" value={item.release_type} />
          <Row label="Fecha objetivo" value={item.release_date} />
          <Row label="Disponibilidad" value={item.availability} />
          <Row label="Presupuesto" value={item.budget} />
          <Row label="Fuente" value={[item.source, item.referrer].filter(Boolean).join(" · ")} />
        </div>

        <div className="mt-6 rounded-xl border border-white/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Estado de calificación</p>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            {QUALIFICATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-zinc-500">Notas internas</p>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-3 rounded-md bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">HubSpot</p>
              <p className="mt-1 text-sm text-zinc-200">
                {item.hubspot_sync_status === "sincronizado"
                  ? "Sincronizado"
                  : item.hubspot_sync_status === "error"
                  ? "Error de sincronización"
                  : "Pendiente"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Contacto: {item.hubspot_contact_id || "—"} · intentos {item.hubspot_attempts || 0}
              </p>
              {item.hubspot_contact_id ? (
                <button type="button" onClick={copyId} className="mt-1 text-[11px] text-[#ff5833]">
                  {copied ? "ID copiado" : "Copiar ID del contacto"}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-200 hover:text-white disabled:opacity-50"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Reintentar sincronización
            </button>
          </div>
          {item.hubspot_sync_error ? (
            <p className="mt-3 break-words text-[11px] text-red-300">{item.hubspot_sync_error}</p>
          ) : null}
          {item.hubspot_sync_warning ? (
            <p className="mt-2 break-words text-[11px] text-amber-300">{item.hubspot_sync_warning}</p>
          ) : null}
          <p className="mt-2 text-[11px] text-zinc-500">
            Última sincronización: {dateLabel(item.hubspot_last_sync)}
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Historial</p>
          <ul className="mt-2 space-y-1">
            {(item.activity || []).map((entry, index) => (
              <li key={`${entry}-${index}`} className="text-[11px] text-zinc-400">
                {entry}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Payload original</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-[10px] text-zinc-400">
            {item.payload_json || "—"}
          </pre>
        </div>
      </div>
    </div>
  );
}