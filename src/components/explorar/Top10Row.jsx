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

  // Number font sizing: huge behind the card
  const numStyle = {
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontWeight: 900,
    fontSize: "clamp(72px, 10vw, 130px)",
    lineHeight: 1,
    color: "transparent",
    WebkitTextStroke: rank <= 3 ? "3px rgba(255,255,255,0.85)" : "2px rgba(255,255,255,0.45)",
    letterSpacing: "-0.06em",
    userSelect: "none",
    position: "absolute",
    bottom: -8,
    left: rank <= 9 ? -10 : -18,
    zIndex: 0,
    pointerEvents: "none",
  };

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer select-none"
      style={{
        // Card is narrower than full width because the number bleeds into it
        width: "clamp(110px, 13vw, 160px)",
        marginLeft: rank === 1 ? 0 : "clamp(28px, 4vw, 44px)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (item.artist_id) onClick(item); }}
      animate={{ scale: hovered ? 1.07 : 1 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Big rank number — behind the card */}
      <span style={numStyle}>{rank}</span>

      {/* Card thumbnail */}
      <div
        className="relative rounded-lg overflow-hidden bg-[#1a1a1c] z-10"
        style={{ aspectRatio: "2/3", position: "relative" }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: hovered ? "brightness(1.1) saturate(1.2)" : "brightness(0.95)" }}
          />
        ) : (
          <div className="w-full h-full bg-[#1a1a1c] flex items-center justify-center">
            <span className="text-white/10 text-xs">Sin imagen</span>
          </div>
        )}

        {/* Gradient bottom */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)",
            opacity: hovered ? 1 : 0.3,
          }}
        />

        {/* TOP 10 badge */}
        {rank <= 10 && (
          <div
            className="absolute top-2 right-2 z-20"
            style={{
              background: "#E50914",
              borderRadius: 3,
              padding: "1px 5px",
              fontSize: 8,
              fontWeight: 900,
              color: "white",
              letterSpacing: "0.05em",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            TOP 10
          </div>
        )}

        {/* Hover actions */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-end justify-between p-2"
          >
            {(ytId || item.audio_file_url) && (
              <button
                onClick={openYT}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <svg className="w-3 h-3 text-white ml-0.5" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            <button
              onClick={openCredits}
              className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>

      {/* Title below */}
      <p
        className="mt-1.5 text-white/70 truncate text-center"
        style={{ fontSize: "clamp(8px, 1vw, 10px)", fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 600 }}
      >
        {item.title}
      </p>
    </motion.div>
  );
}

export default function Top10Row({ title, items, onItemClick, currentUser, allItems }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -500 : 500, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;

  // Only show max 10
  const top10 = items.slice(0, 10);

  return (
    <div className="relative group/row py-4 px-4 sm:px-8">
      <h2
        className="text-sm font-bold text-white mb-4 tracking-wide"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
      >
        {title}
      </h2>

      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-36 bg-gradient-to-r from-[#080808] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {canScrollRight && top10.length > 3 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-36 bg-gradient-to-l from-[#080808] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      <div
        ref={rowRef}
        className="flex overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", gap: 0 }}
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
      </div>
    </div>
  );
}