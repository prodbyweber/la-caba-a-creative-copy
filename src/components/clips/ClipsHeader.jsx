import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Link as LinkIcon, 
  Filter, 
  Search,
  X,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UploadClipModal from "./UploadClipModal";
import ClipsFilters from "./ClipsFilters";

export default function ClipsHeader({ filters, setFilters, activeTab }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Left Actions */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              <Upload className="w-4 h-4" />
              Subir Clips
            </motion.button>

            <Link to={createPageUrl("SocialAccounts")}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-all"
              >
                <LinkIcon className="w-4 h-4" />
                Conectar Cuentas
              </motion.button>
            </Link>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                filtersOpen || filters.status !== "all" || filters.platform.length > 0
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {(filters.status !== "all" || filters.platform.length > 0) && (
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
                  {(filters.status !== "all" ? 1 : 0) + filters.platform.length}
                </span>
              )}
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, artista, tags..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Link to={createPageUrl("ClipsSettings")}>
              <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <ClipsFilters 
            filters={filters} 
            setFilters={setFilters}
            onClose={() => setFiltersOpen(false)}
          />
        )}
      </motion.div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadClipModal onClose={() => setUploadModalOpen(false)} />
      )}
    </>
  );
}