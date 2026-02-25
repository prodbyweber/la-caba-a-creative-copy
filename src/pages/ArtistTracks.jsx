import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Music2, Play, Pause, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DashboardNav from "@/components/dashboard/DashboardNav";

export default function ArtistTracksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRefs = React.useRef({});

  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const { data: allTracks = [], isLoading: isLoadingTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => base44.entities.Track.list('-created_date'),
    initialData: [],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list(),
    initialData: [],
  });

  const { data: artist } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const artists = await base44.entities.Artist.list();
      return artists.find(a => a.id === artistId);
    },
    enabled: !!artistId
  });

  // Filtrar tracks por artista
  const artistTracks = artistId 
    ? allTracks.filter(track => {
        const project = projects.find(p => p.id === track.project_id);
        return project && project.artist_id === artistId;
      })
    : [];

  const filteredTracks = artistTracks.filter(track => 
    track.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePlay = async (trackId) => {
    const audio = audioRefs.current[trackId];
    if (!audio) return;

    try {
      if (playingTrackId === trackId) {
        audio.pause();
        setPlayingTrackId(null);
      } else {
        if (playingTrackId && audioRefs.current[playingTrackId]) {
          audioRefs.current[playingTrackId].pause();
        }
        setPlayingTrackId(trackId);
        await audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setPlayingTrackId(null);
    }
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistName={artist?.stageName} artistId={artistId} />

      <main className="pt-14">
        <div className="px-8 py-4 max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Mis Tracks</h1>
            <p className="text-sm text-gray-500">{filteredTracks.length} tracks</p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tracks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Tracks Grid */}
          {isLoadingTracks ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
                  <div className="aspect-square bg-white/5 rounded-lg mb-3" />
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-20">
              <Music2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No tienes tracks aún</p>
              <p className="text-sm text-gray-600">Tus tracks aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTracks.map((track) => {
                const project = projects.find(p => p.id === track.project_id);
                
                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#141414] rounded-xl border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden group"
                  >
                    {/* Cover with Play Button */}
                    <div className="relative aspect-square">
                      {track.audio_file_url && (
                        <audio
                          ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
                          src={track.audio_file_url}
                          preload="metadata"
                          playsInline
                          onEnded={() => setPlayingTrackId(null)}
                          onPause={() => { if (playingTrackId === track.id) setPlayingTrackId(null); }}
                          onPlay={() => setPlayingTrackId(track.id)}
                        />
                      )}
                      
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music2 className="w-12 h-12 text-white/20" />
                        )}
                      </div>

                      {/* Play Button Overlay */}
                      {track.audio_file_url && (
                        <>
                          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity ${playingTrackId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePlay(track.id);
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white active:scale-95 hover:scale-110 flex items-center justify-center transition-all shadow-2xl z-10"
                          >
                            {playingTrackId === track.id ? (
                              <Pause className="w-5 h-5 text-black" fill="black" />
                            ) : (
                              <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Track Info */}
                    <Link to={createPageUrl(`TrackDetail?id=${track.id}`)} className="block p-3">
                      <h3 className="font-bold text-white text-sm mb-1 truncate group-hover:text-purple-400 transition-colors">
                        {track.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {project ? project.title : 'Sin proyecto'}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[track.status]}`}>
                          {statusLabels[track.status]}
                        </span>
                        {track.dolby_atmos && (
                          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-medium">
                            Atmos
                          </span>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}