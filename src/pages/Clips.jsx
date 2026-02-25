import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ClipsLibrary from "@/components/clips/ClipsLibrary.jsx";
import ClipsCalendar from "@/components/clips/ClipsCalendar.jsx";
import ClipsHeader from "@/components/clips/ClipsHeader.jsx";
import { LayoutGrid, Calendar } from "lucide-react";

export default function Clips() {
  const [activeTab, setActiveTab] = useState("library");
  
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");
  
  const [filters, setFilters] = useState({
    status: "all",
    platform: [],
    artist: artistId || "all",
    dateRange: null,
    search: ""
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistId={artistId} />

      <main className="pt-14">
        <div className="px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 max-w-[1600px] mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              Gestión de <span className="text-purple-400">Clips</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Sube, programa y publica clips en YouTube Shorts, Instagram Reels y TikTok
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 border-b border-white/5"
          >
            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-all relative ${
                activeTab === "library"
                  ? "text-purple-400"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Biblioteca</span>
              <span className="sm:hidden">Lib</span>
              {activeTab === "library" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium text-sm sm:text-base transition-all relative ${
                activeTab === "calendar"
                  ? "text-purple-400"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendario</span>
              <span className="sm:hidden">Cal</span>
              {activeTab === "calendar" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                />
              )}
            </button>
          </motion.div>

          {/* Header Actions */}
          <ClipsHeader 
            filters={filters} 
            setFilters={setFilters}
            activeTab={activeTab}
            artistId={artistId}
          />

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "library" ? (
              <ClipsLibrary filters={filters} />
            ) : (
              <ClipsCalendar filters={filters} />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}