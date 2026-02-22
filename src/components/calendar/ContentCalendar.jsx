import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Film, Calendar as CalendarIcon, Play, Eye, Clock, 
  TrendingUp, Instagram, Youtube, Music, Plus, Edit3, Folder, FolderOpen
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from "date-fns";

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music
};

const platformColors = {
  youtube: 'bg-red-500/20 text-red-400 border-red-500/30',
  instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  tiktok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
};

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClip, setSelectedClip] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { data: clips = [] } = useQuery({
    queryKey: ['clips'],
    queryFn: () => base44.entities.Clip.list('-scheduled_at')
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getClipsForDay = (day) => {
    return clips.filter(clip => 
      clip.scheduled_at && isSameDay(parseISO(clip.scheduled_at), day)
    );
  };

  const scheduledClips = clips.filter(c => c.status === 'scheduled');
  const publishedClips = clips.filter(c => c.status === 'published');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Calendario de Contenido</h3>
              <p className="text-xs text-gray-400">Programación de clips y campañas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-gray-400">{scheduledClips.length} programados</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-400">{publishedClips.length} publicados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#141414] rounded-lg border border-white/5 p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold">{format(currentDate, 'MMMM yyyy')}</h4>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px]"
            >
              Hoy
            </button>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs"
            >
              →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Headers */}
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
            <div key={idx} className="text-center text-[10px] font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
          
          {daysInMonth.map((day, i) => {
            const dayClips = getClipsForDay(day);
            const isTodayDate = isToday(day);

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={`min-h-14 p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isTodayDate
                    ? 'bg-purple-500/10 border-purple-500/30'
                    : dayClips.length > 0
                    ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`text-[10px] font-bold mb-1 ${
                  isTodayDate ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayClips.slice(0, 2).map((clip) => {
                    const PlatformIcon = clip.platforms?.[0] ? platformIcons[clip.platforms[0]] : Film;
                    return (
                      <button
                        key={clip.id}
                        onClick={() => setSelectedClip(clip)}
                        className="w-full text-left text-[8px] p-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors border border-purple-500/20 flex items-center gap-1"
                      >
                        <PlatformIcon className="w-2.5 h-2.5 flex-shrink-0" />
                        <span className="truncate">{clip.title}</span>
                      </button>
                    );
                  })}
                  {dayClips.length > 2 && (
                    <div className="text-[8px] text-gray-500 font-medium px-1">
                      +{dayClips.length - 2}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Clip Preview Modal */}
      <AnimatePresence>
        {selectedClip && (
          <ClipPreviewModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ClipPreviewModal({ clip, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#141414] rounded-xl border border-white/10 overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="relative h-64 bg-black">
          {clip.thumbnail_url ? (
            <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all">
            <Play className="w-8 h-8 text-black ml-1" fill="black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{clip.title}</h3>
            <div className="flex flex-wrap gap-2">
              {clip.platforms?.map((platform) => {
                const Icon = platformIcons[platform];
                return (
                  <span key={platform} className={`px-2 py-1 rounded text-xs font-medium border ${platformColors[platform]}`}>
                    <Icon className="w-3 h-3 inline mr-1" />
                    {platform}
                  </span>
                );
              })}
            </div>
          </div>

          {clip.scheduled_at && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>Programado: {format(parseISO(clip.scheduled_at), 'dd MMM yyyy, HH:mm')}</span>
            </div>
          )}

          {clip.caption_master && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Caption</p>
              <p className="text-sm text-gray-300">{clip.caption_master}</p>
            </div>
          )}

          {clip.hashtags && clip.hashtags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Hashtags</p>
              <div className="flex flex-wrap gap-1">
                {clip.hashtags.map((tag, i) => (
                  <span key={i} className="text-xs text-purple-400">#{tag}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}