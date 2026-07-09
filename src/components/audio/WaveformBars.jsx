import React, { useMemo } from "react";

// Lightweight animated waveform bars (decorative, synced to progress)
export default function WaveformBars({ progress = 0, isPlaying = false, bars = 48, color = "#7c4dff" }) {
  const seeds = useMemo(
    () => Array.from({ length: bars }, (_, i) => {
      // pseudo-random but deterministic per index
      const n = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return 0.2 + (n - Math.floor(n)) * 0.8;
    }),
    [bars]
  );

  const activeIndex = Math.floor(progress * bars);

  return (
    <div className="flex items-end gap-[2px] w-full h-full" style={{ justifyContent: "center" }}>
      {seeds.map((h, i) => {
        const isActive = i <= activeIndex;
        const isCurrent = i === activeIndex;
        return (
          <div
            key={i}
            style={{
              width: "3px",
              height: `${h * 100}%`,
              borderRadius: "2px",
              background: isActive ? color : "rgba(255,255,255,0.12)",
              opacity: isCurrent ? 1 : isActive ? 0.85 : 0.35,
              transition: "background 0.15s, opacity 0.15s",
              transform: isPlaying && isCurrent ? "scaleY(1.1)" : "scaleY(1)",
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
}