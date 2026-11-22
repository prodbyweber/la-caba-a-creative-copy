import React from "react";
import { ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react";
import { Label } from "@/components/admin/landing/Field";

const inputCls =
  "w-full rounded-lg bg-black/40 border border-white/10 px-2.5 py-1.5 text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#ff5833]/60";

/** Editor de los cuadros del texto animado del hero. */
export default function HeroFramesEditor({ frames = [], onChange }) {
  const list = Array.isArray(frames) ? frames : [];
  const commit = (next) => onChange(next.map((f, i) => ({ ...f, order: i + 1 })));

  const patch = (i, key, value) =>
    commit(list.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));

  const move = (i, dir) => {
    const next = [...list];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const remove = (i) => commit(list.filter((_, idx) => idx !== i));

  const add = () =>
    commit([
      ...list,
      {
        top: list[0]?.top || "Todo comienza con",
        prefix: list[0]?.prefix || "tu",
        word: "nueva palabra.",
        hold_ms: 2000,
      },
    ]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <Label>Cuadros del texto animado</Label>
      <p className="text-[10.5px] text-white/30 mb-2.5">
        La primera línea y la palabra fija se mantienen; solo cambia la palabra naranja. El último
        cuadro es el nombre de la casa (abajo).
      </p>

      <div className="grid gap-2">
        {list.map((frame, i) => (
          <div key={i} className="rounded-lg border border-white/10 p-2.5 grid gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/35">
                Cuadro {i + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="p-1.5 rounded-md border border-white/10 text-white/50 hover:text-white"
                  aria-label="Subir"
                >
                  <ArrowUp size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="p-1.5 rounded-md border border-white/10 text-white/50 hover:text-white"
                  aria-label="Bajar"
                >
                  <ArrowDown size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-1.5 rounded-md border border-white/10 text-white/50 hover:text-[#ff5833]"
                  aria-label="Quitar"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputCls}
                value={frame.top || ""}
                placeholder="Primera línea"
                onChange={(e) => patch(i, "top", e.target.value)}
              />
              <input
                className={inputCls}
                value={frame.prefix || ""}
                placeholder="Palabra fija (tu)"
                onChange={(e) => patch(i, "prefix", e.target.value)}
              />
              <input
                className={inputCls}
                value={frame.word || ""}
                placeholder="Palabra naranja"
                onChange={(e) => patch(i, "word", e.target.value)}
              />
              <input
                className={inputCls}
                type="number"
                value={frame.hold_ms ?? 2000}
                placeholder="Duración (ms)"
                onChange={(e) => patch(i, "hold_ms", Number(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-semibold text-white/60 hover:text-white"
      >
        <Plus size={11} /> Añadir cuadro
      </button>
    </div>
  );
}