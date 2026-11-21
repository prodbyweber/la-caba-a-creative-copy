import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Trash2, Download, RefreshCw } from "lucide-react";

const STATUSES = ["nueva", "revisada", "contactada", "cerrada"];

const badge = {
  nueva: "border-blue-400/30 text-blue-300",
  revisada: "border-amber-400/30 text-amber-300",
  contactada: "border-emerald-400/30 text-emerald-300",
  cerrada: "border-white/20 text-white/40",
};

export default function RequestsPanel() {
  const [items, setItems] = useState(null);

  const load = async () => {
    const list = await base44.entities.SolicitudProyecto.list("-created_date", 200);
    setItems(list);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (item, status) => {
    await base44.entities.SolicitudProyecto.update(item.id, { status });
    load();
  };

  const remove = async (item) => {
    if (!window.confirm("¿Eliminar esta solicitud?")) return;
    await base44.entities.SolicitudProyecto.delete(item.id);
    load();
  };

  const openDemo = async (item) => {
    const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: item.demo_file_uri });
    const url = res?.signed_url || res?.data?.signed_url;
    if (url) window.open(url, "_blank", "noopener");
  };

  if (!items) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] font-semibold text-white/60 hover:text-white"
        >
          <RefreshCw size={12} /> Actualizar
        </button>
        <span className="text-[11px] text-white/30">{items.length} solicitudes</span>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold">{item.name}</span>
              <a href={`mailto:${item.email}`} className="text-[11.5px] text-[#ff8f74] hover:underline">
                {item.email}
              </a>
              {item.whatsapp && <span className="text-[11px] text-white/40">· {item.whatsapp}</span>}
              <span
                className={`ml-auto text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  badge[item.status] || badge.nueva
                }`}
              >
                {item.status || "nueva"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...(item.genres || []), ...(item.needs || [])].map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60">
                  {tag}
                </span>
              ))}
              {item.stage && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff5833]/20 text-[#ffb4a2]">
                  {item.stage}
                </span>
              )}
              {item.mood && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60">
                  mood: {item.mood}
                </span>
              )}
              {item.country && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60">
                  {item.country}
                </span>
              )}
            </div>

            {(item.demo_link || item.demo_file_uri || (item.creative_directions || []).length > 0) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                {item.demo_link && (
                  <a
                    href={item.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ff8f74] hover:underline truncate max-w-[260px]"
                  >
                    {item.demo_link}
                  </a>
                )}
                {item.demo_file_uri && (
                  <button
                    type="button"
                    onClick={() => openDemo(item)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <Download size={11} /> {item.demo_file_name || "Descargar demo"}
                  </button>
                )}
                {(item.creative_directions || []).length > 0 && (
                  <span>· {item.creative_directions.join(", ")}</span>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatus(item, status)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                    item.status === status
                      ? "border-[#ff5833] text-white"
                      : "border-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
              <button
                type="button"
                onClick={() => remove(item)}
                className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-red-400"
                aria-label="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-[12px] text-white/30 py-8 text-center">Todavía no hay solicitudes.</p>
        )}
      </div>
    </div>
  );
}