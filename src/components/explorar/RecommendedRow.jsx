import React from "react";
import { motion } from "framer-motion";
import { Music2, Play } from "lucide-react";

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function scoreItem(item, referenceItem) {
  let score = 0;
  const refGenres = referenceItem.raw?.genres || [];
  const refTags = referenceItem.raw?.tags || [];
  const refType = referenceItem.raw?.content_type;

  const itemGenres = item.raw?.genres || [];
  const itemTags = item.raw?.tags || [];

  // Genre match: +3 per match
  refGenres.forEach(g => {
    if (itemGenres.some(ig => ig.toLowerCase() === g.toLowerCase())) score += 3;
  });

  // Tag match: +2 per match
  refTags.forEach(t => {
    if (itemTags.some(it => it.toLowerCase() === t.toLowerCase())) score += 2;
  });

  // Legacy subtitle match: +1
  if (item.subtitle && referenceItem.subtitle && item.subtitle === referenceItem.subtitle) score += 1;

  // Same content type: +1
  if (refType && item.raw?.content_type === refType) score += 1;

  return score;
}

export default function RecommendedRow({ currentItem, allItems, onSelect }) {
  if (!currentItem || !allItems || allItems.length === 0) return null;

  // Filter out current item, score and sort
  const candidates = allItems
    .filter(item => item.id !== currentItem.id)
    .map(item => ({ item, score: scoreItem(item, currentItem) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);

  // If fewer than 2 matches, fill with recent items (no score filter)
  const fallback = allItems
    .filter(i => i.id !== currentItem.id && !candidates.find(c => c.id === i.id))
    .slice(0, Math.max(0, 4 - candidates.length));

  const toShow = [...candidates, ...fallback].slice(0, 8);

  if (toShow.length === 0) return null;

  return (
    <div className="px-6 pt-2 pb-6 border-t border-white/[0.06]">
      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-3">Más como esto</p>
      <div className="grid grid-cols-4 gap-2">
        {toShow.map((item, i) => {
          const thumb = item.image || getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(item)}
              className="group relative rounded-lg overflow-hidden bg-[#1a1a1a] text-left focus:outline-none"
              style={{ aspectRatio: "16/9" }}
            >
              {thumb ? (
                <img
                  src={thumb}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
                  <Music2 className="w-4 h-4 text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Play hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-1.5">
                <p className="text-[9px] font-bold text-white truncate leading-tight">{item.title}</p>
                {item.raw?.genres?.length > 0 && (
                  <p className="text-[8px] text-white/30 truncate">{item.raw.genres.slice(0, 2).join(" · ")}</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}