import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, User, ExternalLink, Music2, Camera, Briefcase, Search, Shield } from "lucide-react";

const ACCOUNT_TYPES = [
  { key: "all", label: "Todos" },
];

const TYPE_CONFIG = {
  artist: { label: "Artista", icon: Music2, color: "rgba(255,255,255,0.15)" },
  creator: { label: "Creador", icon: Camera, color: "rgba(255,255,255,0.15)" },
  brand: { label: "Marca", icon: Briefcase, color: "rgba(255,255,255,0.15)" },
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

  const { data: myArtist } = useQuery({
    queryKey: ['myArtist', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      const myArtists = await base44.entities.Artist.filter({ user_id: currentUser.id });
      return myArtists[0] || null;
    },
    enabled: !!currentUser?.id
  });

  const isLoading = loadingArtists || loadingProfiles;

  // Merge artist + userProfile data
  const allCreators = React.useMemo(() => {
    const seen = new Set();
    const result = [];

    // Artists with linked profiles
    for (const artist of artists) {
      const profile = userProfiles.find(p => p.user_id === artist.user_id);
      const accountType = profile?.account_type || "artist";
      const key = artist.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ artist, profile, accountType, displayName: artist.stageName, avatarUrl: artist.avatar_url || profile?.avatar_url || profile?.profile_photo_url });
      }
    }

    // UserProfiles without linked artist
    for (const profile of userProfiles) {
      const linkedArtist = artists.find(a => a.user_id === profile.user_id);
      if (!linkedArtist) {
        const key = `profile-${profile.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({ artist: null, profile, accountType: profile.account_type || "creator", displayName: profile.display_name || profile.artist_name || profile.full_name || "—", avatarUrl: profile.avatar_url || profile.profile_photo_url });
        }
      }
    }

    return result;
  }, [artists, userProfiles]);

  const filtered = allCreators.filter(c => {
    const matchType = filterType === "all" || c.accountType === filterType;
    const matchSearch = !search || c.displayName?.toLowerCase().includes(search.toLowerCase()) || c.profile?.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = {
    all: allCreators.length,
    artist: allCreators.filter(c => c.accountType === "artist").length,
    creator: allCreators.filter(c => c.accountType === "creator").length,
    brand: allCreators.filter(c => c.accountType === "brand").length,
  };

  const handleViewDashboard = (artistId) => {
    navigate(createPageUrl("ArtistDashboard") + `?artistId=${artistId}`);
  };

  return (
    <div className="min-h-screen bg-[#080809] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#080809]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(createPageUrl("AdminDashboard"))}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white/50" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white tracking-tight" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
              Creadores
            </h1>
            <p className="text-[11px] text-white/30">{allCreators.length} perfiles registrados</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">

        {/* Filtros + búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Type filter */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {ACCOUNT_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === t.key ? "bg-white text-black" : "text-white/40 hover:text-white"}`}
              >
                {t.label}
                <span className={`ml-1.5 text-[9px] ${filterType === t.key ? "text-black/50" : "text-white/20"}`}>{counts[t.key]}</span>
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
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
            />
          </div>
        </div>

        {/* Admin card */}
        {currentUser && myArtist && (
          <div className="mb-8">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-3">Tu cuenta</p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-white/[0.04] border border-white/[0.1] rounded-xl"
            >
              <div className="w-10 h-10 rounded-full border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#1a1a1a]">
                {myArtist.avatar_url ? (
                  <img src={myArtist.avatar_url} alt={myArtist.stageName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-white/40">{myArtist.stageName?.[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{myArtist.stageName}</p>
                <p className="text-[11px] text-white/30">{currentUser.email}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-white/15 text-white/40">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
                <button
                  onClick={() => handleViewDashboard(myArtist.id)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-xs font-semibold text-white/70 hover:text-white hover:border-white/30 transition-all"
                >
                  Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Creators list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <User className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No hay creadores para este filtro</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((c, idx) => {
              const TypeIcon = TYPE_CONFIG[c.accountType]?.icon || User;
              const typeLabel = TYPE_CONFIG[c.accountType]?.label || c.accountType;

              return (
                <motion.div
                  key={c.artist?.id || c.profile?.id || idx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.015 }}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[#1a1a1a] border border-white/[0.08]">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-black text-white/25">{c.displayName?.[0]?.toUpperCase() || "?"}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate leading-tight">{c.displayName}</p>
                    <div className="flex items-center gap-2">
                      {c.profile?.username && <span className="text-[11px] text-white/30">@{c.profile.username}</span>}
                      {!c.profile?.username && c.profile?.user_email && <span className="text-[11px] text-white/25 truncate">{c.profile.user_email}</span>}
                      <span className="flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/20">
                        <TypeIcon className="w-2.5 h-2.5" />{typeLabel}
                      </span>
                      {c.artist?.genre && <span className="text-[10px] text-white/20 truncate">{c.artist.genre}</span>}
                    </div>
                  </div>

                  {/* Action */}
                  {c.artist?.id ? (
                    <button
                      onClick={() => handleViewDashboard(c.artist.id)}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-semibold text-white/40 hover:text-white hover:border-white/25 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dashboard
                    </button>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] text-white/15">—</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}