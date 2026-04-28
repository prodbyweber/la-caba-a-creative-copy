import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const emotions = [
  "Melancolía", "Euforia", "Nostalgia", "Rebeldía", "Paz", "Ansiedad",
  "Esperanza", "Rabia", "Amor", "Soledad", "Empoderamiento", "Vulnerabilidad",
  "Libertad", "Misterio", "Pasión", "Desolación", "Júbilo", "Introspección",
  "Determinación", "Confusión", "Serenidad", "Intensidad", "Ternura", "Valentía",
  "Tristeza", "Éxtasis", "Deseo", "Miedo", "Confianza", "Desesperanza",
  "Gratitud", "Orgullo", "Resentimiento", "Compasión"
];

const vibes = ["Alta energía", "Media energía", "Baja energía", "Variable/Dinámica"];

const genres = [
  "Trap", "Reggaeton", "R&B", "Pop", "Hip Hop", "Drill", "Afrobeat",
  "Dembow", "House", "Techno", "Indie", "Rock", "Punk", "Metal",
  "Jazz", "Soul", "Funk", "Electronic", "Ambient", "Lo-fi", "Reggae",
  "Dancehall", "UK Garage", "Grime", "Baile Funk", "Cumbia", "Salsa"
];

const textures = [
  "Espacioso/Reverberante", "Crudo/Seco", "Atmosférico/Ambient", "Agresivo/Distorsionado",
  "Suave/Sedoso", "Glitchy/Experimental", "Orgánico/Acústico", "Sintético/Digital",
  "Minimalista", "Maximalista/Denso", "Vintage/Lo-fi", "Cristalino/Hi-fi"
];

const colorPalettes = [
  { name: "Midnight Soul", colors: ["#0D0D0D", "#1A1A1D", "#2D2D30", "#4A4A4F"], category: "Oscuro" },
  { name: "Neon Pulse", colors: ["#FF006E", "#8338EC", "#3A86FF", "#FB5607"], category: "Neón" },
  { name: "Elegant Noir", colors: ["#000000", "#1C1C1C", "#C9A66B", "#FFFFFF"], category: "Elegante" },
  { name: "Jungle Vibe", colors: ["#1B4332", "#2D6A4F", "#52B788", "#95D5B2"], category: "Jungla" },
  { name: "Cinematic Gold", colors: ["#1A1A1D", "#6F4E37", "#C5A572", "#E8DCC4"], category: "Cinemático" },
  { name: "Urban Night", colors: ["#0B0B0D", "#FF4500", "#FFD700", "#00CED1"], category: "Urbano" },
  { name: "Vintage Tape", colors: ["#2C1810", "#8B4513", "#DAA520", "#F4E4C1"], category: "Vintage" },
  { name: "Pure Minimal", colors: ["#FAFAFA", "#E0E0E0", "#9E9E9E", "#424242"], category: "Minimal" },
  { name: "Luxury Black", colors: ["#000000", "#1C1C1C", "#B8860B", "#FFD700"], category: "Luxury" },
  { name: "Electric Dream", colors: ["#120136", "#7B2CBF", "#E0AAFF", "#FF006E"], category: "Neón" },
  { name: "Deep Ocean", colors: ["#001219", "#005F73", "#0A9396", "#94D2BD"], category: "Oscuro" },
  { name: "Royal Purple", colors: ["#22092C", "#872341", "#BE3144", "#F05941"], category: "Elegante" }
];

const aesthetics = [
  "Cinemático", "Urbano/Callejero", "Minimalista", "Maximalista", "Retro/Vintage",
  "Futurista", "Oscuro/Gótico", "Luminoso/Colorido", "Natural/Orgánico",
  "Industrial", "Glam/Luxury", "Underground", "Pop Art", "Surrealista"
];

