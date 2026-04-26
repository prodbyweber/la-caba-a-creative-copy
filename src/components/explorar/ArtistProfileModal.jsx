import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Music2, Film, Users, Play, ExternalLink } from "lucide-react";

function YouTubeEmbed({ url }) {
  if (!url) return null;
  // Extract video ID from various YouTube URL formats
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const videoId = match[1];
  return (
    <div className="aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

function TrackRow({ track }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] transition-all group cursor-pointer">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white/20" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
        {track.genre && <p className="text-xs text-white/30 truncate">{track.genre}</p>}
      </div>
      {track.status === "completed" && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 flex-shrink-0">Completado</span>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.05] group cursor-pointer hover:border-white/10 transition-all">
      <div className="aspect-square overflow-hidden bg-white/5">
        {project.cover_url ? (
          <img src={project.cover_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-8 h-8 text-white/10" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-white truncate">{project.title}</p>
        {project.type && <p className="text-[10px] text-white/30 mt-0.5">{project.type}</p>}
      </div>
    </div>
  );
}

const TABS = [
  { key: "music", label: "Música", icon: Music2 },
  { key: "films", label: "Proyectos", icon: Film },
  { key: "about", label: "Perfil", icon: Users },
];

export default function ArtistProfileModal({ artist, projects, tracks, onClose }) {
  const [activeTab, setActiveTab] = useState("music");

  const ytLinks = [
    artist.social_links?.youtube,
    ...(tracks || []).filter(t => t.versions?.mp3 || t.audio_file_url).map(() => null),
  ].filter(Boolean);

  // Social links that look like YouTube
  const youtubeEmbeds = Object.values(artist.social_links || {}).filter(v => v && v.includes("youtube.com/watch"));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-lg overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative min-h-screen max-w-3xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero Banner */}
        <div className="relative h-72 sm:h-96 overflow-hidden">
          {artist.avatar_url ? (
            <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1c] to-[#0a0a0b]" />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(8,8,8,1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(8,8,8,0.6) 100%)" }} />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors border border-white/10"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 pb-16 bg-[#080808]" style={{ marginTop: -60 }}>
          {/* Artist Info */}
          <div className="flex items-end gap-5 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex-shrink-0 bg-[#1a1a1c]">
              {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-white/20" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-white/30 font-semibold mb-1">Artista</p>
              <h1
                className="text-3xl sm:text-4xl font-black text-white leading-none mb-2"
                style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
              >
                {artist.stageName}
              </h1>
              {artist.genre && (
                <span className="text-xs text-white/40 font-medium">{artist.genre}</span>
              )}
              {artist.location && (
                <span className="text-xs text-white/25 ml-3">· {artist.location}</span>
              )}
            </div>
          </div>

          {/* Bio */}
          {artist.bio && (
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-lg">{artist.bio}</p>
          )}

          {/* Social Links */}
          {artist.social_links && Object.entries(artist.social_links).some(([, v]) => v) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(artist.social_links).filter(([, v]) => v).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white text-xs font-medium transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  {platform}
                </a>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-white/5 pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all"
                style={{
                  color: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.35)",
                  borderColor: activeTab === tab.key ? "#ff5833" : "transparent",
                }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "music" && (
            <div className="space-y-4">
              {/* YouTube embeds from social links */}
              {youtubeEmbeds.length > 0 && (
                <div className="space-y-3">
                  {youtubeEmbeds.map((url, i) => (
                    <YouTubeEmbed key={i} url={url} />
                  ))}
                </div>
              )}

              {/* Tracks */}
              {tracks && tracks.length > 0 ? (
                <div className="space-y-2 mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-white/25 font-semibold mb-3">Tracks</p>
                  {tracks.map(t => <TrackRow key={t.id} track={t} />)}
                </div>
              ) : youtubeEmbeds.length === 0 && (
                <div className="py-12 text-center">
                  <Music2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 text-sm">Sin contenido de audio disponible</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "films" && (
            <div>
              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Film className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 text-sm">Sin proyectos disponibles</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              {[
                { label: "Nombre artístico", value: artist.stageName },
                { label: "Nombre legal", value: artist.legalName },
                { label: "Género", value: artist.genre },
                { label: "Ubicación", value: artist.location },
                { label: "Email", value: artist.email },
              ].filter(item => item.value).map(item => (
                <div key={item.label} className="flex gap-4 py-3 border-b border-white/[0.05]">
                  <span className="text-xs text-white/30 w-32 flex-shrink-0 font-medium">{item.label}</span>
                  <span className="text-sm text-white/70">{item.value}</span>
                </div>
              ))}
              {artist.notes && (
                <div className="pt-4">
                  <p className="text-xs text-white/25 uppercase tracking-widest mb-2">Notas</p>
                  <p className="text-sm text-white/50 leading-relaxed">{artist.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}