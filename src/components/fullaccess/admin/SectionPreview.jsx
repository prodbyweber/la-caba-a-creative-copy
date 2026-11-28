import React from "react";

const Frame = ({ children }) => (
  <span className="grid h-9 w-14 shrink-0 place-items-center overflow-hidden rounded border border-white/10 bg-[#0d0d0e]">
    {children}
  </span>
);

/** Miniatura esquemática de cada sección de la landing. */
export default function SectionPreview({ kind }) {
  if (kind === "hero") {
    return (
      <Frame>
        <span className="grid h-5 w-9 place-items-center rounded-sm bg-white/10">
          <span className="h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-[#ff5833]" />
        </span>
      </Frame>
    );
  }

  if (kind === "stats") {
    return (
      <Frame>
        <span className="flex items-end gap-[3px]">
          <span className="h-3 w-[7px] rounded-sm bg-[#f1efe8]/70" />
          <span className="h-5 w-[7px] rounded-sm bg-[#f1efe8]" />
          <span className="h-4 w-[7px] rounded-sm bg-[#f1efe8]/50" />
        </span>
      </Frame>
    );
  }

  if (kind === "brands") {
    return (
      <Frame>
        <span className="flex flex-col gap-[3px]">
          <span className="flex gap-[3px]">
            <span className="h-[5px] w-3 rounded-sm bg-white/35" />
            <span className="h-[5px] w-2 rounded-sm bg-white/20" />
            <span className="h-[5px] w-3 rounded-sm bg-white/35" />
          </span>
          <span className="flex gap-[3px]">
            <span className="h-[5px] w-2 rounded-sm bg-white/20" />
            <span className="h-[5px] w-3 rounded-sm bg-white/35" />
            <span className="h-[5px] w-2 rounded-sm bg-white/20" />
          </span>
        </span>
      </Frame>
    );
  }

  if (kind === "artists") {
    return (
      <Frame>
        <span className="flex flex-col items-center gap-1">
          <span className="h-[3px] w-6 rounded-sm bg-[#ff5833]/70" />
          <span className="h-4 w-10 rounded-sm bg-white/25" />
        </span>
      </Frame>
    );
  }

  if (kind === "projects") {
    return (
      <Frame>
        <span className="flex gap-1">
          <span className="h-5 w-4 rounded-sm bg-white/25" />
          <span className="h-5 w-4 rounded-sm bg-white/15" />
        </span>
      </Frame>
    );
  }

  if (kind === "methodology") {
    return (
      <Frame>
        <span className="flex flex-col gap-[3px]">
          {[0, 1, 2].map((row) => (
            <span key={row} className="flex items-center gap-1">
              <span className="h-[4px] w-[4px] rounded-full bg-[#ff5833]" />
              <span className="h-[4px] w-7 rounded-sm bg-white/30" />
            </span>
          ))}
        </span>
      </Frame>
    );
  }

  if (kind === "podcast") {
    return (
      <Frame>
        <span className="relative grid h-6 w-10 place-items-center rounded-sm bg-white/15">
          <span className="h-0 w-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-[#f1efe8]" />
        </span>
      </Frame>
    );
  }

  if (kind === "demos") {
    return (
      <Frame>
        <span className="flex items-center gap-[3px]">
          <span className="h-4 w-[6px] rounded-sm bg-[#f1efe8]/60" />
          <span className="h-2 w-[3px] rounded-sm bg-white/25" />
          <span className="h-5 w-[6px] rounded-sm bg-[#ff5833]" />
        </span>
      </Frame>
    );
  }

  if (kind === "testimonials") {
    return (
      <Frame>
        <span className="flex items-end gap-[3px]">
          <span className="h-6 w-[7px] rounded-sm bg-white/20" />
          <span className="h-6 w-[7px] rounded-sm bg-white/40" />
          <span className="h-6 w-[7px] rounded-sm bg-white/20" />
        </span>
      </Frame>
    );
  }

  return (
    <Frame>
      <span className="flex flex-col items-center gap-1">
        <span className="h-[7px] w-8 rounded-full bg-[#ff5833]" />
        <span className="h-[3px] w-6 rounded-sm bg-white/25" />
      </span>
    </Frame>
  );
}