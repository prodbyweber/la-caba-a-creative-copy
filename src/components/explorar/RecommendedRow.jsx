import React from "react";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

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

  refGenres.forEach(g => {
    if (itemGenres.some(ig => ig.toLowerCase() === g.toLowerCase())) score += 3;
  });
  refTags.forEach(t => {
    if (itemTags.some(it => it.toLowerCase() === t.toLowerCase())) score += 2;
  });
  if (item.subtitle && referenceItem.subtitle && item.subtitle === referenceItem.subtitle) score += 1;
  if (refType && item.raw?.content_type === refType) score += 1;

  return score;
}

// Determina qué tipo de media mostrar y su URL
function resolveMedia(item) {
  // 1. Thumbnail explícita
  if (item.image) return { type: "img", src: item.image };
  // 2. Preview media del item (imagen o video)
  if (item.raw?.preview_media_url) {
    if (item.raw.preview_media_type === "video") return { type: "video", src: item.raw.preview_media_url };
    return { type: "img", src: item.raw.preview_media_url };
  }
  // 3. Hero media del item
  if (item.hero_media_url) {
    if (item.hero_media_type === "video") return { type: "video", src: item.hero_media_url };
    return { type: "img", src: item.hero_media_url };
  }
  // 4. Thumbnail de YouTube
  const ytThumb = getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
  if (ytThumb) return { type: "img", src: ytThumb };
  // 5. Nada
  return null;
}

function RecommendedCard({ item, index, onSelect }) {
  const media = resolveMedia(item);

  return (
    <motion.button
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onSelect(item)}
      className="group relative rounded-xl overflow-hidden bg-[#1a1a1a] text-left focus:outline-none"
      style={{ aspectRatio: "16/9" }}
    >
      {media?.type === "img" && (
        <img
          src={media.src}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      )}
      {media?.type === "video" && (
        <video
          src={media.src}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          style={{ pointerEvents: "none" }}
        />
      )}
      {!media && (
        <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
          <Music2 className="w-5 h-5 text-white/10" />
        </div>
      )}
    </motion.button>
  );
}

export default function RecommendedRow({ currentItem, allItems, onSelect }) {
  if (!currentItem || !allItems || allItems.length === 0) return null;

  const candidates = allItems
    .filter(item => item.id !== currentItem.id)
    .map(item => ({ item, score: scoreItem(item, currentItem) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ item }) => item);

  const fallback = allItems
    .filter(i => i.id !== currentItem.id && !candidates.find(c => c.id === i.id))
    .slice(0, Math.max(0, 4 - candidates.length));

  const toShow = [...candidates, ...fallback].slice(0, 6);

  if (toShow.length === 0) return null;

  return (
    <div className="px-6 pt-4 pb-6 border-t border-white/[0.06]">
      <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-4">Más como esto</p>
      <div className="grid grid-cols-2 gap-3">
        {toShow.map((item, i) => (
          <RecommendedCard key={item.id} item={item} index={i} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}