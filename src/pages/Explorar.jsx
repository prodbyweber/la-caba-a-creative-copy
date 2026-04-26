import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, Search, X, ChevronLeft, ChevronRight, Film, Music2, Users, Compass } from "lucide-react";
import ExplorarNav from "@/components/explorar/ExplorarNav";
import ExplorarHero from "@/components/explorar/ExplorarHero";
import ContentRow from "@/components/explorar/ContentRow";
import ArtistProfileModal from "@/components/explorar/ArtistProfileModal";

export default function Explorar() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
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

  const { data: artists = [] } = useQuery({
    queryKey: ["explorar-artists"],
    queryFn: () => base44.entities.Artist.filter({ status: "Active" }),
    enabled: !!currentUser,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["explorar-projects"],
    queryFn: () => base44.entities.Project.list("-created_date", 50),
    enabled: !!currentUser,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ["explorar-tracks"],
    queryFn: () => base44.entities.Track.list("-created_date", 60),
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
          <div className="mb-8">
            <div className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.04em" }}>
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
          </div>
        </motion.div>
      </div>
    );
  }

  // Build content rows from real data
  const artistsWithCovers = artists.filter(a => a.avatar_url);
  const projectsWithCovers = projects.filter(p => p.cover_url);
  const tracksWithCovers = tracks.filter(t => t.cover_url || t.audio_file_url);

  // Categorized rows
  const newReleases = projectsWithCovers.slice(0, 12);
  const trending = [...artistsWithCovers].sort(() => Math.random() - 0.5).slice(0, 12);
  const miniFilms = projects.filter(p => p.type === "Single" || p.type === "EP").filter(p => p.cover_url).slice(0, 10);
  const experimental = projects.filter(p => p.genre && ["Experimental", "New Wave", "Electronic", "Jazz"].some(g => p.genre?.toLowerCase().includes(g.toLowerCase()))).filter(p => p.cover_url).slice(0, 10);
  const urban = projects.filter(p => p.genre && ["Afro", "Reggaeton", "Trap", "Urban", "Afrobeats", "Caribbean"].some(g => p.genre?.toLowerCase().includes(g.toLowerCase()))).filter(p => p.cover_url).slice(0, 10);

  // Fallback: use all projects in categories if filtered lists are empty
  const rowTrending = trending.length > 3 ? trending : artistsWithCovers.slice(0, 12);
  const rowNewReleases = newReleases.length > 3 ? newReleases : projectsWithCovers.slice(0, 12);
  const rowMiniFilms = miniFilms.length > 2 ? miniFilms : projectsWithCovers.slice(2, 12);
  const rowUrban = urban.length > 2 ? urban : projectsWithCovers.slice(4, 14);
  const rowExperimental = experimental.length > 2 ? experimental : projectsWithCovers.slice(6, 16);

  // Featured hero: pick the newest project with cover
  const heroProject = projectsWithCovers[0];
  const heroArtist = heroProject ? artists.find(a => a.id === heroProject.artist_id) : artistsWithCovers[0];

  // Search filter
  const searchResults = searchQuery.length > 1
    ? [
        ...artists.filter(a => a.stageName?.toLowerCase().includes(searchQuery.toLowerCase())).map(a => ({ ...a, _type: "artist" })),
        ...projects.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(p => ({ ...p, _type: "project" })),
        ...tracks.filter(t => t.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ ...t, _type: "track" })),
      ].slice(0, 20)
    : [];

  const mapArtistToCard = (artist) => ({
    id: artist.id,
    title: artist.stageName,
    image: artist.avatar_url,
    subtitle: artist.genre,
    type: "artist",
    raw: artist,
  });

  const mapProjectToCard = (project) => ({
    id: project.id,
    title: project.title,
    image: project.cover_url,
    subtitle: project.genre || project.type,
    type: "project",
    raw: project,
  });

  const handleCardClick = (item) => {
    if (item.type === "artist") {
      setSelectedArtist(item.raw);
    } else {
      // Find the artist for this project
      const artist = artists.find(a => a.id === item.raw?.artist_id);
      if (artist) setSelectedArtist(artist);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
      <ExplorarNav
        currentUser={currentUser}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
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
                    placeholder="Buscar artistas, proyectos, tracks..."
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
                      key={`${item._type}-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => { handleCardClick({ ...item, type: item._type, raw: item }); setSearchOpen(false); }}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white/5">
                        {(item.avatar_url || item.cover_url) ? (
                          <img src={item.avatar_url || item.cover_url} alt={item.stageName || item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music2 className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{item.stageName || item.title}</p>
                      <p className="text-[10px] text-white/40 capitalize">{item._type}</p>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <p className="text-white/40 text-center py-12">No se encontraron resultados para "{searchQuery}"</p>
              ) : (
                <p className="text-white/20 text-center py-12">Empieza a escribir para buscar...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {/* Hero */}
        {heroProject && (
          <ExplorarHero
            project={heroProject}
            artist={heroArtist}
            onArtistClick={() => heroArtist && setSelectedArtist(heroArtist)}
          />
        )}

        {/* Content Rows */}
        <div className="relative z-10 -mt-16 pb-20 space-y-2">
          {rowTrending.length > 0 && (
            <ContentRow
              title="🔥 En Tendencia"
              items={rowTrending.map(mapArtistToCard)}
              onItemClick={handleCardClick}
              variant="portrait"
            />
          )}
          {rowNewReleases.length > 0 && (
            <ContentRow
              title="✨ Nuevos Lanzamientos"
              items={rowNewReleases.map(mapProjectToCard)}
              onItemClick={handleCardClick}
              variant="landscape"
            />
          )}
          {rowMiniFilms.length > 0 && (
            <ContentRow
              title="🎬 Mini Films"
              items={rowMiniFilms.map(mapProjectToCard)}
              onItemClick={handleCardClick}
              variant="landscape"
            />
          )}
          {rowUrban.length > 0 && (
            <ContentRow
              title="🌍 Afro / Caribbean Vibes"
              items={rowUrban.map(mapProjectToCard)}
              onItemClick={handleCardClick}
              variant="landscape"
            />
          )}
          {rowExperimental.length > 0 && (
            <ContentRow
              title="🌀 Experimental / New Wave"
              items={rowExperimental.map(mapProjectToCard)}
              onItemClick={handleCardClick}
              variant="landscape"
            />
          )}

          {/* All Artists Row */}
          {artistsWithCovers.length > 0 && (
            <ContentRow
              title="👤 Artistas"
              items={artistsWithCovers.map(mapArtistToCard)}
              onItemClick={handleCardClick}
              variant="portrait"
            />
          )}
        </div>
      </main>

      {/* Artist Modal */}
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