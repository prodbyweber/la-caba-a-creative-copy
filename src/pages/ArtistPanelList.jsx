import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import AdminLayout from "@/components/admin/AdminLayout";
import { User, Search, ExternalLink, ChevronRight, Mail, AtSign } from "lucide-react";

export default function ArtistPanelList() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(false);
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
      const key = artist.id;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          artist,
          profile,
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
    if (!search) return true;
    return (
      c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.username?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout activePage="ArtistPanelList">
      <div className="min-h-screen bg-[#080809] text-white">

        {/* Header */}
        <div className="px-5 sm:px-10 pt-8 pb-5">
          <h1
            className="text-2xl font-black text-white tracking-tight mb-0.5"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.035em" }}
          >
            Creadores
          </h1>
          <p className="text-[11px] text-white/25">{allCreators.length} perfiles registrados</p>
        </div>

        {/* Search */}
        <div className="px-5 sm:px-10 mb-6">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-2xl max-w-xl">
            <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, usuario o email..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="px-5 sm:px-10 pb-20">
          {isLoading ? (
            <div className="space-y-2 max-w-4xl">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-white/[0.06] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/[0.06] rounded w-1/3" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <User className="w-12 h-12 text-white/10 mb-3" />
              <p className="text-sm text-white/25">No hay creadores para esta búsqueda</p>
            </div>
          ) : (
            /* Desktop: 2-col list | Mobile: 1-col list */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-w-5xl lg:max-w-none">
              <AnimatePresence>
                {filtered.map((c, idx) => (
                  <motion.div
                    key={c.artist?.id || c.profile?.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.015 }}
                    onClick={() => c.artist?.id && navigate(createPageUrl("ArtistDashboard") + `?artistId=${c.artist.id}`)}
                    className={`group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all ${c.artist?.id ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#1a1a1c] flex-shrink-0">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.displayName}
                          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
                          style={{ objectPosition: c.artist?.photo_position || "center center" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-black text-white/20">
                            {c.displayName?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-tight">
                        {c.displayName}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {c.username && (
                          <span className="flex items-center gap-1 text-[11px] text-white/35">
                            <AtSign className="w-3 h-3" />
                            {c.username}
                          </span>
                        )}
                        {c.genre && (
                          <span className="text-[11px] text-white/25">{c.genre}</span>
                        )}
                        {c.email && !c.username && (
                          <span className="flex items-center gap-1 text-[11px] text-white/25">
                            <Mail className="w-3 h-3" />
                            {c.email}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {c.artist?.id ? (
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 text-[10px] font-semibold text-white/70">
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </div>
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/10 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}