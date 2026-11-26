import React, { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import AdmissionDetail from "@/components/admision/admin/AdmissionDetail";
import { AVAILABILITY, BUDGETS, PROJECT_STAGES } from "@/lib/admissionForm";

const QUALIFICATIONS = ["APTO PARA AGENDAR", "EN EXPLORACIÓN", "SIN PRESUPUESTO DISPONIBLE"];
const SYNC_STATES = ["pendiente", "sincronizado", "error"];

const short = (value, max = 34) =>
  value && value.length > max ? `${value.slice(0, max)}…` : value || "—";

const dateLabel = (iso) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

const badge = (value) => {
  if (value === "APTO PARA AGENDAR" || value === "sincronizado")
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (value === "EN EXPLORACIÓN" || value === "pendiente")
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  if (value === "error") return "border-red-400/30 bg-red-400/10 text-red-300";
  return "border-white/15 bg-white/5 text-zinc-300";
};

export default function AdmissionsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    stage: "",
    budget: "",
    availability: "",
    qualification: "",
    sync: "",
    sort: "desc",
  });

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const load = useCallback(async () => {
    setLoading(true);
    const query = {};
    if (filters.country.trim()) query.country = filters.country.trim();
    if (filters.stage) query.project_stage = filters.stage;
    if (filters.budget) query.budget = filters.budget;
    if (filters.availability) query.availability = filters.availability;
    if (filters.qualification) query.qualification_status = filters.qualification;
    if (filters.sync) query.hubspot_sync_status = filters.sync;

    const sort = filters.sort === "asc" ? "created_date" : "-created_date";
    let rows = [];
    try {
      const res = await base44.entities.AdmissionSubmission.filter(query, { sort, limit: 100 });
      rows = Array.isArray(res) ? res : res?.items || [];
    } catch {
      const res = await base44.entities.AdmissionSubmission.list(sort, 100);
      rows = Array.isArray(res) ? res : res?.items || [];
    }

    const search = filters.search.trim().toLowerCase();
    if (search) {
      rows = rows.filter((item) =>
        [item.first_name, item.last_name, item.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search))
      );
    }

    setItems(rows);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = async (id) => {
    setBusy(true);
    try {
      await base44.functions.invoke("syncAdmissionSubmission", { submission_id: id });
    } finally {
      setBusy(false);
      setSelected(null);
      await load();
    }
  };

  const save = async (id, patch) => {
    await base44.entities.AdmissionSubmission.update(id, patch);
    setSelected(null);
    await load();
  };

  const reset = () =>
    setFilters({
      search: "",
      country: "",
      stage: "",
      budget: "",
      availability: "",
      qualification: "",
      sync: "",
      sort: "desc",
    });

  const selectClass =
    "rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-200 outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Solicitudes de admisión</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Registro privado en Base44. HubSpot recibe el contacto y las respuestas.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:text-white"
        >
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-3 py-2">
          <Search size={13} className="text-zinc-500" />
          <input
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Nombre o correo"
            className="w-full bg-transparent text-xs text-zinc-200 outline-none"
          />
        </label>
        <input
          value={filters.country}
          onChange={(event) => update("country", event.target.value)}
          placeholder="País"
          className={selectClass}
        />
        <select value={filters.stage} onChange={(event) => update("stage", event.target.value)} className={selectClass}>
          <option value="">Etapa del proyecto</option>
          {PROJECT_STAGES.map((option) => (
            <option key={option} value={option}>
              {short(option, 46)}
            </option>
          ))}
        </select>
        <select value={filters.budget} onChange={(event) => update("budget", event.target.value)} className={selectClass}>
          <option value="">Presupuesto</option>
          {BUDGETS.map((option) => (
            <option key={option} value={option}>
              {short(option, 46)}
            </option>
          ))}
        </select>
        <select
          value={filters.availability}
          onChange={(event) => update("availability", event.target.value)}
          className={selectClass}
        >
          <option value="">Disponibilidad</option>
          {AVAILABILITY.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={filters.qualification}
          onChange={(event) => update("qualification", event.target.value)}
          className={selectClass}
        >
          <option value="">Calificación</option>
          {QUALIFICATIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select value={filters.sync} onChange={(event) => update("sync", event.target.value)} className={selectClass}>
          <option value="">Sincronización</option>
          {SYNC_STATES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select value={filters.sort} onChange={(event) => update("sort", event.target.value)} className={selectClass}>
            <option value="desc">Más recientes</option>
            <option value="asc">Más antiguas</option>
          </select>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white"
          >
            Limpiar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> Cargando solicitudes...
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">No hay solicitudes con estos filtros.</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              <tr>
                <th className="px-3 py-3">Artista</th>
                <th className="px-3 py-3">Fecha</th>
                <th className="px-3 py-3">País</th>
                <th className="px-3 py-3">Etapa</th>
                <th className="px-3 py-3">Presupuesto</th>
                <th className="px-3 py-3">Disponibilidad</th>
                <th className="px-3 py-3">Estado</th>
                <th className="px-3 py-3">Sync</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="cursor-pointer border-t border-white/5 text-zinc-300 hover:bg-white/5"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium text-white">
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="text-[11px] text-zinc-500">{item.email}</p>
                  </td>
                  <td className="px-3 py-3">{dateLabel(item.created_date)}</td>
                  <td className="px-3 py-3">{item.country || "—"}</td>
                  <td className="px-3 py-3">{short(item.project_stage, 26)}</td>
                  <td className="px-3 py-3">{short(item.budget, 26)}</td>
                  <td className="px-3 py-3">{short(item.availability, 24)}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full border px-2 py-1 text-[10px] ${badge(item.qualification_status)}`}>
                      {item.qualification_status || "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full border px-2 py-1 text-[10px] ${badge(item.hubspot_sync_status)}`}>
                      {item.hubspot_sync_status || "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <AdmissionDetail
          item={selected}
          busy={busy}
          onClose={() => setSelected(null)}
          onSaved={save}
          onRetry={retry}
        />
      ) : null}
    </div>
  );
}