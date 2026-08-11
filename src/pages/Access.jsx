import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Music2 } from "lucide-react";
import { ExplorarProvider } from "@/context/ExplorarContext.jsx";
import GlobalModals from "@/components/explorar/GlobalModals";
import ContentRow from "@/components/explorar/ContentRow";
import Top10Row from "@/components/explorar/Top10Row";
import AccessNav from "@/components/access/AccessNav";
import AccessHero from "@/components/access/AccessHero";
import AccessExperience from "@/components/access/AccessExperience";
import AccessCTA from "@/components/access/AccessCTA";
import AccessFooter from "@/components/access/AccessFooter";

const LOGO = "https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png";

function getYoutubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

// Landing cinematográfica de entrada a Cabaña Creative.
// Reutiliza exactamente el mismo contenido real de /explorar (ExplorarItem,
// Artist, ExplorarSection, SectionAssignment) con una presentación premium.
export default function Access() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => setCurrentUser(null));
  }, []);

  // Mismas queries públicas que /explorar (sin gateo de auth)
  const { data: explorarItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["explorar-items"],
    queryFn: () => base44.entities.ExplorarItem.filter({ is_active: true }),
  });

  const { data: artists = [], isLoading: loadingArtists } = useQuery({
    queryKey: ["explorar-artists"],
    queryFn: () => base44.entities.Artist.filter({ status: "Active" }),
  });

  const { data: explorarSections = [] } = useQuery({
    queryKey: ["explorar-sections"],
    queryFn: () => base44.entities.ExplorarSection.list("order"),
  });

  const { data: sectionAssignments = [] } = useQuery({
    queryKey: ["section-assignments"],
    queryFn: () => base44.entities.SectionAssignment.list("order"),
  });

  const items = explorarItems;

  // Map ExplorarItem → card (igual que /explorar)
  const mapItemToCard = (item) => {
    const ytThumb = getYoutubeThumbnail(item.youtube_url || item.youtube_music_url);
    const artist = artists.find(a => a.id === item.artist_id);
    const heroMediaUrl = item.hero_media_url || item.preview_media_url || null;
    const heroMediaType = item.hero_media_url
      ? item.hero_media_type
      : item.preview_media_url
        ? item.preview_media_type
        : "image";
    return {
      id: item.id,
      title: item.title,
      image: item.thumbnail_url || ytThumb || null,
      subtitle: item.subtitle || artist?.stageName,
      youtube_url: item.youtube_url,
      youtube_music_url: item.youtube_music_url,
      audio_file_url: item.audio_file_url,
      artist_id: item.artist_id,
      hero_media_url: heroMediaUrl,
      hero_media_type: heroMediaType,
      hero_link: item.hero_link,
      hero_link_label: item.hero_link_label,
      raw: item,
      type: "explorar",
    };
  };

  // Hero items (mismo criterio que /explorar)
  const heroRawItems = items.filter(i => i.is_hero).sort((a, b) => (a.hero_order ?? 0) - (b.hero_order ?? 0));
  const heroCards = heroRawItems.length > 0
    ? heroRawItems.map(mapItemToCard)
    : items.slice(0, 1).map(mapItemToCard);

  const allCards = items.map(mapItemToCard);

  // Secciones activas con sus cards
  const activeSections = explorarSections
    .filter(s => s.is_active !== false)
    .map(section => {
      const sectionItemIds = sectionAssignments
        .filter(a => a.section_id === section.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(a => a.item_id);
      const sectionCards = sectionItemIds
        .map(id => items.find(i => i.id === id && i.is_active !== false))
        .filter(Boolean)
        .map(mapItemToCard);
      return { section, cards: sectionCards };
    })
    .filter(s => s.cards.length > 0);

  // Dividir secciones alrededor del bloque de experiencia (intercalado cinematográfico)
  const splitAt = Math.ceil(activeSections.length / 2);
  const firstHalf = activeSections.slice(0, splitAt);
  const secondHalf = activeSections.slice(splitAt);

  const isLoading = loadingItems || loadingArtists;

  const renderRow = ({ section, cards }, key) => {
    const isTop10 = section.section_type === "top10";
    const RowComponent = isTop10 ? Top10Row : ContentRow;
    return (
      <RowComponent
        key={key}
        title={section.label}
        items={cards}
        onItemClick={() => {}}
        artists={artists}
        currentUser={currentUser}
        allItems={allCards}
        onSelectRecommended={() => {}}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          src={LOGO}
          alt="Cabaña Creative"
          className="w-16 h-16 object-contain"
          style={{ animation: "cabana-pulse 1.6s ease-in-out infinite" }}
        />
        <style>{`@keyframes cabana-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.55; transform:scale(0.92); } }`}</style>
      </div>
    );
  }

  return (
    <ExplorarProvider>
      <GlobalModals />
      <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">
        <AccessNav />

        {/* Hero a pantalla completa */}
        <AccessHero items={heroCards} artists={artists} />

        {/* Contenido real de /explorar — primera mitad de secciones */}
        <div className="relative z-10 pt-10 sm:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 sm:px-8 mb-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff5833] mb-2">Explora</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
              Lo último de Cabaña Creative
            </h2>
          </motion.div>

          {firstHalf.map((s, i) => renderRow(s, `first-${s.section.id}-${i}`))}

          {firstHalf.length === 0 && secondHalf.length === 0 && items.length === 0 && (
            <div className="text-center py-32 px-6">
              <Music2 className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No hay contenido publicado aún.</p>
            </div>
          )}
        </div>

        {/* Experiencia cinematográfica */}
        <AccessExperience rawItems={items} artists={artists} />

        {/* Más contenido real de /explorar — segunda mitad */}
        {secondHalf.length > 0 && (
          <div className="relative z-10 pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="px-4 sm:px-8 mb-2"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ff5833] mb-2">Descubre</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
                Producciones, films y soundtracks
              </h2>
            </motion.div>
            {secondHalf.map((s, i) => renderRow(s, `second-${s.section.id}-${i}`))}
          </div>
        )}

        {/* CTA final cinematográfico */}
        <AccessCTA heroItems={heroCards} />

        {/* Footer */}
        <AccessFooter />
      </div>
    </ExplorarProvider>
  );
}