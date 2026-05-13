import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { User, Music2, Camera, Briefcase, Search, ExternalLink, Shield } from "lucide-react";

const FILTER_TABS = [
  { key: "all",     label: "Todos" },
  { key: "artist",  label: "Artistas" },
  { key: "creator", label: "Creadores" },
  { key: "brand",   label: "Marcas" },
];

const TYPE_CONFIG = {
  artist:  { label: "Artista",  icon: Music2,    dot: "#22c55e" },
  creator: { label: "Creador",  icon: Camera,    dot: "#a855f7" },
  brand:   { label: "Marca",    icon: Briefcase, dot: "#f97316" },
};

export default function ArtistPanelList() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setAuthChecked(true);
      if (u?.role !== 'admin') navigate('/');
    }).catch(() => navigate('/'));
  }, []);

  const { data: artists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list('-created_date'),
    enabled: authChecked && currentUser?.role === 'admin'
  });

  const { data: userProfiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['all-user-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100),
    enabled: authChecked && currentUser?.role === 'admin'
  });

  const isLoading = loadingArtists || loadingProfiles;

  const allCreators = React.useMemo(() => {
    const seen = new Set();
    const result = [];

    for (const artist of artists) {
      const profile = userProfiles.find(p => p.user_id === artist.user_id);
      const accountType = profile?.account_type || "artist";
      const key = artist.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          artist,
          profile,
          accountType,
          displayName: artist.stageName,
          avatarUrl: artist.avatar_url || profile?.avatar_url || profile?.profile_photo_url,
          genre: artist.genre,
          username: profile?.username,
          email: artist.email || profile?.user_email,
        });
      }
    }

    for (const profile of userProfiles) {
      const linkedArtist = artists.find(a => a.user_id === profile.user_id);
      if (!linkedArtist) {
        const key = `profile-${profile.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            artist: null,
            profile,
            accountType: profile.account_type || "creator",
            displayName: profile.display_name || profile.artist_name || profile.full_name || "—",
            avatarUrl: profile.avatar_url || profile.profile_photo_url,
            genre: null,
            username: profile.username,
            email: profile.user_email,
          });
        }
      }
    }

    return result;
  }, [artists, userProfiles]);

  const filtered = allCreators.filter(c => {
    const matchType = filterType === "all" || c.accountType === filterType;
    const matchSearch = !search || c.displayName?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = {
    all:     allCreators.length,
    artist:  allCreators.filter(c => c.accountType === "artist").length,
    creator: allCreators.filter(c => c.accountType === "creator").length,
    brand:   allCreators.filter(c => c.accountType === "brand").length,
  };

  return (
    <AdminLayout activePage="ArtistPanelList">
      <div className="min-h-screen bg-[#080809] text-white">

        {/* Page header */}
        <div className="px-5 sm:px-10 pt-8 pb-6">
          <h1
            className="text-2xl font-black text-white tracking-tight mb-0.5"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.035em" }}
          >
            Creadores
          </h1>
          <p className="text-[11px] text-white/25">{allCreators.length} perfiles registrados</p>
        </div>

        {/* Filters + search */}
        <div className="px-5 sm:px-10 mb-7 flex flex-col sm:flex-row gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
            {FILTER_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  filterType === t.key ? "bg-white text-black" : "text-white/40 hover:text-white"
                }`}
              >
                {t.label}
                <span className={`ml-1.5 text-[9px] ${filterType === t.key ? "text-black/40" : "text-white/20"}`}>
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl">
            <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="px-5 sm:px-10 pb-16">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-[4/5] bg-white/[0.04] animate-pulse" />
                  <div className="pt-2.5 space-y-1.5">
                    <div className="h-3 bg-white/[0.04] rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-white/[0.03] rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <User className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/25">No hay creadores para este filtro</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              <AnimatePresence>
                {filtered.map((c, idx) => {
                  const cfg = TYPE_CONFIG[c.accountType] || TYPE_CONFIG.artist;
                  const TypeIcon = cfg.icon;

                  return (
                    <motion.div
                      key={c.artist?.id || c.profile?.id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group cursor-pointer"
                      onClick={() => c.artist?.id && navigate(createPageUrl("ArtistDashboard") + `?artistId=${c.artist.id}`)}
                    >
                      {/* Portrait photo */}
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#111]">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.displayName}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-black text-white/10">
                              {c.displayName?.[0]?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}

                        {/* Gradient overlay */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)"
                          }}
                        />

                        {/* Type dot */}
                        <div className="absolute top-2.5 right-2.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
                          />
                        </div>

                        {/* Dashboard button — appears on hover */}
                        {c.artist?.id && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-semibold text-white">
                              <ExternalLink className="w-3 h-3" />
                              Ver dashboard
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info below */}
                      <div className="pt-2.5 px-0.5">
                        <p className="text-[12px] font-bold text-white truncate leading-tight">
                          {c.displayName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <TypeIcon className="w-2.5 h-2.5 flex-shrink-0" style={{ color: cfg.dot }} />
                          <p className="text-[10px] text-white/30 truncate">
                            {c.genre || c.username ? (c.genre || `@${c.username}`) : cfg.label}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}