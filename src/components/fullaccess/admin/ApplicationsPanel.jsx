import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

const STATUSES = ["nueva", "revisada", "sesion_agendada", "cerrada", "rechazada"];

export default function ApplicationsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    const res = await base44.entities.FullAccessApplication.list("-created_date", 100);
    setItems(res || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    setBusy(id);
    await base44.entities.FullAccessApplication.update(id, { status });
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setBusy(null);
  };

  const retry = async (id) => {
    setBusy(id);
    try {
      await base44.functions.invoke("syncFullAccessApplication", { application_id: id });
      await load();
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 size={14} className="animate-spin" /> Cargando solicitudes...
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-white">Solicitudes de admisión</h2>
      <p className="mt-1 text-xs text-zinc-500">
        El CRM principal es HubSpot. Aquí solo se conserva el registro técnico y el estado de envío.
      </p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/10 bg-[#111112] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  {item.artist_name || item.contact_name || "Sin nombre"}
                </p>
                <p className="text-xs text-zinc-500">{item.email}</p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {item.genres || "Sin géneros"} · {item.stage || "Sin etapa"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.status || "nueva"}
                  onChange={(e) => setStatus(item.id, e.target.value)}
                  className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white"
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => retry(item.id)}
                  disabled={busy === item.id}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1.5 text-xs text-zinc-300"
                >
                  {busy === item.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  HubSpot
                </button>
              </div>
            </div>

            <div className="mt-3 grid gap-1 text-[11px] text-zinc-500 sm:grid-cols-2">
              <span>Sincronización: {item.hubspot_sync_status || "pendiente"}</span>
              <span>Reunión: {item.meeting_start ? new Date(item.meeting_start).toLocaleString("es-ES") : "—"}</span>
              {item.hubspot_sync_error ? (
                <span className="sm:col-span-2 text-red-400">{item.hubspot_sync_error}</span>
              ) : null}
              {item.meeting_link ? (
                <a href={item.meeting_link} target="_blank" rel="noreferrer" className="text-[#ff5833]">
                  Enlace de la videollamada
                </a>
              ) : null}
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-zinc-500">
            Todavía no hay solicitudes.
          </p>
        ) : null}
      </div>
    </div>
  );
}