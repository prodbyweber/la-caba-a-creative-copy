import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, Music2, Play, Pause, Download, Edit, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function TrackDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("id");

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      const tracks = await base44.entities.Track.list();
      return tracks.find(t => t.id === trackId);
    },
    enabled: !!trackId
  });

  const { data: project } = useQuery({
    queryKey: ['project', track?.project_id],
    queryFn: async () => {
      if (!track?.project_id) return null;
      const projects = await base44.entities.Project.list();
      return projects.find(p => p.id === track.project_id);
    },
    enabled: !!track?.project_id
  });

  const togglePlay = async () => {
    if (!audioRef.current) {
      console.error('Audio element not found');
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      alert('Error al reproducir el audio. Verifica que el archivo sea válido.');
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const updateTimeFromPosition = (clientX) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    return newTime;
  };

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    const newTime = updateTimeFromPosition(e.clientX);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging) {
      const newTime = updateTimeFromPosition(e.clientX);
      setCurrentTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => handleProgressMouseMove(e);
      const handleMouseUp = () => handleProgressMouseUp();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, duration]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusColors = {
    idea: "bg-gray-500/10 text-gray-400",
    production: "bg-blue-500/10 text-blue-400",
    mixing: "bg-purple-500/10 text-purple-400",
    mastering: "bg-orange-500/10 text-orange-400",
    completed: "bg-emerald-500/10 text-emerald-400"
  };

  const statusLabels = {
    idea: "Idea",
    production: "Producción",
    mixing: "Mezcla",
    mastering: "Masterización",
    completed: "Completado"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="lg:pl-64 pt-16 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/5 rounded w-1/3" />
              <div className="h-64 bg-white/5 rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="lg:pl-64 pt-16 p-6">
          <div className="max-w-5xl mx-auto text-center py-20">
            <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Track no encontrado</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cover & Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 sticky top-24">
                {/* Cover */}
                <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-6 overflow-hidden">
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-20 h-20 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Audio Player */}
                {track.audio_file_url && (
                  <div className="space-y-4">
                    <audio
                      ref={audioRef}
                      src={track.audio_file_url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => {
                        console.error('Error loading audio:', e);
                        setIsPlaying(false);
                      }}
                      preload="metadata"
                    />
                    
                    {/* Play Button */}
                    <button
                      onClick={togglePlay}
                      className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-600 active:bg-purple-700 transition-colors flex items-center justify-center gap-3 font-semibold touch-manipulation"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" fill="white" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" fill="white" />
                          Reproducir
                        </>
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div 
                        ref={progressRef}
                        className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                        onMouseDown={handleProgressMouseDown}
                      >
                        <div 
                          className="absolute h-full bg-purple-500 rounded-full pointer-events-none"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 pt-2">
                      <Volume2 className="w-4 h-4 text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                )}

                {!track.audio_file_url && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    Sin archivo de audio
                  </div>
                )}
              </div>
            </motion.div>

            {/* Metadata */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Header */}
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{track.title}</h1>
                    {project && (
                      <p className="text-gray-500">Proyecto: {project.title}</p>
                    )}
                  </div>
                  <Link 
                    to={createPageUrl(`Dashboard`)}
                    className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[track.status]}`}>
                    {statusLabels[track.status]}
                  </span>
                  {track.dolby_atmos && (
                    <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium">
                      Dolby Atmos
                    </span>
                  )}
                </div>
              </div>

              {/* Credits */}
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold mb-4">Créditos</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {track.composers && track.composers.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Compositores</p>
                      <div className="space-y-1">
                        {track.composers.map((composer, i) => (
                          <p key={i} className="text-white">{composer}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {track.producers && track.producers.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Productores</p>
                      <div className="space-y-1">
                        {track.producers.map((producer, i) => (
                          <p key={i} className="text-white">{producer}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {track.mix_engineer && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Mezcla</p>
                      <p className="text-white">{track.mix_engineer}</p>
                    </div>
                  )}
                  {track.master_engineer && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Masterización</p>
                      <p className="text-white">{track.master_engineer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Info */}
              <div className="bg-[#141414] rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold mb-4">Información Técnica</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {track.genre && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Género</p>
                      <p className="text-white">{track.genre}</p>
                    </div>
                  )}
                  {track.bpm && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">BPM</p>
                      <p className="text-white">{track.bpm}</p>
                    </div>
                  )}
                  {track.key && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tonalidad</p>
                      <p className="text-white">{track.key}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lyrics & Notes */}
              {(track.lyrics || track.notes) && (
                <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4">
                  {track.lyrics && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">Letra</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">{track.lyrics}</p>
                    </div>
                  )}
                  {track.notes && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">Notas</h3>
                      <p className="text-gray-300 whitespace-pre-wrap">{track.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}