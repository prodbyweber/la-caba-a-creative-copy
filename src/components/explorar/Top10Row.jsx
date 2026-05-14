import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Premium rank number — large, semi-transparent dark fill, white stroke, in front
function BigNumber({ rank }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: "-28%",
        zIndex: 20,
        lineHeight: 0.82,
        pointerEvents: "none",
        userSelect: "none",
        fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 900,
        fontSize: "clamp(100px, 24vw, 175px)",
        // Dark semi-transparent fill for depth effect
        color: "rgba(10,10,10,0.82)",
        WebkitTextStroke: rank <= 3
          ? "2.5px rgba(255,255,255,0.80)"
          : "2px rgba(255,255,255,0.45)",
        letterSpacing: "-0.05em",
        // Subtle text shadow for cinematic depth
        textShadow: "0 4px 24px rgba(0,0,0,0.7)",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
      }}
    >
      {rank}
    </div>
  );
}

function Top10Card({ item, rank, onClick, currentUser, allItems }) {
  const [hovered, setHovered] = useState(false);
  const explorar = useExplorar();
  const ytId = getYoutubeId(item.youtube_url || item.youtube_music_url);

  const openCredits = (e) => {
    e.stopPropagation();
    explorar?.openCreditsModal(item, currentUser, allItems);
  };

  const openYT = (e) => {
    e.stopPropagation();
    if (ytId) explorar?.openYtModal(ytId, item.title, item.youtube_url || item.youtube_music_url);
  };

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{
        width: "clamp(90px, 28vw, 165px)",
        marginLeft: rank === 1 ? "clamp(24px, 8vw, 44px)" : "clamp(32px, 9vw, 52px)",
        paddingBottom: "4px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(item)}
    >
      {/* Big rank number — in front of poster */}
      <BigNumber rank={rank} />

      {/* Poster card */}
      <motion.div
        className="relative overflow-hidden bg-[#111] z-10"
        style={{
          aspectRatio: "2/3",
          borderRadius: "6px",
          boxShadow: hovered
            ? "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)"
            : "0 4px 16px rgba(0,0,0,0.6)",
          transition: "box-shadow 0.3s ease",
        }}
        animate={{ scale: hovered ? 1.06 : 1, y: hovered ? -4 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{
              filter: hovered
                ? "brightness(1.08) saturate(1.15) contrast(1.05)"
                : "brightness(0.88) saturate(1.0)",
              transition: "filter 0.35s ease",
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1c] flex items-center justify-center">
            <span className="text-white/10 text-[10px]">Sin imagen</span>
          </div>
        )}

        {/* Bottom gradient — always subtle, stronger on hover */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)",
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Subtle top vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%)",
          }}
        />

        {/* Hover glow ring */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none rounded-md"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            }}
          />
        )}

        {/* Hover action buttons */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-20 flex items-end justify-between p-2"
          >
            {(ytId || item.audio_file_url) && (
              <button
                onClick={openYT}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                <svg className="w-3.5 h-3.5 ml-0.5" fill="#000" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={openCredits}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all ml-auto"
              style={{
                background: "rgba(30,30,30,0.85)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default function Top10Row({ title, items, onItemClick, currentUser, allItems }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;
  const top10 = items.slice(0, 10);

  return (
    <div
      className="relative group/row py-3 px-4 sm:px-8"
      style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.15), transparent)" }}
    >
      {/* Row title */}
      <h2
        className="text-sm font-bold text-white/90 mb-3 tracking-widest uppercase"
        style={{
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          letterSpacing: "0.12em",
          fontSize: "11px",
        }}
      >
        {title}
      </h2>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-start pl-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && top10.length > 2 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-end pr-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="flex overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          gap: 0,
          paddingBottom: "12px",
          paddingTop: "4px",
          paddingLeft: "4px",
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setCanScrollLeft(el.scrollLeft > 0);
          setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }}
      >
        {top10.map((item, i) => (
          <Top10Card
            key={`${item.id}-${i}`}
            item={item}
            rank={i + 1}
            onClick={onItemClick}
            currentUser={currentUser}
            allItems={allItems}
          />
        ))}
        <div style={{ flexShrink: 0, width: 20 }} />
      </div>
    </div>
  );
}