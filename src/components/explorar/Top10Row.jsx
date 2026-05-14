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

  // Card width — same size as before
  const CARD_W = "clamp(100px, 30vw, 180px)";
  // Number font size — large but not dominant
  const NUM_SIZE = "clamp(110px, 28vw, 190px)";
  // How much of the number peeks left of the card
  const NUM_PEEK = "42%";

  return (
    <div
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{
        // The total slot width = card + left space for the number peek
        // We give extra left margin so the number from the PREVIOUS card
        // can peek into this slot naturally
        marginLeft: rank === 1 ? "clamp(80px, 18vw, 120px)" : "clamp(44px, 12vw, 68px)",
        width: CARD_W,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(item)}
    >
      {/* ── NUMBER — absolutely positioned BEHIND the poster ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          // Align bottom of number with bottom of card
          bottom: 0,
          // Start from left, partially hidden behind poster's left edge
          left: `-${NUM_PEEK}`,
          zIndex: 0,             // behind card (card is z-10)
          lineHeight: 0.85,
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontWeight: 900,
          fontSize: NUM_SIZE,
          // Transparent fill + white stroke = Netflix style
          color: "transparent",
          WebkitTextStroke: rank <= 3
            ? "3px rgba(255,255,255,0.75)"
            : "2.5px rgba(255,255,255,0.45)",
          letterSpacing: "-0.04em",
        }}
      >
        {rank}
      </div>

      {/* ── POSTER — z-10 so it sits ON TOP of the number ── */}
      <motion.div
        className="relative overflow-hidden bg-[#111] z-10"
        style={{
          aspectRatio: "2/3",
          borderRadius: "6px",
          boxShadow: hovered
            ? "0 10px 36px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)"
            : "0 4px 18px rgba(0,0,0,0.65)",
          transition: "box-shadow 0.3s ease",
        }}
        animate={{ scale: hovered ? 1.05 : 1, y: hovered ? -4 : 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{
              filter: hovered ? "brightness(1.08) saturate(1.1)" : "brightness(0.92)",
              transition: "filter 0.3s ease",
            }}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1c] flex items-center justify-center">
            <span className="text-white/10 text-[10px]">Sin imagen</span>
          </div>
        )}

        {/* Bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0.5,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Hover buttons */}
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
                className="w-8 h-8 rounded-full flex items-center justify-center"
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
              className="w-7 h-7 rounded-full flex items-center justify-center ml-auto"
              style={{
                background: "rgba(20,20,20,0.85)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(6px)",
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
    el.scrollBy({ left: dir === "left" ? -380 : 380, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;
  const top10 = items.slice(0, 10);

  return (
    <div className="relative group/row py-3 px-4 sm:px-8">
      {/* Section title */}
      <h2
        className="text-sm font-bold text-white/90 mb-4 tracking-widest uppercase"
        style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: "11px", letterSpacing: "0.12em" }}
      >
        {title}
      </h2>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-start pl-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.9), transparent)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && top10.length > 2 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-44 flex items-center justify-end pr-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.9), transparent)" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}>
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
          paddingBottom: "16px",
          paddingTop: "8px",
          paddingLeft: "2px",
          // overflow visible vertically so numbers/shadows aren't clipped
          overflowY: "visible",
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
        <div style={{ flexShrink: 0, width: 24 }} />
      </div>
    </div>
  );
}