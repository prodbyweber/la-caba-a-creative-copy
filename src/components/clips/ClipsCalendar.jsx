import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  Loader 
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import CalendarEvent from "./CalendarEvent";

export default function ClipsCalendar({ filters }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, agenda

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ['scheduled-clips', filters],
    queryFn: async () => {
      const allClips = await base44.entities.Clip.filter(
        { status: "scheduled" },
        '-scheduled_at'
      );
      
      return allClips.filter(clip => {
        if (filters.platform.length > 0) {
          const hasMatchingPlatform = filters.platform.some(p => 
            clip.platforms?.includes(p)
          );
          if (!hasMatchingPlatform) return false;
        }

        if (filters.artist !== "all" && clip.artist_id !== filters.artist) {
          return false;
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!clip.title?.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        return true;
      });
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getClipsForDay = (day) => {
    return clips.filter(clip => {
      if (!clip.scheduled_at) return false;
      return isSameDay(parseISO(clip.scheduled_at), day);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "month"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("agenda")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "agenda"
                ? "bg-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "month" ? (
        <div className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-gray-500 border-r border-white/5 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayClips = getClipsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={day.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`min-h-32 p-3 border-r border-b border-white/5 last:border-r-0 ${
                    !isCurrentMonth ? "bg-white/[0.02]" : ""
                  } ${isToday ? "bg-purple-500/5" : ""}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    !isCurrentMonth ? "text-gray-600" : isToday ? "text-purple-400" : "text-gray-400"
                  }`}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    {dayClips.slice(0, 3).map(clip => (
                      <CalendarEvent key={clip.id} clip={clip} compact />
                    ))}
                    {dayClips.length > 3 && (
                      <div className="text-xs text-gray-500 pl-2">
                        +{dayClips.length - 3} más
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="space-y-4">
          {clips.length === 0 ? (
            <div className="text-center py-20 bg-[#111113] rounded-2xl border border-white/5">
              <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay clips programados</h3>
              <p className="text-gray-500">
                Programa tu primer clip desde la biblioteca
              </p>
            </div>
          ) : (
            clips.map((clip, i) => (
              <motion.div
                key={clip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CalendarEvent clip={clip} compact={false} />
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}