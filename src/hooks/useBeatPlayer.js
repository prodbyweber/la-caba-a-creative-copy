import { useCallback } from "react";
import { useGlobalAudio } from "@/context/GlobalAudioContext";

// Hook compartido para reproducir/pausar beats con una sola reproducción activa.
// toggle(beat, list): reproduce si es otro beat, alterna play/pause si es el actual.
export function useBeatPlayer() {
  const { playingTrack, isPlaying, isLoading, playQueue, pauseTrack, resumeTrack } = useGlobalAudio();

  const toggle = useCallback((beat, list) => {
    if (!beat) return;
    const isActive = playingTrack?.beat_id === beat.id;
    if (isActive) {
      if (isPlaying) pauseTrack();
      else resumeTrack();
      return;
    }
    const source = list && list.length ? list : [beat];
    const queue = source.map((b) => ({ ...b, beat_id: b.id }));
    const idx = queue.findIndex((b) => b.beat_id === beat.id);
    playQueue(queue, idx >= 0 ? idx : 0);
  }, [playingTrack, isPlaying, playQueue, pauseTrack, resumeTrack]);

  return { toggle, playingTrack, isPlaying, isLoading };
}