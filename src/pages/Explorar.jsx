import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, X, Music2 } from "lucide-react";
import ExplorarNav from "@/components/explorar/ExplorarNav";
import ExplorarHero from "@/components/explorar/ExplorarHero";
import ContentRow from "@/components/explorar/ContentRow";
import ArtistProfileModal from "@/components/explorar/ArtistProfileModal";

const ROW_LABELS = {
  trending:       "En Tendencia",
  new_releases:   "Nuevos Lanzamientos",
  mini_films:     "Mini Films",
  afro_caribbean: "Afro / Caribbean Vibes",
  experimental:   "Experimental / New Wave",
};

const ROW_ORDER = ["trending", "new_releases", "mini_films", "afro_caribbean", "experimental"];

export default function Explorar() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });
  }, []);

  const { data: explorarItems = [] } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
    enabled: !!currentUser,
  });

  const { data: artists = [] } = useQuery({
    queryKey: ["explorar-artists"],
    queryFn: () => base44.entities.Artist.filter({ status: "Active" }),
    enabled: !!currentUser,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["explorar-projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 30),
    enabled: !!currentUser,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["explorar-tracks"],
    queryFn: () => base44.entities.Track.list("-created_date", 30),
    enabled: !!currentUser,
  });

  if (!authChecked) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md px-6"
        >
          <div
            className="text-4xl font-black text-white mb-2"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.04em" }}
          >
            CABAÑA<span className="text-[#ff5833]">®</span>
          </div>
          <div className="text-xs text-white/30 uppercase tracking-widest mb-8">Creative Universe</div>
          <h2 className="text-2xl font-bold text-white mb-3">Acceso exclusivo</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Esta plataforma está disponible solo para artistas y miembros registrados de La Cabaña Creative.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all"
          >
            Iniciar sesión
          </button>
        </motion.div>
      </div>
    );
  }

  // Map ExplorarItem to card format
  const mapItemToCard = (item) => {
    const ytThumb = getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
    const artist = artists.find(a => a.id === item.artist_id);
    return {
      id: item.id,
      title: item.title,
      image: item.thumbnail_url || ytThumb || null,
      subtitle: item.subtitle || artist?.stageName,
      youtube_url: item.youtube_url,
      youtube_music_url: item.youtube_music_url,
      audio_file_url: item.audio_file_url,
      artist_id: item.artist_id,
      raw: item,
      type: "explorar",
    };
  };

  // Hero item
  const heroItem = explorarItems.find(i => i.is_hero) || explorarItems[0];
  const heroCard = heroItem ? mapItemToCard(heroItem) : null;
  const heroArtist = heroCard?.artist_id ? artists.find(a => a.id === heroCard.artist_id) : null;

  // Search
  const searchResults = searchQuery.length > 1
    ? explorarItems.filter(i =>
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(mapItemToCard)
    : [];

  const handleCardClick = (card) => {
    if (card.artist_id) {
      const artist = artists.find(a => a.id === card.artist_id);
      if (artist) setSelectedArtist(artist);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <ExplorarNav
        currentUser={currentUser}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col pt-24 px-6"
          >
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                  <Search className="w-5 h-5 text-white/50" />
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar artistas, tracks, films..."
                    className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
                  />
                </div>
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchResults.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { handleCardClick(item); setSearchOpen(false); }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden mb-2 bg-white/5">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      {item.subtitle && <p className="text-[10px] text-white/40">{item.subtitle}</p>}
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <p className="text-white/40 text-center py-12">Sin resultados para "{searchQuery}"</p>
              ) : (
                <p className="text-white/20 text-center py-12">Empieza a escribir para buscar...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      {heroCard && (
        <ExplorarHero
          item={heroCard}
          artist={heroArtist}
          onExplore={() => heroArtist && setSelectedArtist(heroArtist)}
        />
      )}

      {/* Content rows */}
      <div className="relative z-10 -mt-16 pb-24 space-y-2">
        {ROW_ORDER.map(cat => {
          const catItems = explorarItems
            .filter(i => i.row_category === cat)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map(mapItemToCard);

          if (catItems.length === 0) return null;

          return (
            <ContentRow
              key={cat}
              title={ROW_LABELS[cat]}
              items={catItems}
              onItemClick={handleCardClick}
              artists={artists}
            />
          );
        })}

        {explorarItems.length === 0 && (
          <div className="text-center py-32 px-6">
            <Music2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No hay contenido publicado aún.</p>
            <p className="text-white/15 text-xs mt-1">Los administradores pueden añadir contenido desde el panel admin.</p>
          </div>
        )}
      </div>

      {/* Artist modal */}
      <AnimatePresence>
        {selectedArtist && (
          <ArtistProfileModal
            artist={selectedArtist}
            projects={projects.filter(p => p.artist_id === selectedArtist.id)}
            tracks={tracks.filter(t => projects.some(p => p.artist_id === selectedArtist.id && p.id === t.project_id))}
            onClose={() => setSelectedArtist(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}