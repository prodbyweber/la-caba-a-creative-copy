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

export function GlobalAudioProvider({ children }) {
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hidden, setHidden] = useState(false);
  const audioRef = useRef(null);

  // Registrar handlers de Media Session una sola vez
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
  }, []);

  // Actualizar position state de Media Session para la barra de progreso del sistema
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!audioRef.current || !duration) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: 1,
        position: currentTime,
      });
    } catch (_) {
      // setPositionState puede fallar en algunos navegadores
    }
  }, [currentTime, duration]);

  const playTrack = useCallback((track) => {
    // Si es el mismo track, solo resume
    if (playingTrack?.id === track.id && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setHidden(false);
      updateMediaSession(track, true);
      return;
    }

    // Detener track anterior
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onloadedmetadata = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
    }

    setPlayingTrack(track);
    setHidden(false);
    setCurrentTime(0);

    const audio = new Audio(track.audio_file_url);
    audio.volume = 1;
    // Necesario para reproducción en segundo plano en iOS/Android
    audio.preload = "auto";

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      // Actualizar posición ahora que tenemos duración
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: 1,
            position: 0,
          });
        } catch (_) {}
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audioRef.current = audio;

    // Configurar Media Session antes de reproducir
    updateMediaSession(track, true);
    setupMediaSession(audio, track);

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [playingTrack, setupMediaSession]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
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
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
    }
  }, []);

  return (
    <GlobalAudioContext.Provider
      value={{
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