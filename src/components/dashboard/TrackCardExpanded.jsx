import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Download, Edit, ChevronDown, ChevronUp, Music2 } from "lucide-react";

export default function TrackCardExpanded({ track, onEdit }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef(null);

  const togglePlay = async (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    }
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [playing, setPlaying] = useState(null);
  const audioRefs = useRef({});

  const togglePlay = async (versionKey) => {
    const audio = audioRefs.current[versionKey];
    if (!audio) return;

    try {
      if (playing === versionKey) {
        audio.pause();
        setPlaying(null);
      } else {
        // Pause other audios
        Object.keys(audioRefs.current).forEach(key => {
          if (key !== versionKey && audioRefs.current[key]) {
            audioRefs.current[key].pause();
          }
        });
        await audio.play();
        setPlaying(versionKey);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setPlaying(null);
    }
  };

  const versions = [
    { key: 'master_24bit', label: '24-bit Master', url: track.master_24bit_url, color: 'emerald' },
    { key: 'master_mp3', label: 'MP3 Master', url: track.audio_file_url, color: 'blue' },
    { key: 'stems', label: 'Stems', url: track.stems_url, color: 'purple' },
    { key: 'show_live', label: 'Show en Vivo', url: track.show_live_url, color: 'orange' },
    { key: 'acapella', label: 'Acapella', url: track.acapella_url, color: 'pink' },
    { key: 'beat', label: 'Beat/Instrumental', url: track.beat_url, color: 'yellow' }
  ];

  const availableVersions = versions.filter(v => v.url);

  const statusColors = {
    idea: "bg-gray-500/10 text-gray-400",
    production: "bg-blue-500/10 text-blue-400",
    mixing: "bg-purple-500/10 text-purple-400",
    mastering: "bg-orange-500/10 text-orange-400",
    completed: "bg-emerald-500/10 text-emerald-400"
  };

  return (
    <motion.div
      layout
      className="bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all overflow-hidden"
    >
      {/* Header Compacto */}
      <div className="p-2 lg:p-3 flex items-center gap-2 lg:gap-3">
        {/* Cover pequeño */}
        <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0 overflow-hidden">
          {track.cover_url ? (
            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
          ) : (
            <Music2 className="w-5 h-5 lg:w-6 lg:h-6 text-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm lg:text-base truncate">{track.title}</h4>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[track.status]}`}>
              {track.status}
            </span>
            {track.dolby_atmos && (
              <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-medium">
                Atmos
              </span>
            )}
            {availableVersions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium">
                {availableVersions.length} versiones
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(track)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            <div className="p-3 lg:p-4 space-y-3">
              {/* Metadata */}
              {(track.composers?.length > 0 || track.producers?.length > 0 || track.mix_engineer || track.master_engineer) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {track.composers?.length > 0 && (
                    <div>
                      <span className="text-gray-500">Compositores:</span>
                      <p className="text-white font-medium">{track.composers.join(', ')}</p>
                    </div>
                  )}
                  {track.producers?.length > 0 && (
                    <div>
                      <span className="text-gray-500">Productores:</span>
                      <p className="text-white font-medium">{track.producers.join(', ')}</p>
                    </div>
                  )}
                  {track.mix_engineer && (
                    <div>
                      <span className="text-gray-500">Mix:</span>
                      <p className="text-white font-medium">{track.mix_engineer}</p>
                    </div>
                  )}
                  {track.master_engineer && (
                    <div>
                      <span className="text-gray-500">Master:</span>
                      <p className="text-white font-medium">{track.master_engineer}</p>
                    </div>
                  )}
                  {track.bpm && (
                    <div>
                      <span className="text-gray-500">BPM:</span>
                      <p className="text-white font-medium">{track.bpm}</p>
                    </div>
                  )}
                  {track.key && (
                    <div>
                      <span className="text-gray-500">Key:</span>
                      <p className="text-white font-medium">{track.key}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Versiones Disponibles */}
              {availableVersions.length > 0 && (
                <div className="space-y-1.5">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Versiones</h5>
                  <div className="space-y-1">
                    {availableVersions.map((version) => (
                      <div
                        key={version.key}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <audio
                          ref={(el) => { if (el) audioRefs.current[version.key] = el; }}
                          src={version.url}
                          preload="metadata"
                          onEnded={() => setPlaying(null)}
                          onPause={() => { if (playing === version.key) setPlaying(null); }}
                          onPlay={() => setPlaying(version.key)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <button
                            onClick={() => togglePlay(version.key)}
                            className={`p-1.5 rounded-lg bg-${version.color}-500/10 hover:bg-${version.color}-500/20 transition-colors flex-shrink-0`}
                          >
                            {playing === version.key ? (
                              <Pause className={`w-3 h-3 text-${version.color}-400`} fill="currentColor" />
                            ) : (
                              <Play className={`w-3 h-3 text-${version.color}-400`} fill="currentColor" />
                            )}
                          </button>
                          <span className="text-xs text-white font-medium">{version.label}</span>
                        </div>
                        <a
                          href={version.url}
                          download
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {track.notes && (
                <div className="text-xs">
                  <span className="text-gray-500">Notas:</span>
                  <p className="text-gray-400 mt-1">{track.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}