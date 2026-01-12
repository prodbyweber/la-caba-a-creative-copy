import React, { useState } from "react";
import { Youtube, Instagram, Music2, Clock, Edit } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import EditClipModal from "./EditClipModal.jsx";

const platformIcons = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music2
};

const platformColors = {
  youtube: "text-red-400",
  instagram: "text-pink-400",
  tiktok: "text-purple-400"
};

export default function CalendarEvent({ clip, compact }) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: artist } = useQuery({
    queryKey: ['artist', clip.artist_id],
    queryFn: () => base44.entities.Artist.filter({ id: clip.artist_id }),
    enabled: !!clip.artist_id,
    select: (data) => data[0]
  });

  if (compact) {
    return (
      <button
        onClick={() => setEditModalOpen(true)}
        className="w-full text-left px-2 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <span className="text-xs font-medium truncate flex-1">
            {format(parseISO(clip.scheduled_at), "HH:mm")} · {clip.title}
          </span>
          <Edit className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {clip.platforms && clip.platforms.length > 0 && (
          <div className="flex gap-1 mt-1 ml-5">
            {clip.platforms.map(platform => {
              const Icon = platformIcons[platform];
              return (
                <Icon key={platform} className={`w-3 h-3 ${platformColors[platform]}`} />
              );
            })}
          </div>
        )}
        {editModalOpen && (
          <EditClipModal 
            clip={clip}
            onClose={() => setEditModalOpen(false)}
            onUpdate={() => window.location.reload()}
          />
        )}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setEditModalOpen(true)}
        className="w-full bg-[#111113] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all text-left group"
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="w-20 h-28 bg-[#0a0a0b] rounded-xl overflow-hidden flex-shrink-0">
            {clip.thumbnail_url ? (
              <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg mb-1">{clip.title}</h3>
                {artist && (
                  <p className="text-sm text-gray-500">{artist.name}</p>
                )}
              </div>
              <Edit className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {format(parseISO(clip.scheduled_at), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
              </div>

              {clip.platforms && clip.platforms.length > 0 && (
                <div className="flex items-center gap-2">
                  {clip.platforms.map(platform => {
                    const Icon = platformIcons[platform];
                    return (
                      <div key={platform} className="flex items-center gap-1">
                        <Icon className={`w-4 h-4 ${platformColors[platform]}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {clip.caption_master && (
              <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                {clip.caption_master}
              </p>
            )}
          </div>
        </div>
      </button>

      {editModalOpen && (
        <EditClipModal 
          clip={clip}
          onClose={() => setEditModalOpen(false)}
          onUpdate={() => window.location.reload()}
        />
      )}
    </>
  );
}