const narratives = [
  "Superación personal", "Amor y desamor", "Lucha social", "Vida en la calle",
  "Éxito y ambición", "Introspección existencial", "Fiesta y celebración",
  "Dolor y sanación", "Identidad y pertenencia", "Rebeldía y libertad",
  "Nostalgia del pasado", "Sueños y aspiraciones", "Crítica social"
];

// Helper function for YouTube embed - soporta YouTube y YouTube Music
const getYouTubeEmbedId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Limpiar la URL
  url = url.trim();
  
  // Patrones para YouTube y YouTube Music
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  
  return null;
};

export default function ADNdeMarca({ onClose }) {
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [hasExistingDNA, setHasExistingDNA] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selections, setSelections] = useState({
    firstName: "",
    lastName: "",
    artistName: "",
    birthCountry: "",
    residenceCountry: "",
    phoneCode: "+34",
    phoneNumber: "",
    emotions: [],
    vibe: "",
    genres: [],
    textures: [],
    musicReferences: [],
    narratives: [],
    narrativeText: "",
    visualLinks: [],
    colors: ["#000000", "#FFFFFF", "#10B981", "#6366F1"],
    palette: null,
    typography: { primary: "", secondary: "" }
  });

  const [user, setUser] = React.useState(null);
  const [artist, setArtist] = React.useState(null);
  const [hasPaid, setHasPaid] = React.useState(false);
  const [showPaymentGate, setShowPaymentGate] = React.useState(false);
  const [savedDnaId, setSavedDnaId] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Si hay artistId, cargar datos del artista
        if (artistId) {
          const artists = await base44.entities.Artist.list();
          const foundArtist = artists.find(a => a.id === artistId);
          setArtist(foundArtist);
          
          // Buscar ADN de marca del artista específico
          const dnas = await base44.entities.ArtistBrandDNA.filter({ artist_id: artistId });
          if (dnas.length > 0) {
            const dna = dnas[0];
            setSelections(dna);
            setSavedDnaId(dna.id);
            setHasPaid(true);
            setHasExistingDNA(true);
            setShowResult(true);
          } else {
            // Pre-rellenar con datos del artista si no tiene ADN
            if (foundArtist) {
              const nameParts = foundArtist.legalName?.split(' ') || [];
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(' ') || "";
              
              // Extraer código de país del teléfono si existe
              let phoneCode = "+34";
              let phoneNumber = "";
              if (foundArtist.phone) {
                const phoneMatch = foundArtist.phone.match(/^(\+\d+)\s*(.+)$/);
                if (phoneMatch) {
                  phoneCode = phoneMatch[1];
                  phoneNumber = phoneMatch[2];
                } else {
                  phoneNumber = foundArtist.phone;
                }
              }
              
              // Pre-rellenar género musical si existe
              let genres = [];
              if (foundArtist.genre) {
                genres = [foundArtist.genre];
              }
              
              setSelections(prev => ({
                ...prev,
                artistName: foundArtist.stageName || "",
                firstName: firstName,
                lastName: lastName,
                phoneCode: phoneCode,
                phoneNumber: phoneNumber,
                residenceCountry: foundArtist.location || "",
                genres: genres,
              }));
            }
          }
        } else {
          // Cargar DNA del usuario actual si no hay artistId
          const dnas = await base44.entities.ArtistBrandDNA.filter({ user_id: currentUser.id });
          if (dnas.length > 0) {
            const dna = dnas[0];
            setSelections(dna);
            setSavedDnaId(dna.id);
            setHasPaid(dna.has_paid || false);
            setHasExistingDNA(true);
            setShowResult(true);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [artistId]);

  const [tempInput, setTempInput] = useState("");
  const [limitWarning, setLimitWarning] = useState("");

  const [countrySearch, setCountrySearch] = useState("");
  const [musicRefInput, setMusicRefInput] = useState({ url: "", note: "" });
  
  const totalSteps = 10;

  const countries = [
    { name: "España", code: "+34" },
    { name: "México", code: "+52" },
    { name: "Argentina", code: "+54" },
    { name: "Colombia", code: "+57" },
    { name: "Chile", code: "+56" },
    { name: "Perú", code: "+51" },
    { name: "Venezuela", code: "+58" },
    { name: "Ecuador", code: "+593" },
    { name: "Guatemala", code: "+502" },
    { name: "Cuba", code: "+53" },
    { name: "Bolivia", code: "+591" },
    { name: "República Dominicana", code: "+1-809" },
    { name: "Honduras", code: "+504" },
    { name: "Paraguay", code: "+595" },
    { name: "El Salvador", code: "+503" },
    { name: "Nicaragua", code: "+505" },
    { name: "Costa Rica", code: "+506" },
    { name: "Puerto Rico", code: "+1-787" },
    { name: "Panamá", code: "+507" },
    { name: "Uruguay", code: "+598" },
    { name: "Estados Unidos", code: "+1" },
    { name: "Francia", code: "+33" },
    { name: "Italia", code: "+39" },
    { name: "Alemania", code: "+49" },
    { name: "Reino Unido", code: "+44" },
    { name: "Portugal", code: "+351" },
    { name: "Brasil", code: "+55" }
  ].sort((a, b) => a.name.localeCompare(b.name));

  const toggleSelection = (category, item, maxLimit) => {
    const current = selections[category];
    const isSelected = current.includes(item);

    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [category]: current.filter(i => i !== item)
      }));
      setLimitWarning("");
    } else {
      if (current.length >= maxLimit) {
        setLimitWarning(`Puedes seleccionar hasta ${maxLimit} opciones.`);
        setTimeout(() => setLimitWarning(""), 2000);
        return;
      }
      setSelections(prev => ({
        ...prev,
        [category]: [...current, item]
      }));
    }
  };

  const selectVibe = (vibe) => {
    setSelections(prev => ({ ...prev, vibe }));
  };

  const selectColor = (color) => {
    const current = selections.colors;
    if (current.includes(color)) {
      setSelections(prev => ({
        ...prev,
        colors: current.filter(c => c !== color),
        palette: null
      }));
    } else {
      if (current.length >= 3) {
        setLimitWarning("Puedes seleccionar hasta 3 colores.");
        setTimeout(() => setLimitWarning(""), 2000);
        return;
      }
      setSelections(prev => ({
        ...prev,
        colors: [...current, color],
        palette: null
      }));
    }
  };

  const selectPalette = (palette) => {
    setSelections(prev => ({
      ...prev,
      palette: palette.name,
      colors: palette.colors.slice(0, 3)
    }));
  };

  const addReference = (category) => {
    if (!tempInput.trim()) return;
    setSelections(prev => ({
      ...prev,
      [category]: [...prev[category], tempInput.trim()]
    }));
    setTempInput("");
  };

  const removeReference = (category, index) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };



  const updateColor = (index, color) => {
    const newColors = [...selections.colors];
    newColors[index] = color;
    setSelections(prev => ({ ...prev, colors: newColors }));
  };

  const selectTypography = (type, font) => {
    setSelections(prev => ({
      ...prev,
      typography: { ...prev.typography, [type]: font }
    }));
  };

  const addMusicReference = () => {
    if (!musicRefInput.url.trim() || selections.musicReferences.length >= 4) return;
    setSelections(prev => ({
      ...prev,
      musicReferences: [...prev.musicReferences, { ...musicRefInput }]
    }));
    setMusicRefInput({ url: "", note: "" });
  };

  const removeMusicReference = (index) => {
    setSelections(prev => ({
      ...prev,
      musicReferences: prev.musicReferences.filter((_, i) => i !== index)
    }));
  };



  const canProceed = () => {
    switch(currentStep) {
      case 1: return selections.firstName.trim() && selections.lastName.trim() && selections.artistName.trim() && selections.birthCountry && selections.residenceCountry && selections.phoneNumber.trim();
      case 2: return selections.emotions.length > 0;
      case 3: return selections.vibe !== "";
      case 4: return selections.genres.length > 0;
      case 5: return selections.textures.length > 0;
      case 6: return true;
      case 7: return selections.narratives.length > 0;
      case 8: return selections.visualLinks.length > 0;
      case 9: return hasPaid || user?.role === 'admin';
      case 10: return selections.colors.length >= 4 && selections.typography.primary !== "";
      default: return false;
    }
  };

  const handleStepChange = (newStep) => {
    if (newStep === 9 && !hasPaid && user?.role !== 'admin') {
      setShowPaymentGate(true);
    } else {
      setCurrentStep(newStep);
    }
  };

  const handlePaymentSuccess = () => {
    setHasPaid(true);
    setShowPaymentGate(false);
    setCurrentStep(9);
  };

  const saveDNA = async () => {
    try {
      const dnaData = {
        ...selections,
        user_id: user.id,
        artist_id: artistId || null,
        has_paid: hasPaid
      };

      if (savedDnaId) {
        await base44.entities.ArtistBrandDNA.update(savedDnaId, dnaData);
      } else {
        const created = await base44.entities.ArtistBrandDNA.create(dnaData);
        setSavedDnaId(created.id);
      }
      
      alert("ADN de Marca guardado exitosamente");
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
  };

  const generateResult = () => {
    saveDNA();
    setShowResult(true);
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <StepContainer title="Datos Básicos" subtitle="Información de contacto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={selections.firstName}
                    onChange={(e) => setSelections(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={selections.lastName}
                    onChange={(e) => setSelections(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre artístico *</label>
                <input
                  type="text"
                  value={selections.artistName}
                  onChange={(e) => setSelections(prev => ({ ...prev, artistName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Tu nombre artístico"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">País de nacimiento *</label>
                  <select
                    value={selections.birthCountry}
                    onChange={(e) => setSelections(prev => ({ ...prev, birthCountry: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0B0D]">Selecciona un país</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name} className="bg-[#0B0B0D]">{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">País de residencia *</label>
                  <select
                    value={selections.residenceCountry}
                    onChange={(e) => setSelections(prev => ({ ...prev, residenceCountry: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="" className="bg-[#0B0B0D]">Selecciona un país</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name} className="bg-[#0B0B0D]">{country.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Número de teléfono *</label>
                <div className="flex gap-3">
                  <select
                    value={selections.phoneCode}
                    onChange={(e) => setSelections(prev => ({ ...prev, phoneCode: e.target.value }))}
                    className="w-32 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    {countries.map(country => (
                      <option key={country.code} value={country.code} className="bg-[#0B0B0D]">
                        {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={selections.phoneNumber}
                    onChange={(e) => setSelections(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    placeholder="123 456 789"
                  />
                </div>
              </div>
            </div>
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer title="Emoción Núcleo" subtitle="¿Qué emociones definen tu música?">
            <SelectionGrid>
              {emotions.map(emotion => (
                <SelectionButton
                  key={emotion}
                  selected={selections.emotions.includes(emotion)}
                  onClick={() => toggleSelection('emotions', emotion, 3)}
                >
                  {emotion}
                </SelectionButton>
              ))}
            </SelectionGrid>
          </StepContainer>
        );

      case 3:
        return (
          <StepContainer title="Energía / Vibe" subtitle="¿Qué nivel de energía transmite tu arte?">
            <SelectionGrid>
              {vibes.map(vibe => (
                <SelectionButton
                  key={vibe}
                  selected={selections.vibe === vibe}
                  onClick={() => selectVibe(vibe)}
                >
                  {vibe}
                </SelectionButton>
              ))}
            </SelectionGrid>
          </StepContainer>
        );

      case 4:
        return (
          <StepContainer title="Géneros Musicales" subtitle="¿Qué géneros te representan?">
            <SelectionGrid>
              {genres.map(genre => (
                <SelectionButton
                  key={genre}
                  selected={selections.genres.includes(genre)}
                  onClick={() => toggleSelection('genres', genre, 4)}
                >
                  {genre}
                </SelectionButton>
              ))}
            </SelectionGrid>
          </StepContainer>
        );

      case 5:
        return (
          <StepContainer title="Textura Sonora" subtitle="¿Cómo suena tu música?">
            <SelectionGrid>
              {textures.map(texture => (
                <SelectionButton
                  key={texture}
                  selected={selections.textures.includes(texture)}
                  onClick={() => toggleSelection('textures', texture, 3)}
                >
                  {texture}
                </SelectionButton>
              ))}
            </SelectionGrid>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer title="Referencias Musicales" subtitle="Comparte canciones que inspiren tu sonido">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Añade hasta 4 canciones de YouTube (máx. 4)
                </label>
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={musicRefInput.url}
                    onChange={(e) => setMusicRefInput(prev => ({ ...prev, url: e.target.value }))}
                    disabled={selections.musicReferences.length >= 4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <textarea
                    value={musicRefInput.note}
                    onChange={(e) => setMusicRefInput(prev => ({ ...prev, note: e.target.value }))}
                    disabled={selections.musicReferences.length >= 4}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none disabled:opacity-50"
                    placeholder="¿Qué te gusta de esta referencia? (opcional)"
                  />
                  <button
                    onClick={addMusicReference}
                    disabled={selections.musicReferences.length >= 4 || !musicRefInput.url.trim()}
                    className="w-full px-4 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Añadir Referencia ({selections.musicReferences.length}/4)
                  </button>
                </div>

                {selections.musicReferences.length > 0 && (
                  <div className="space-y-4">
                    {selections.musicReferences.map((ref, idx) => {
                      const videoId = getYouTubeEmbedId(ref.url);
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/5 rounded-xl overflow-hidden border border-white/10"
                        >
                          {videoId ? (
                            <div className="aspect-video w-full bg-black relative">
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}`}
                                title={`YouTube video ${idx + 1}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video w-full bg-black flex items-center justify-center">
                              <a 
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                              >
                                Ver en YouTube →
                              </a>
                            </div>
                          )}
                          <div className="p-4">
                            {ref.note && (
                              <p className="text-sm text-gray-400 mb-3 italic">"{ref.note}"</p>
                            )}
                            <button
                              onClick={() => removeMusicReference(idx)}
                              className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </StepContainer>
        );

      case 7:
        return (
          <StepContainer title="Narrativa" subtitle="¿Qué historias cuentas?">
            <SelectionGrid>
              {narratives.map(narrative => (
                <SelectionButton
                  key={narrative}
                  selected={selections.narratives.includes(narrative)}
                  onClick={() => toggleSelection('narratives', narrative, 3)}
                >
                  {narrative}
                </SelectionButton>
              ))}
            </SelectionGrid>
            <div className="mt-8">
              <label className="block text-sm text-gray-400 mb-3">
                Describe en 2 líneas la historia que quieres contar (opcional)
              </label>
              <textarea
                value={selections.narrativeText}
                onChange={(e) => setSelections(prev => ({ ...prev, narrativeText: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                placeholder="Escribe aquí tu historia..."
              />
            </div>
          </StepContainer>
        );

      case 8:
        return (
          <StepContainer title="Referencias Visuales" subtitle="Comparte imágenes que inspiren tu estética">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  URLs de Pinterest, Instagram o imágenes
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReference('visualLinks')}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => addReference('visualLinks')}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                {/* Moodboard Grid */}
                {selections.visualLinks.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selections.visualLinks.map((url, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group aspect-square bg-white/5 rounded-lg overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Referencia ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeReference('visualLinks', idx)}
                            className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>


            </div>
          </StepContainer>
        );

      case 9:
        return null;

      case 10:
        return (
          <StepContainer title="Paleta de Color y Tipografía" subtitle="Define los colores y fuentes de tu identidad visual">
            <div className="space-y-6">
              {/* Moodboard Reference */}
              {selections.visualLinks.length > 0 && (
                <div>
                  <p className="text-sm text-emerald-400 mb-3">Tu Moodboard de Referencia</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
                    {selections.visualLinks.slice(0, 12).map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                        <img 
                          src={url} 
                          alt={`Ref ${idx}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=200&h=200&fit=crop';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selectors */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {selections.colors.map((color, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="block text-xs text-gray-500">Color {idx + 1}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(idx, e.target.value)}
                        className="w-16 h-16 rounded-lg cursor-pointer border-2 border-white/10"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(idx, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview Banner */}
              <div className="mt-8">
                <p className="text-sm text-gray-400 mb-3">Preview de tu paleta</p>
                <div className="relative rounded-2xl overflow-hidden h-48 flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${selections.colors[0]} 0%, ${selections.colors[1]} 35%, ${selections.colors[2]} 65%, ${selections.colors[3]} 100%)`
                }}>
                  <div className="relative z-10 text-center">
                    <h3 className="text-3xl font-bold text-white drop-shadow-lg">Tu Nombre Artístico</h3>
                    <p className="text-white/80 mt-2">Identidad Visual</p>
                  </div>
                </div>
              </div>

              {/* Preset Palettes */}
              <div>
                <p className="text-sm text-gray-400 mb-3">O elige una paleta predefinida</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {colorPalettes.slice(0, 8).map(palette => (
                    <motion.div
                      key={palette.name}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelections(prev => ({ ...prev, colors: palette.colors }))}
                      className="cursor-pointer rounded-lg overflow-hidden ring-1 ring-white/10 hover:ring-emerald-500/50 transition-all"
                    >
                      <div className="flex h-16">
                        {palette.colors.map((color, idx) => (
                          <div key={idx} style={{ backgroundColor: color }} className="flex-1" />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tipografía Section */}
              <div className="pt-8 border-t border-white/10">
                <label className="block text-sm text-gray-400 mb-3">Tipografía Principal</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Inter', category: 'Sans Minimal', style: 'font-sans' },
                    { name: 'Montserrat', category: 'Bold Urbana', style: 'font-sans font-bold' },
                    { name: 'Playfair', category: 'Serif Editorial', style: 'font-serif' },
                    { name: 'Caveat', category: 'Manuscrita', style: 'font-cursive' },
                    { name: 'Space Grotesk', category: 'Experimental', style: 'font-mono' },
                  ].map(font => (
                    <motion.button
                      key={font.name}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => selectTypography('primary', font.name)}
                      className={`p-4 rounded-lg border transition-all ${
                        selections.typography.primary === font.name
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <p className={`text-2xl ${font.style} text-white mb-1`}>Aa</p>
                      <p className="text-xs text-gray-400">{font.name}</p>
                      <p className="text-[10px] text-gray-600">{font.category}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Typography Preview */}
                {selections.typography.primary && (
                  <div className="mt-6 p-8 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm text-gray-400 mb-4">Preview</p>
                    <div className="space-y-4">
                      <h1 className="text-4xl font-bold text-white">{selections.artistName}</h1>
                      <h2 className="text-2xl text-gray-300">{selections.firstName} {selections.lastName}</h2>
                      <p className="text-gray-400">{selections.emotions.slice(0, 3).join(' · ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando ADN de Marca...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return <ResultView selections={selections} onReset={() => { setShowResult(false); setCurrentStep(1); }} saveDNA={saveDNA} artistId={artistId} hasExistingDNA={hasExistingDNA} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link 
              to={createPageUrl(artistId ? `ArtistDashboard?artistId=${artistId}` : "Landing")} 
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Link>
            <h1 className="text-xl font-light tracking-wide">
              ADN de Marca {artist && `- ${artist.stageName}`}
            </h1>
            <div className="w-20" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  idx < currentStep ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-right">
            Paso {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {renderStep()}

            {/* Payment Gate Overlay */}
            {showPaymentGate && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="max-w-lg w-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl"
                >
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    <Check className="w-12 h-12 text-white" strokeWidth={3} />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-3xl sm:text-4xl font-bold text-white">Desbloquea tu ADN de Marca Completo</h3>
                    <p className="text-gray-400 text-base leading-relaxed max-w-md mx-auto">
                      Accede a todas las preguntas avanzadas, paleta de colores personalizada, tipografías y genera tu moodboard profesional.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20">
                    <div className="text-6xl font-black text-white mb-3 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">27€</div>
                    <div className="text-gray-400 text-sm font-medium">Pago único • Acceso completo de por vida</div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handlePaymentSuccess}
                      className="w-full px-8 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-105 active:scale-100"
                    >
                      Proceder al Pago
                    </button>
                    <button
                      onClick={() => setShowPaymentGate(false)}
                      className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-all border border-white/10"
                    >
                      Ahora no
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Preview Overlay - Demo sombreado si no ha pagado */}
            {currentStep > 8 && !hasPaid && user?.role !== 'admin' && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl pointer-events-none z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="bg-black/80 backdrop-blur-xl px-8 py-6 rounded-xl border border-white/20">
                    <p className="text-white font-medium text-lg mb-2">Vista Previa</p>
                    <p className="text-gray-400 text-sm">Desbloquea el acceso completo</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

          {/* Warning Message */}
          <AnimatePresence>
            {limitWarning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 bg-orange-500/20 border border-orange-500/30 rounded-lg backdrop-blur-xl"
              >
                <p className="text-sm text-orange-300">{limitWarning}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 backdrop-blur-xl bg-black/80">
            <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              {currentStep === totalSteps ? (
                <button
                  onClick={generateResult}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                >
                  Guardar y Ver mi ADN de Marca
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleStepChange(Math.min(totalSteps, currentStep + 1))}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              {currentStep === 8 && !hasPaid && user?.role === 'admin' && (
                <button
                  onClick={() => setCurrentStep(9)}
                  className="fixed bottom-6 right-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition-all shadow-lg z-50"
                >
                  Avanzar (admin)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepContainer({ title, subtitle, children }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-light tracking-tight">{title}</h2>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SelectionGrid({ children }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {children}
    </div>
  );
}

function SelectionButton({ children, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`px-4 py-3 rounded-lg text-sm font-light transition-all ${
        selected
          ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/20'
          : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </motion.button>
  );
}

function ResultView({ selections, onReset, saveDNA, artistId, hasExistingDNA }) {
  const aura = selections.emotions[0] || "Intenso";
  const identidad = `Un artista que transmite ${selections.emotions.join(', ')}. Su música combina ${selections.genres.join(', ')} con una textura ${selections.textures[0]?.toLowerCase()}, creando una experiencia ${selections.vibe?.toLowerCase()}.`;

  const handleDownloadPDF = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    const element = document.getElementById('moodboard-content');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0B0B0D' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('ADN-de-Marca.pdf');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="relative z-10">
        <div className="border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link 
              to={createPageUrl(artistId ? `ArtistDashboard?artistId=${artistId}` : "Landing")} 
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Link>
            <h1 className="text-xl font-light tracking-wide">Tu ADN de Marca</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
          <motion.div
            id="moodboard-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Hero Banner */}
            <div 
              className="relative rounded-2xl overflow-hidden h-48 flex items-center justify-center p-6"
              style={{
                background: `linear-gradient(135deg, ${selections.colors[0]} 0%, ${selections.colors[1]} 35%, ${selections.colors[2]} 65%, ${selections.colors[3]} 100%)`
              }}
            >
              <div className="relative z-10 text-center">
                <h1 className="text-3xl font-bold text-white drop-shadow-2xl mb-2">{selections.artistName}</h1>
                <p className="text-white/90 text-base">{selections.firstName} {selections.lastName}</p>
              </div>
            </div>
            {/* Aura */}
            <div>
              <h3 className="text-xs text-emerald-400 mb-1 font-medium uppercase tracking-wide">Aura</h3>
              <p className="text-2xl font-light mb-1">{aura}</p>
              <p className="text-gray-400 text-sm">La esencia que transmites</p>
            </div>

            {/* Identidad */}
            <div>
              <h3 className="text-xs text-emerald-400 mb-2 font-medium uppercase tracking-wide">Identidad</h3>
              <p className="text-gray-300 leading-relaxed text-sm">{identidad}</p>
            </div>

            {/* Sonido */}
            <div>
              <h3 className="text-xs text-emerald-400 mb-2 font-medium uppercase tracking-wide">Sonido</h3>
              <div className="space-y-1.5">
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-medium">Géneros:</span> {selections.genres.join(', ')}
                </p>
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-medium">Textura:</span> {selections.textures.join(', ')}
                </p>
                <p className="text-gray-300 text-sm">
                  <span className="text-white font-medium">Energía:</span> {selections.vibe}
                </p>
              </div>
            </div>

            {/* Referencias Musicales */}
            {selections.musicReferences && selections.musicReferences.length > 0 && (
              <div>
                <h3 className="text-xs text-emerald-400 mb-3 font-medium uppercase tracking-wide">Referencias Musicales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selections.musicReferences.map((ref, idx) => {
                    const videoId = getYouTubeEmbedId(ref.url);
                    return (
                      <div key={idx} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        {videoId ? (
                          <div className="aspect-video w-full bg-black relative">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}`}
                              title={`YouTube video ${idx + 1}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video w-full bg-black flex items-center justify-center">
                            <a 
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                            >
                              Ver en YouTube →
                            </a>
                          </div>
                        )}
                        {ref.note && (
                          <div className="p-2">
                            <p className="text-xs text-gray-400 italic">"{ref.note}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visual */}
            <div>
              <h3 className="text-xs text-emerald-400 mb-2 font-medium uppercase tracking-wide">Paleta de Color</h3>
              <div className="flex gap-2">
                {selections.colors.map((color, idx) => (
                  <div key={idx} className="space-y-1">
                    <div
                      style={{ backgroundColor: color }}
                      className="w-12 h-12 rounded-lg ring-1 ring-white/20"
                    />
                    <p className="text-[10px] text-gray-500 text-center">{color}</p>
                  </div>
                ))}
              </div>
              {selections.palette && (
                <p className="text-xs text-gray-500 mt-2">Paleta: {selections.palette}</p>
              )}
            </div>

            {/* Narrativa */}
            <div>
              <h3 className="text-xs text-emerald-400 mb-2 font-medium uppercase tracking-wide">Narrativa</h3>
              <p className="text-gray-300 text-sm mb-2">{selections.narratives.join(', ')}</p>
              {selections.narrativeText && (
                <p className="text-gray-400 text-sm italic">"{selections.narrativeText}"</p>
              )}
            </div>

            {/* Moodboard Visual */}
            {selections.visualLinks.length > 0 && (
              <div>
                <h3 className="text-xs text-emerald-400 mb-3 font-medium uppercase tracking-wide">Moodboard Visual</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {selections.visualLinks.slice(0, 18).map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-square bg-white/5 rounded-md overflow-hidden"
                    >
                      <img 
                        src={url} 
                        alt={`Ref ${idx}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button 
              onClick={handleDownloadPDF}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-all border border-white/20 text-sm"
            >
              Descargar PDF
            </button>
            {hasExistingDNA && (
              <button 
                onClick={onReset}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all border border-white/10 text-sm"
              >
                Editar ADN
              </button>
            )}
            {!hasExistingDNA && (
              <button 
                onClick={saveDNA}
                className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-all shadow-xl shadow-emerald-500/20 text-sm"
              >
                Actualizar ADN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}