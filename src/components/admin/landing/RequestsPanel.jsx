import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, Mail, ExternalLink, RefreshCw } from "lucide-react";

const STATUSES = ["nueva", "revisada", "aprobada", "rechazada"];
const STATUS_STYLE = {
  nueva: "border-blue-400/30 text-blue-300",
  revisada: "border-amber-400/30 text-amber-300",
  aprobada: "border-emerald-400/30 text-emerald-300",
  rechazada: "border-red-400/30 text-red-300",
};

export default function RequestsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.AccessRequest.list("-created_date", 200);
      setItems(list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    await base44.entities.AccessRequest.update(id, { status });
  };

  const remove = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await base44.entities.AccessRequest.delete(id);
  };

  const visible = filter === "todas" ? items : items.filter((i) => i.status === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {["todas", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
              filter === s
                ? "border-[#ff5833] text-white bg-[#ff5833]/15"
                : "border-white/10 text-white/40 hover:text-white/80"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          className="ml-auto flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white"
        >
          <RefreshCw size={11} /> Actualizar
        </button>
      </div>

      {loading && <p className="text-[11px] text-white/30">Cargando…</p>}
      {!loading && visible.length === 0 && <p className="text-[11px] text-white/30">No hay registros.</p>}

      {visible.map((item) => (
        <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-white">{item.name}</span>
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 text-white/40">
              {item.type === "message" ? "mensaje" : "acceso"}
            </span>
            <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${STATUS_STYLE[item.status] || "border-white/10 text-white/40"}`}>
              {item.status}
            </span>
            <span className="text-[10px] text-white/25 ml-auto">
              {item.created_date ? new Date(item.created_date).toLocaleDateString("es-ES") : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/50">
            <a href={`mailto:${item.email}`} className="flex items-center gap-1 hover:text-white">
              <Mail size={10} /> {item.email}
            </a>
            {item.artist_name && <span>· {item.artist_name}</span>}
            {item.music_link && (
              <a
                href={item.music_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#ff8f74] hover:text-[#ff5833]"
              >
                <ExternalLink size={10} /> música
              </a>
            )}
          </div>

          {item.message && <p className="text-[11px] text-white/60 mt-2 whitespace-pre-wrap">{item.message}</p>}

          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(item.id, s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                  item.status === s
                    ? "border-[#ff5833] text-white bg-[#ff5833]/15"
                    : "border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="ml-auto p-1.5 text-white/25 hover:text-red-400"
              aria-label="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}