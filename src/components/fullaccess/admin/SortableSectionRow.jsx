import React from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import SectionPreview from "./SectionPreview";

export default function SortableSectionRow({
  section,
  index,
  total,
  dragging,
  shift,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onMoveBy,
}) {
  return (
    <div
      className={`relative flex h-[76px] items-center gap-2.5 rounded-md border px-2.5 sm:gap-3 sm:px-3 ${
        dragging
          ? "z-20 border-[#ff5833] bg-[#141416] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
          : "z-0 border-white/10 bg-white/[0.02]"
      }`}
      style={{
        transform: `translateY(${shift}px)`,
        transition: dragging ? "none" : "transform 180ms ease",
      }}
    >
      <button
        type="button"
        aria-label={`Mover ${section.label}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
        className={`grid h-10 w-7 shrink-0 cursor-grab place-items-center rounded-md border border-white/10 text-zinc-500 transition hover:border-white/25 hover:text-white ${
          dragging ? "cursor-grabbing border-[#ff5833] text-[#ff5833]" : ""
        }`}
      >
        <GripVertical size={14} />
      </button>

      <SectionPreview kind={section.key} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-white">
          <span className="mr-2 text-[10px] font-bold tabular-nums text-zinc-500">
            {String(index + 1).padStart(2, "0")}
          </span>
          {section.label}
        </p>
        <p className="truncate text-[11px] text-zinc-500">{section.desc}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          aria-label={`Subir ${section.label}`}
          disabled={index === 0}
          onClick={() => onMoveBy(index, -1)}
          className="grid h-6 w-6 place-items-center rounded border border-white/10 text-zinc-400 transition hover:border-white/30 hover:text-white disabled:opacity-25"
        >
          <ChevronUp size={13} />
        </button>
        <button
          type="button"
          aria-label={`Bajar ${section.label}`}
          disabled={index === total - 1}
          onClick={() => onMoveBy(index, 1)}
          className="grid h-6 w-6 place-items-center rounded border border-white/10 text-zinc-400 transition hover:border-white/30 hover:text-white disabled:opacity-25"
        >
          <ChevronDown size={13} />
        </button>
      </div>
    </div>
  );
}