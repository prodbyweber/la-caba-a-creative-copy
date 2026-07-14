import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Music2, Play, Pause, Activity, ChevronLeft, ChevronRight, Flame, TrendingUp,
  Clock, Download, Star, Heart, Disc3, Sparkles, Zap, Headphones, Radio, Mic2,
} from "lucide-react";
import BeatCard from "@/components/beats/BeatCard";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

const ICONS = {
  Music2, Flame, TrendingUp, Clock, Download, Star, Heart, Disc3, Sparkles,
  Zap, Headphones, Radio, Mic2, Play, Pause, Activity,
};

const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", 5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" };

export default function BeatSectionView({ section, beats, onPlay, onLike, onDownload, onBuy, onShare, shareState, user, likedIds }) {
  const { isPlaying } = useGlobalAudio();

  const resolved = useMemo(() => {
    let list = [];
    if (section.source_mode === "manual") {
      const ids = section.manual_beat_ids || [];
      list = ids.map((id) => beats.find((b) => b.id === id)).filter(Boolean);
    } else {
      list = applyAutoFilter(beats, section);
    }
    return list.slice(0, section.limit || 10);
  }, [section, beats]);

  if (section.is_visible === false || resolved.length === 0) return null;

  const Icon = ICONS[section.icon] || Music2;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${section.color || "#8b5cf6"}22` }}>
            <Icon className="w-4 h-4" style={{ color: section.color || "#8b5cf6" }} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ letterSpacing: "-0.03em" }}>{section.title}</h2>
            {section.subtitle && <p className="text-sm text-[#a0a0a0] mt-0.5">{section.subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Layouts */}
      {section.layout === "grid" && (
        <div className={`grid ${colClass[section.columns] || colClass[5]} gap-4`}>
          {resolved.map((beat, i) => (
            <BeatCard key={beat.id} beat={beat} index={i} isPlaying={isPlaying} onPlay={onPlay} onLike={onLike} onDownload={onDownload} onBuy={onBuy} onShare={onShare} shareState={shareState} user={user} liked={likedIds?.has(beat.id)} />
          ))}
        </div>
      )}

      {section.layout === "horizontal" && (
        <HorizontalRow beats={resolved} onPlay={onPlay} isPlaying={isPlaying} onLike={onLike} onDownload={onDownload} onBuy={onBuy} onShare={onShare} shareState={shareState} user={user} likedIds={likedIds} />
      )}

      {section.layout === "list" && (
        <div className="space-y-2">
          {resolved.map((beat, i) => (
            <BeatListRow key={beat.id} beat={beat} index={i} onPlay={onPlay} />
          ))}
        </div>
      )}

      {section.layout === "carousel" && (
        <CarouselRow beats={resolved} onPlay={onPlay} />
      )}
    </section>
  );
}

function applyAutoFilter(beats, section) {
  const published = beats.filter((b) => b.status === "Publicado" && !b.archived);
  let list = [...published];
  switch (section.filter_type) {
    case "popular": list.sort((a, b) => (b.plays_count || 0) - (a.plays_count || 0)); break;
    case "downloads": list.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0)); break;
    case "featured": list = list.filter((b) => b.featured); break;
    case "genre": list = list.filter((b) => (b.genres || []).includes(section.filter_value)); break;
    case "mood": list = list.filter((b) => (b.moods || []).includes(section.filter_value)); break;
    case "key": list = list.filter((b) => (b.key || b.scale || "").includes(section.filter_value || "")); break;
    case "tag": list = list.filter((b) => (b.tags || []).includes(section.filter_value)); break;
    case "producer": list = list.filter((b) => (b.producer || "").toLowerCase().includes((section.filter_value || "").toLowerCase())); break;
    case "bpm": {
      const range = (section.filter_value || "").split("-").map(Number);
      if (range.length === 2) list = list.filter((b) => b.bpm >= range[0] && b.bpm <= range[1]);
      break;
    }
    case "recent":
    default: list.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)); break;
  }
  return list;
}

function BeatListRow({ beat, index, onPlay }) {
  const { playingTrack, isPlaying, isLoading } = useGlobalAudio();
  const isActive = playingTrack?.beat_id === beat.id;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (index || 0) * 0.03 }}
      onClick={() => onPlay(beat)} className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-colors" style={{ background: "#141416" }}>
      <button onClick={(e) => { e.stopPropagation(); onPlay(beat); }} className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative" style={{ background: "#161616" }}>
        {beat.cover_url ? <img src={beat.cover_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Music2 className="w-4 h-4 text-white/20" /></div>}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          {isLoading && isActive ? <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            : isActive && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" />
            : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
        <p className="text-xs text-[#a0a0a0] truncate">{beat.producer || "Cabaña"}</p>
      </div>
      <div className="hidden sm:flex items-center gap-3 text-[10px] text-white/40">
        {beat.bpm != null && <span>{beat.bpm} BPM</span>}
        {(beat.scale || beat.key) && <span>{beat.scale || beat.key}</span>}
        <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{beat.plays_count || 0}</span>
      </div>
    </motion.div>
  );
}

function HorizontalRow({ beats, onPlay, isPlaying, onLike, onDownload, onBuy, onShare, shareState, user, likedIds }) {
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
  };
  return (
    <div className="relative">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-3" style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}>
        {beats.map((beat, i) => (
          <div key={beat.id} className="flex-shrink-0 w-40 sm:w-52" style={{ scrollSnapAlign: "start" }}>
            <BeatCard beat={beat} index={i} isPlaying={isPlaying} onPlay={onPlay} onLike={onLike} onDownload={onDownload} onBuy={onBuy} onShare={onShare} shareState={shareState} user={user} liked={likedIds?.has(beat.id)} />
          </div>
        ))}
      </div>
      <button onClick={() => scrollBy(-1)} className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center bg-black/60 backdrop-blur text-white hover:bg-black/80"><ChevronLeft className="w-5 h-5" /></button>
      <button onClick={() => scrollBy(1)} className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center bg-black/60 backdrop-blur text-white hover:bg-black/80"><ChevronRight className="w-5 h-5" /></button>
    </div>
  );
}

function CarouselRow({ beats, onPlay }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!beats || beats.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % beats.length), 5000);
    return () => clearInterval(t);
  }, [beats]);
  if (!beats || beats.length === 0) return null;
  const current = beats[idx] || beats[0];
  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/8]" style={{ background: "#161616" }}>
        <motion.img key={current.id} src={current.cover_url} alt={current.title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(14,14,14,0.5), rgba(14,14,14,0.92))" }} />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
          <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-[0.3em] mb-2">{current.producer || "Cabaña"}</p>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-3" style={{ letterSpacing: "-0.04em" }}>{current.title}</h2>
          <button onClick={() => onPlay(current)} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-2xl" style={{ background: "#8b5cf6" }}>
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        {beats.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className="h-1.5 rounded-full transition-all" style={{ width: i === idx ? 24 : 8, background: i === idx ? "#fff" : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
    </div>
  );
}