import React, { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ListPanel({ title, description, entity, fields, defaults = {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const list = await base44.entities[entity].list("order");
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [entity]);

  const change = (id, key, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const save = async (item) => {
    setBusyId(item.id);
    const payload = {};
    fields.forEach((field) => {
      payload[field.key] = item[field.key];
    });
    await base44.entities[entity].update(item.id, payload);
    setBusyId(null);
  };

  const add = async () => {
    const created = await base44.entities[entity].create({ ...defaults, order: items.length });
    setItems((prev) => [...prev, created]);
  };

  const remove = async (id) => {
    await base44.entities[entity].delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-md bg-[#ff5833] px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> Cargando...
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-[#111112] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                    <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      {field.label}
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={item[field.key] ?? ""}
                        onChange={(e) => change(item.id, field.key, e.target.value)}
                        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
                      />
                    ) : field.type === "bool" ? (
                      <input
                        type="checkbox"
                        checked={item[field.key] !== false}
                        onChange={(e) => change(item.id, field.key, e.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#ff5833]"
                      />
                    ) : field.type === "list" ? (
                      <input
                        value={Array.isArray(item[field.key]) ? item[field.key].join(", ") : item[field.key] ?? ""}
                        onChange={(e) =>
                          change(
                            item.id,
                            field.key,
                            e.target.value.split(",").map((v) => v.trim()).filter(Boolean)
                          )
                        }
                        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
                      />
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={item[field.key] ?? ""}
                        onChange={(e) =>
                          change(
                            item.id,
                            field.key,
                            field.type === "number" ? Number(e.target.value) : e.target.value
                          )
                        }
                        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => save(item)}
                  disabled={busyId === item.id}
                  className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black"
                >
                  {busyId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:text-white"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/10 p-6 text-sm text-zinc-500">
              Sin elementos todavía.
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}