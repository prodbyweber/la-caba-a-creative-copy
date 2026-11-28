import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SECTION_DEFS, normalizeSectionOrder } from "@/lib/fullAccessSections";
import useDragSort from "@/hooks/useDragSort";
import SectionPreview from "./SectionPreview";
import SortableSectionRow from "./SortableSectionRow";

const BY_KEY = Object.fromEntries(SECTION_DEFS.map((section) => [section.key, section]));

export default function SectionOrderPanel() {
  const queryClient = useQueryClient();
  const [order, setOrder] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [status, setStatus] = useState("idle");
  const orderRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await base44.entities.FullAccessSettings.list("-created_date", 1);
      if (!alive) return;
      const saved = list?.[0];
      if (saved) setRecordId(saved.id);
      const next = normalizeSectionOrder(saved?.section_order);
      orderRef.current = next;
      setOrder(next);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback(
    async (next) => {
      setStatus("saving");
      try {
        if (recordId) {
          await base44.entities.FullAccessSettings.update(recordId, { section_order: next });
        } else {
          const created = await base44.entities.FullAccessSettings.create({ section_order: next });
          setRecordId(created.id);
        }
        queryClient.invalidateQueries({ queryKey: ["full-access-content"] });
        setStatus("saved");
      } catch (error) {
        setStatus("error");
      }
    },
    [recordId, queryClient]
  );

  const commit = useCallback(
    (next) => {
      orderRef.current = next;
      setOrder(next);
      persist(next);
    },
    [persist]
  );

  const move = useCallback(
    (from, to) => {
      const current = orderRef.current;
      if (!current || from === to) return;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      commit(next);
    },
    [commit]
  );

  const { listRef, drag, offset, start, track, end } = useDragSort({
    count: order?.length || 0,
    onMove: move,
  });

  if (!order) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 size={14} className="animate-spin" /> Cargando secciones...
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Orden de la landing</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
            Arrastra el asa de una sección para moverla, o usa las flechas para subirla y bajarla. El
            orden se guarda solo y se aplica igual en móvil y escritorio.
          </p>
        </div>
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
            status === "error" ? "text-red-400" : status === "saved" ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {status === "saving" ? "Guardando..." : status === "saved" ? "Guardado" : status === "error" ? "No se guardó" : ""}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-2">
        <div className="flex h-[76px] items-center gap-2.5 rounded-md border border-white/5 bg-white/[0.03] px-2.5 sm:gap-3 sm:px-3">
          <span className="grid h-10 w-7 shrink-0 place-items-center text-zinc-600">
            <Lock size={13} />
          </span>
          <SectionPreview kind="hero" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">Portada y VSL</p>
            <p className="truncate text-[11px] text-zinc-500">Fija al inicio de la página.</p>
          </div>
        </div>

        <div ref={listRef} className="mt-2 flex flex-col gap-2">
          {order.map((key, index) => {
            const section = BY_KEY[key];
            if (!section) return null;
            const dragging = drag?.from === index;
            return (
              <SortableSectionRow
                key={key}
                section={section}
                index={index}
                total={order.length}
                dragging={dragging}
                shift={offset(index)}
                onPointerDown={start(index)}
                onPointerMove={track}
                onPointerUp={end}
                onMoveBy={move}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}