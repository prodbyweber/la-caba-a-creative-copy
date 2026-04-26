import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Music2, Play } from "lucide-react";

function ContentCard({ item, onClick, variant }) {
  const [hovered, setHovered] = useState(false);
  const isPortrait = variant === "portrait";

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer group"
      style={{ width: isPortrait ? 160 : 240 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(item)}
    >
      <motion.div
        animate={{ scale: hovered ? 1.07 : 1, zIndex: hovered ? 10 : 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative rounded-xl overflow-hidden"
        style={{ aspectRatio: isPortrait ? "2/3" : "16/9", background: "#1a1a1c" }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white/15" />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
            opacity: hovered ? 1 : 0.6,
          }}
        />

        {/* Play button on hover */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </motion.div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-xs leading-tight line-clamp-2">{item.title}</p>
          {item.subtitle && (
            <p className="text-white/40 text-[10px] mt-0.5 truncate">{item.subtitle}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ContentRow({ title, items, onItemClick, variant = "landscape" }) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = dir === "left" ? -600 : 600;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(() => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 400);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative group/row py-4 px-4 sm:px-8">
      {/* Title */}
      <h2
        className="text-sm font-bold text-white mb-3 tracking-wide"
        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
      >
        {title}
      </h2>

      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-gradient-to-r from-[#080808] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </div>
        </button>
      )}
      {canScrollRight && items.length > 5 && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-24 bg-gradient-to-l from-[#080808] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/row:opacity-100 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* Cards */}
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={(e) => {
          const el = e.currentTarget;
          setCanScrollLeft(el.scrollLeft > 0);
          setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }}
      >
        {items.map((item, i) => (
          <ContentCard key={`${item.id}-${i}`} item={item} onClick={onItemClick} variant={variant} />
        ))}
      </div>
    </div>
  );
}