import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExplorar } from "@/context/ExplorarContext.jsx";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Netflix-style big outline number — sits BELOW and to the LEFT of the poster
function BigNumber({ rank }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "-22%",
        left: "-28%",
        zIndex: 0,
        lineHeight: 0.85,
        pointerEvents: "none",
        userSelect: "none",
        fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        fontWeight: 900,
        fontSize: "clamp(90px, 22vw, 160px)",
        color: "transparent",
        WebkitTextStroke: rank <= 3
          ? "3px rgba(255,255,255,0.90)"
          : "2.5px rgba(255,255,255,0.55)",
        letterSpacing: "-0.05em",
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
        // Number takes ~28% to the left, card takes the rest
        // On mobile: 2.5 cards visible → each card ≈ 36% of screen - number offset
        width: "clamp(90px, 28vw, 165px)",
        // Extra left margin to accommodate the number bleeding in from left
        marginLeft: rank === 1 ? "clamp(24px, 8vw, 44px)" : "clamp(32px, 9vw, 52px)",
        paddingBottom: "clamp(36px, 8vw, 56px)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(item)}
    >
      {/* Big rank number — positioned behind and below the poster */}
      <BigNumber rank={rank} />

      {/* Poster card — above the number */}
      <motion.div
        className="relative rounded-md overflow-hidden bg-[#1a1a1c] z-10"
        style={{ aspectRatio: "2/3" }}
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{ filter: hovered ? "brightness(1.1)" : "brightness(0.95)" }}
          />
        ) : (
          <div className="w-full h-full bg-[#1e1e20] flex items-center justify-center">
            <span className="text-white/10 text-[10px]">Sin imagen</span>
          </div>
        )}

        {/* Subtle bottom gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.3s",
          }}
        />

        {/* Hover action buttons */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 flex items-end justify-between p-2"
          >
            {(ytId || item.audio_file_url) && (
              <button
                onClick={openYT}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={openCredits}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors ml-auto"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>
      {/* NO title text — solo número y poster */}
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
    <div className="relative group/row py-2 px-4 sm:px-8">
      {/* Row title */}
      <h2
        className="text-sm font-bold text-white mb-2 tracking-wide"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
      >
        {title}
      </h2>

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-40 bg-gradient-to-r from-[#090909] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/70 border border-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && top10.length > 2 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-40 bg-gradient-to-l from-[#090909] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/70 border border-white/10 flex items-center justify-center">
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
          paddingBottom: "8px",
          paddingLeft: "4px",
          // Mobile: ~2.5 cards visible; desktop: more
          // Each card width ~28vw on mobile, so 2.5 = 70vw + margins
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
        {/* Right padding spacer */}
        <div style={{ flexShrink: 0, width: 16 }} />
      </div>
    </div>
  );
}