import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const GlobalAudioContext = createContext(null);

function updateMediaSession(track, isPlaying) {
  if (!("mediaSession" in navigator)) return;

  if (track) {
    const artwork = [];
    if (track.cover_url) {
      artwork.push({ src: track.cover_url, sizes: "512x512", type: "image/jpeg" });
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || "Sin título",
      artist: track.artist || "Cabaña Creative",
      album: track.album || "",
      artwork,
    });
  }

  navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
}

// ─── Normalize any beat/track object into a playable track ────────────────────
function normalizeTrack(item) {
  if (!item) return null;
  return {
    ...item,
    audio_file_url: item.audio_file_url || item.preview_mp3_url || "",
    cover_url: item.cover_url || item.thumbnail_url || "",
    artist: item.artist || item.producer || "Cabaña Creative",
    title: item.title || "Sin título",
    // preserve beat-specific fields
    beat_id: item.beat_id || item.id,
    bpm: item.bpm,
    key: item.key,
    scale: item.scale,
    genres: item.genres || [],
    moods: item.moods || [],
  };
}

const STORAGE_KEY = "cabana_audio_state_v1";

function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function GlobalAudioProvider({ children }) {
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hidden, setHidden] = useState(false);
  // ── Queue & player state ──
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const currentIndexRef = useRef(-1);
  const repeatRef = useRef("off");
  const shuffleRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { shuffleRef.current = shuffle; }, [shuffle]);

  // ─── Restore volume from storage on mount ───────────────────────────────────
  useEffect(() => {
    const stored = loadStoredState();
    if (stored?.volume != null) {
      setVolume(stored.volume);
    }
  }, []);

  // ─── Persist volume ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = loadStoredState() || {};
      stored.volume = volume;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {}
  }, [volume]);

  // ─── Media Session setup ────────────────────────────────────────────────────
  const setupMediaSession = useCallback((audio, track) => {
    if (!("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      audio.play();
      setIsPlaying(true);
      updateMediaSession(track, true);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audio.pause();
      setIsPlaying(false);
      updateMediaSession(track, false);
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      audio.pause();
      audio.currentTime = 0;
      setPlayingTrack(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      navigator.mediaSession.playbackState = "none";
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) {
        audio.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skipTime = details.seekOffset || 10;
      audio.currentTime = Math.max(0, audio.currentTime - skipTime);
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skipTime = details.seekOffset || 10;
      audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + skipTime);
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
  }, []);

  useEffect(() => {
    if (!("mediaSession" in navigator) || !audioRef.current || !duration) return;
    try {
      navigator.mediaSession.setPositionState({ duration, playbackRate: 1, position: currentTime });
    } catch {}
  }, [currentTime, duration]);

  // ─── Core: play a single track object ───────────────────────────────────────
  const playSingle = useCallback((track) => {
    if (!track) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onloadedmetadata = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }

    setPlayingTrack(track);
    setHidden(false);
    setExpanded(false);
    setCurrentTime(0);

    const audio = new Audio(track.audio_file_url);
    audio.volume = volume;
    audio.preload = "auto";

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: 1, position: 0 });
        } catch {}
      }
    };

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);

    audio.onended = () => {
      // Auto-advance or repeat
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      const idx = currentIndexRef.current;
      const q = queueRef.current;
      if (q.length > 0) {
        let nextIdx;
        if (shuffleRef.current && q.length > 1) {
          do { nextIdx = Math.floor(Math.random() * q.length); } while (nextIdx === idx);
        } else {
          nextIdx = idx + 1;
        }
        if (nextIdx < q.length) {
          setCurrentIndex(nextIdx);
          playSingle(normalizeTrack(q[nextIdx]));
        } else if (repeatRef.current === "all" && q.length > 0) {
          setCurrentIndex(0);
          playSingle(normalizeTrack(q[0]));
        } else {
          setIsPlaying(false);
          updateMediaSession(track, false);
        }
      } else {
        setIsPlaying(false);
        updateMediaSession(track, false);
      }
    };

    audio.onerror = () => setIsPlaying(false);

    audioRef.current = audio;

    updateMediaSession(track, true);
    setupMediaSession(audio, track);

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [volume, setupMediaSession]);

  // ─── playTrack: backward-compatible single-track play ───────────────────────
  const playTrack = useCallback((track) => {
    const normalized = normalizeTrack(track);
    if (playingTrack?.id === normalized?.id && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setHidden(false);
      updateMediaSession(normalized, true);
      return;
    }
    setQueue([]);
    setCurrentIndex(-1);
    playSingle(normalized);
  }, [playingTrack, playSingle]);

  // ─── playQueue: play from a list of beats/tracks ────────────────────────────
  const playQueue = useCallback((items, startIndex = 0) => {
    const normalized = (items || []).map(normalizeTrack).filter(t => t.audio_file_url);
    if (normalized.length === 0) return;
    setQueue(normalized);
    const idx = Math.max(0, Math.min(startIndex, normalized.length - 1));
    setCurrentIndex(idx);
    playSingle(normalized[idx]);
  }, [playSingle]);

  // ─── Next / Previous ────────────────────────────────────────────────────────
  const playNext = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    let nextIdx;
    if (shuffleRef.current && q.length > 1) {
      do { nextIdx = Math.floor(Math.random() * q.length); } while (nextIdx === currentIndexRef.current);
    } else {
      nextIdx = currentIndexRef.current + 1;
    }
    if (nextIdx >= q.length) {
      if (repeatRef.current === "all") nextIdx = 0;
      else return;
    }
    setCurrentIndex(nextIdx);
    playSingle(normalizeTrack(q[nextIdx]));
  }, [playSingle]);

  const playPrevious = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    const prevIdx = currentIndexRef.current - 1;
    if (prevIdx < 0) {
      if (repeatRef.current === "all") {
        setCurrentIndex(q.length - 1);
        playSingle(normalizeTrack(q[q.length - 1]));
      }
      return;
    }
    setCurrentIndex(prevIdx);
    playSingle(normalizeTrack(q[prevIdx]));
  }, [playSingle]);

  // ─── Queue management ──────────────────────────────────────────────────────
  const addToQueue = useCallback((item) => {
    const normalized = normalizeTrack(item);
    if (!normalized?.audio_file_url) return;
    setQueue(prev => [...prev, normalized]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndexRef.current) {
      setCurrentIndex(prev => prev - 1);
    }
  }, []);

  const reorderQueue = useCallback((fromIndex, toIndex) => {
    setQueue(prev => {
      const copy = [...prev];
      const [item] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, item);
      return copy;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
  }, []);

  // ─── Playback controls ──────────────────────────────────────────────────────
  const pauseTrack = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    updateMediaSession(playingTrack, false);
  }, [playingTrack]);

  const resumeTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        updateMediaSession(playingTrack, true);
      }).catch(() => {});
    }
  }, [playingTrack]);

  const seekTrack = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setExpanded(false);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
    }
  }, []);

  // ─── Volume control ──────────────────────────────────────────────────────────
  const changeVolume = useCallback((vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    if (audioRef.current) audioRef.current.volume = clamped;
    setVolume(clamped);
  }, []);

  return (
    <GlobalAudioContext.Provider
      value={{
        // existing
        playingTrack,
        isPlaying,
        currentTime,
        duration,
        hidden,
        playTrack,
        pauseTrack,
        resumeTrack,
        seekTrack,
        stopTrack,
        setHidden,
        // new
        queue,
        currentIndex,
        repeat,
        shuffle,
        volume,
        expanded,
        playQueue,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setRepeat,
        setShuffle,
        setVolume: changeVolume,
        setExpanded,
      }}
    >
      {children}
    </GlobalAudioContext.Provider>
  );
}

export function useGlobalAudio() {
  const ctx = useContext(GlobalAudioContext);
  if (!ctx) {
    throw new Error("useGlobalAudio must be used within GlobalAudioProvider");
  }
  return ctx;
}