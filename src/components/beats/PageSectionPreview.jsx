import React from "react";
import { Music2, EyeOff } from "lucide-react";
import { resolveSectionBeats } from "@/lib/beatSections";
import { getCoverForBeat } from "@/lib/beatsUtils";

// Vista previa de una sección dentro del constructor visual (sin audio).
export default function PageSectionPreview({ section, beats, selected, onSelect }) {
  if (!section) return null;
  const resolved = resolveSectionBeats(section, beats);
  const hidden = section.is_visible === false;

  const Cover = ({ beat }) => {
    const cover = getCoverForBeat(beat);
    return (
      <div className="rounded-lg overflow-hidden" style={{ background: "#161616" }}>
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Music2 className="w-3.5 h-3.5 text-white/15" /></div>
        )}
      </div>
    );
  };

  const body = () => {
    if (resolved.length === 0) return <p className="text-xs text-white/25 py-4">Sin beats para esta sección</p>;
    const cols = section.columns || 5;
    switch (section.layout) {
      case "grid":
        return (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 5)}, minmax(0,1fr))` }}>
            {resolved.slice(0, section.limit || 10).map(b => (
              <div key={b.id} className="aspect-square"><Cover beat={b} /></div>
            ))}
          </div>
        );
      case "carousel": {
        const b = resolved[0];
        const cover = section.hero_image_url || getCoverForBeat(b);
        return (
          <div className="relative rounded-xl overflow-hidden aspect-[16/10]" style={{ background: "#161616" }}>
            {cover ? (
              <img src={cover} alt="" loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Music2 className="w-5 h-5 text-white/15" /></div>
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.92))" }} />
            <div className="absolute bottom-2 left-2 right-8">
              <p className="text-[11px] font-black text-white truncate">{b.title}</p>
              <p className="text-[9px] text-white/55 truncate">{b.producer}{((b.genres || [])[0]) ? ` · ${b.genres[0]}` : ""}</p>
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full" style={{ background: "#ff5833" }} />
          </div>
        );
      }
      case "horizontal":
        return (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {resolved.slice(0, section.limit || 10).map(b => (
              <div key={b.id} className="w-20 h-20 flex-shrink-0"><Cover beat={b} /></div>
            ))}
          </div>
        );
      case "ranking":
      case "list":
      case "compact":
      default:
        return (
          <div className="space-y-1.5">
            {resolved.slice(0, section.limit || 10).map((b, i) => (
              <div key={b.id} className="flex items-center gap-2.5 p-1.5 rounded-lg" style={{ background: "#161616" }}>
                {section.layout === "ranking" && (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: "#1e1e1e", color: "#6b6b6b" }}>{i + 1}</span>
                )}
                <div className="w-9 h-9 flex-shrink-0"><Cover beat={b} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-white truncate">{b.title}</p>
                  <p className="text-[10px] text-white/35 truncate">{b.producer}</p>
                </div>
                {section.layout === "ranking" && (
                  <span className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: "#1e1e1e" }} />
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-3 cursor-pointer transition-all ${selected ? "ring-2" : "ring-1 ring-transparent"}`}
      style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.05)", ...(selected ? { boxShadow: "0 0 0 2px #ff5833" } : {}) }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: section.color || "#ff5833" }} />
        <h4 className="text-sm font-bold text-white truncate flex-1">{section.title || "Sin título"}</h4>
        {hidden && <EyeOff className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
        <span className="text-[10px] text-white/30 uppercase tracking-wider flex-shrink-0">{section.layout}</span>
      </div>
      {section.subtitle && <p className="text-xs text-white/40 mb-2.5">{section.subtitle}</p>}
      {body()}
    </div>
  );
}