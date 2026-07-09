import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useGlobalAudio } from "@/context/GlobalAudioContext";
import { Music2, Play, Pause, Heart, Bookmark, ArrowRight } from "lucide-react";

export default function SavedBeatsSection() {
  const qc = useQueryClient();
  const { playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack } = useGlobalAudio();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: savedBeats = [] } = useQuery({
    queryKey: ["saved-beats", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const saves = await base44.entities.BeatSave.filter({ user_id: currentUser.id });
      if (saves.length === 0) return [];
      const allBeats = await base44.entities.Beat.filter({ status: "Publicado" });
      const savedIds = new Set(saves.map(s => s.beat_id));
      return allBeats.filter(b => savedIds.has(b.id));
    },
    enabled: !!currentUser?.id,
  });

  const unsaveMutation = useMutation({
    mutationFn: async (beatId) => {
      const saves = await base44.entities.BeatSave.filter({ beat_id: beatId, user_id: currentUser.id });
      if (saves[0]) await base44.entities.BeatSave.delete(saves[0].id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-beats", currentUser?.id] }),
  });

  const handlePlay = (beat) => {
    const queue = savedBeats.map(b => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex(b => b.beat_id === beat.id);
    playQueue(queue, idx >= 0 ? idx : 0);
  };

  if (savedBeats.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(124,77,255,0.08)" }}>
          <Bookmark className="w-6 h-6 text-[#a78bfa]" />
        </div>
        <p className="text-sm font-semibold text-white/50 mb-1">Sin beats guardados</p>
        <p className="text-xs text-white/25 mb-4">Explora el marketplace y guarda tus favoritos</p>
        <Link to="/beats" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
          Explorar beats <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {savedBeats.map(beat => {
        const active = playingTrack?.beat_id === beat.id;
        return (
          <div key={beat.id} className="group relative rounded-xl overflow-hidden" style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="relative aspect-square overflow-hidden cursor-pointer" style={{ background: "#1a1a1c" }} onClick={() => active && isPlaying ? pauseTrack() : handlePlay(beat)}>
              {beat.cover_url ? (
                <img src={beat.cover_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Music2 className="w-8 h-8 text-white/15" /></div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c4dff, #a78bfa)" }}>
                  {active && isPlaying ? <Pause className="w-4 h-4 text-white" fill="white" /> : <Play className="w-4 h-4 text-white ml-0.5" fill="white" />}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); unsaveMutation.mutate(beat.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#a78bfa] fill-[#a78bfa]" />
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-xs font-bold text-white truncate">{beat.title}</h3>
              <p className="text-[10px] text-white/40 truncate">{beat.producer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}