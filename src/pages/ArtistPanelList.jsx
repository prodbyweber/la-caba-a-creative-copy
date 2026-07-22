import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import CreatorEditModal from "@/components/admin/CreatorEditModal";
import CreatorRowMenu from "@/components/admin/CreatorRowMenu";
import CreatorDeleteConfirm from "@/components/admin/CreatorDeleteConfirm";
import { User, Search, ChevronRight } from "lucide-react";

export default function ArtistPanelList() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [authChecked, setAuthChecked] = React.useState(false);
  const [search, setSearch] = useState("");
  const [editingCreator, setEditingCreator] = useState(null);
  const [deletingCreator, setDeletingCreator] = useState(null);

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

  const { data: platformUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['platform-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: authChecked && currentUser?.role === 'admin'
  });

  const isLoading = loadingArtists || loadingProfiles || loadingUsers;

  const allCreators = React.useMemo(() => {
    const seen = new Set();
    const result = [];

    // 1) Artistas con entity Artist
    for (const artist of artists) {
      const profile = userProfiles.find(p => p.user_id === artist.user_id);
      const key = artist.id;
      if (!seen.has(key)) {
        seen.add(key);
        // Track user_id used to avoid duplicates below
        if (artist.user_id) seen.add(`uid-${artist.user_id}`);
        result.push({
          artist,
          profile,
          displayName: artist.stageName,
          avatarUrl: artist.avatar_url || profile?.avatar_url || profile?.profile_photo_url,
          genre: artist.genre,
          username: profile?.username,
          email: artist.email || profile?.user_email,
          userId: artist.user_id,
        });
      }
    }

    // 2) UserProfiles sin Artist vinculado
    for (const profile of userProfiles) {
      const linkedArtist = artists.find(a => a.user_id === profile.user_id);
      if (!linkedArtist) {
        const key = `profile-${profile.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          if (profile.user_id) seen.add(`uid-${profile.user_id}`);
          result.push({
            artist: null,
            profile,
            displayName: profile.display_name || profile.artist_name || profile.full_name || profile.user_email || "—",
            avatarUrl: profile.avatar_url || profile.profile_photo_url,
            genre: null,
            username: profile.username,
            email: profile.user_email || profile.contact_email,
            userId: profile.user_id,
            });
        }
      }
    }

    // 3) Platform Users sin Artist ni UserProfile (ej: Fiorella Failde si no hizo onboarding)
    for (const u of platformUsers) {
      if (!seen.has(`uid-${u.id}`)) {
        seen.add(`uid-${u.id}`);
        result.push({
          artist: null,
          profile: null,
          platformUser: u,
          displayName: u.full_name || u.email?.split('@')[0] || "—",
          avatarUrl: null,
          genre: null,
          username: null,
          email: u.email,
          userId: u.id,
        });
      }
    }

    return result;
  }, [artists, userProfiles, platformUsers]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.07]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[#080809] animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/[0.06] rounded w-2/5" />
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
            /* Desktop: 3-col | Mobile: 1-col — estilo Instagram row */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.07]">
              <AnimatePresence>
                {filtered.map((c, idx) => (
                  <motion.div
                    key={c.artist?.id || c.profile?.id || idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    onClick={() => {
                      const uid = c.artist?.user_id || c.profile?.user_id || c.platformUser?.id || c.userId;
                      if (c.artist?.id) {
                        navigate(`/ArtistDashboard?artistId=${c.artist.id}`);
                      } else if (uid) {
                        navigate(`/ArtistDashboard?userId=${uid}`);
                      }
                    }}
                    className="group flex items-center gap-3 px-4 py-3 bg-[#080809] hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    {/* Avatar circular pequeño */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#1a1a1c] flex-shrink-0 ring-1 ring-white/10">
                      {c.avatarUrl ? (
                        <img
                          src={c.avatarUrl}
                          alt={c.displayName}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: c.artist?.photo_position || "center center" }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm font-black text-white/20">
                            {c.displayName?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info compacta */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate leading-tight">
                        {c.displayName}
                      </p>
                      <p className="text-[11px] text-white/35 truncate">
                        {c.username ? `@${c.username}` : c.genre || c.email || "—"}
                      </p>
                    </div>

                    {/* Menú de tres puntos — siempre visible */}
                    {(c.artist?.id || c.profile?.id || c.platformUser?.id) && (
                      <CreatorRowMenu
                        onEdit={() => setEditingCreator(c)}
                        onDelete={() => setDeletingCreator(c)}
                      />
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-white/15 flex-shrink-0 group-hover:text-white/40 transition-colors" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Creator Edit Modal */}
      {editingCreator && (
        <CreatorEditModal
          creator={editingCreator}
          onClose={() => setEditingCreator(null)}
        />
      )}

      {/* Confirmación rápida de borrado */}
      {deletingCreator && (
        <CreatorDeleteConfirm
          creator={deletingCreator}
          onClose={() => setDeletingCreator(null)}
        />
      )}
    </AdminLayout>
  );
}