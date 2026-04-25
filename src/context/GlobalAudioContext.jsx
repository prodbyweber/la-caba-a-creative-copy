import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const GlobalAudioContext = createContext(null);

export function GlobalAudioProvider({ children }) {
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hidden, setHidden] = useState(false);
  const audioRef = useRef(null);

  const playTrack = useCallback((track, onPlay) => {
    // Si es el mismo track, solo resume
    if (playingTrack?.id === track.id && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Cambiar a nuevo track
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setPlayingTrack(track);
    setHidden(false);
    setCurrentTime(0);

    // Crear nuevo audio element y reproducir
    const audio = new Audio(track.audio_file_url);
    audio.volume = 1;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlayingTrack(null);
    };

    audio.onerror = () => {
      setIsPlaying(false);
    };

    audioRef.current = audio;
    audio.play();
    setIsPlaying(true);
  }, [playingTrack]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

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