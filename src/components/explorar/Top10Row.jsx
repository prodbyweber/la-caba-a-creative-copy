import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
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
    /*
      Outer wrapper: holds both the number (background) and the poster (foreground).
      The number sits on the left, the poster overlaps it from the right.
      Total visual width = number_overlap + poster_width.
    */
    <div
      className="relative flex-shrink-0 flex items-end"
      style={{
        // Each slot: number (partially visible) + poster
        height: "clamp(130px, 36vw, 220px)",
        marginRight: "2px",
      }}
    >
      {/* ── BIG NUMBER — z-index 0 (background) ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 900,
          // Font size relative to the card height
          fontSize: "clamp(80px, 20vw, 145px)",
          lineHeight: 0.88,
          // Transparent fill + white stroke → Netflix look
          color: "transparent",
          WebkitTextStroke: rank <= 3
            ? "2.5px rgba(255,255,255,0.75)"
            : "2px rgba(255,255,255,0.40)",
          letterSpacing: "-0.04em",
          // Subtle shadow so it has depth against dark bg
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
          // Width of the number portion that peeks out
          width: "clamp(40px, 11vw, 72px)",
          overflow: "visible",
          whiteSpace: "nowrap",
        }}
      >
        {rank}
      </div>

      {/* ── POSTER — z-index 10 (in front of number) ── */}
      <motion.div
        className="relative cursor-pointer select-none"
        style={{
          // Poster sits to the right, overlapping the number
          marginLeft: "clamp(28px, 7vw, 50px)",
          width: "clamp(75px, 20vw, 130px)",
          height: "100%",
          zIndex: 10,
          borderRadius: "6px",
          overflow: "hidden",
          background: "#111",
          boxShadow: hovered
            ? "0 10px 36px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.1)"
            : "0 4px 18px rgba(0,0,0,0.65)",
          flexShrink: 0,
        }}
        animate={{ scale: hovered ? 1.05 : 1, y: hovered ? -4 : 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onClick && onClick(item)}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{
              filter: hovered
                ? "brightness(1.08) saturate(1.12)"
                : "brightness(0.87)",
              transition: "filter 0.32s ease",
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1c] flex items-center justify-center">
            <span className="text-white/10 text-[9px]">Sin imagen</span>
          </div>
        )}

        {/* Bottom gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.3s",
          }}
        />

        {/* Hover buttons */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 z-20 flex items-end justify-between p-2"
          >
            {(ytId || item.audio_file_url) && (
              <button
                onClick={openYT}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
              >
                <svg className="w-3 h-3 ml-0.5" fill="#000" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={openCredits}
              className="w-7 h-7 rounded-full flex items-center justify-center ml-auto"
              style={{ background: "rgba(20,20,20,0.85)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(6px)" }}
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
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;
  const top10 = items.slice(0, 10);

  return (
    <div className="relative group/row py-2 px-4 sm:px-8">
      {/* Section title */}
      <h2
        className="text-white/90 font-bold mb-3 uppercase tracking-widest"
        style={{
          fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.13em",
        }}
      >
        {title}
      </h2>

      {/* Left scroll arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9), transparent)" }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Right scroll arrow */}
      {canScrollRight && top10.length > 2 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.9), transparent)" }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={rowRef}
        className="flex items-end overflow-x-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          gap: "clamp(6px, 2vw, 12px)",
          paddingBottom: "10px",
          paddingTop: "8px",
          paddingLeft: "2px",
          paddingRight: "4px",
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
        <div style={{ flexShrink: 0, width: 8 }} />
      </div>
    </div>
  );
}