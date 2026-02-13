import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

export default function ADNdeMarca() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResult, setShowResult] = useState(false);
  
  const [selections, setSelections] = useState({
    emotions: [],
    vibe: "",
    genres: [],
    textures: [],
    colors: [],
    palette: null,
    aesthetics: [],
    narratives: [],
    narrativeText: "",
    artistReferences: [],
    visualLinks: [],
    cinematicRefs: []
  });

  const [tempInput, setTempInput] = useState("");
  const [limitWarning, setLimitWarning] = useState("");

  const totalSteps = 8;

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

  const canProceed = () => {
    switch(currentStep) {
      case 1: return selections.emotions.length > 0;
      case 2: return selections.vibe !== "";
      case 3: return selections.genres.length > 0;
      case 4: return selections.textures.length > 0;
      case 5: return selections.colors.length > 0;
      case 6: return selections.aesthetics.length > 0;
      case 7: return selections.narratives.length > 0;
      case 8: return true;
      default: return false;
    }
  };

  const generateResult = () => {
    setShowResult(true);
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
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

      case 2:
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

      case 3:
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

      case 4:
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

      case 5:
        return (
          <StepContainer title="Paleta de Color" subtitle="Elige colores individuales o una paleta completa">
            <div className="space-y-8">
              {Object.entries(
                colorPalettes.reduce((acc, palette) => {
                  if (!acc[palette.category]) acc[palette.category] = [];
                  acc[palette.category].push(palette);
                  return acc;
                }, {})
              ).map(([category, palettes]) => (
                <div key={category}>
                  <h3 className="text-sm text-gray-500 mb-3 font-medium">{category}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {palettes.map(palette => (
                      <motion.div
                        key={palette.name}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => selectPalette(palette)}
                        className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                          selections.palette === palette.name
                            ? 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'hover:ring-1 hover:ring-white/20'
                        }`}
                      >
                        <div className="flex h-24">
                          {palette.colors.map((color, idx) => (
                            <div
                              key={idx}
                              style={{ backgroundColor: color }}
                              className="flex-1 transition-transform hover:scale-105"
                              onClick={(e) => {
                                e.stopPropagation();
                                selectColor(color);
                              }}
                            />
                          ))}
                        </div>
                        <div className="bg-white/5 px-3 py-2">
                          <p className="text-xs text-white/70">{palette.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              
              {selections.colors.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-2">Colores seleccionados:</p>
                  <div className="flex gap-2">
                    {selections.colors.map((color, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: color }}
                        className="w-12 h-12 rounded-lg ring-1 ring-white/20"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </StepContainer>
        );

      case 6:
        return (
          <StepContainer title="Estética Visual" subtitle="¿Qué estilo visual te define?">
            <SelectionGrid>
              {aesthetics.map(aesthetic => (
                <SelectionButton
                  key={aesthetic}
                  selected={selections.aesthetics.includes(aesthetic)}
                  onClick={() => toggleSelection('aesthetics', aesthetic, 3)}
                >
                  {aesthetic}
                </SelectionButton>
              ))}
            </SelectionGrid>
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
          <StepContainer title="Referencias" subtitle="Inspírate en otros artistas y referencias visuales">
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Artistas de referencia (máx. 5)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReference('artistReferences')}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Nombre del artista"
                  />
                  <button
                    onClick={() => addReference('artistReferences')}
                    disabled={selections.artistReferences.length >= 5}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selections.artistReferences.map((ref, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">
                      {ref}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeReference('artistReferences', idx)} />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Links visuales
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReference('visualLinks')}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                    placeholder="URL de imagen o video"
                  />
                  <button
                    onClick={() => addReference('visualLinks')}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selections.visualLinks.map((ref, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2 truncate max-w-xs">
                      {ref}
                      <X className="w-3 h-3 cursor-pointer flex-shrink-0" onClick={() => removeReference('visualLinks', idx)} />
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-3">
                  Referencias cinematográficas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReference('cinematicRefs')}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                    placeholder="Película, serie o director"
                  />
                  <button
                    onClick={() => addReference('cinematicRefs')}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    Añadir
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selections.cinematicRefs.map((ref, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white flex items-center gap-2">
                      {ref}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeReference('cinematicRefs', idx)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  if (showResult) {
    return <ResultView selections={selections} onReset={() => { setShowResult(false); setCurrentStep(1); }} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link to={createPageUrl("Landing")} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </Link>
            <h1 className="text-xl font-light tracking-wide">ADN de Marca</h1>
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
            >
              {renderStep()}
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
                  Ver mi ADN de Marca
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                  disabled={!canProceed()}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
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

function ResultView({ selections, onReset }) {
  const aura = selections.emotions[0] || "Intenso";
  const identidad = `Un artista que transmite ${selections.emotions.join(', ')} a través de una estética ${selections.aesthetics.join(' y ')}. Su música combina ${selections.genres.join(', ')} con una textura ${selections.textures[0]?.toLowerCase()}, creando una experiencia ${selections.vibe?.toLowerCase()}.`;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      
      <div className="relative z-10">
        <div className="border-b border-white/5 backdrop-blur-xl bg-black/20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
            <button onClick={onReset} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <h1 className="text-xl font-light tracking-wide">Tu ADN de Marca</h1>
            <div className="w-20" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Aura */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-2 font-medium">Aura</h3>
              <p className="text-4xl font-light mb-2">{aura}</p>
              <p className="text-gray-400">La esencia que transmites</p>
            </div>

            {/* Identidad */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-3 font-medium">Identidad</h3>
              <p className="text-gray-300 leading-relaxed">{identidad}</p>
            </div>

            {/* Sonido */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-3 font-medium">Sonido</h3>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="text-white font-medium">Géneros:</span> {selections.genres.join(', ')}
                </p>
                <p className="text-gray-300">
                  <span className="text-white font-medium">Textura:</span> {selections.textures.join(', ')}
                </p>
                <p className="text-gray-300">
                  <span className="text-white font-medium">Energía:</span> {selections.vibe}
                </p>
              </div>
            </div>

            {/* Visual */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-3 font-medium">Visual</h3>
              <p className="text-gray-300 mb-4">
                <span className="text-white font-medium">Estética:</span> {selections.aesthetics.join(', ')}
              </p>
              <div className="flex gap-3">
                {selections.colors.map((color, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: color }}
                    className="w-16 h-16 rounded-lg ring-1 ring-white/20"
                  />
                ))}
              </div>
              {selections.palette && (
                <p className="text-sm text-gray-500 mt-3">Paleta: {selections.palette}</p>
              )}
            </div>

            {/* Narrativa */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-3 font-medium">Narrativa</h3>
              <p className="text-gray-300 mb-3">{selections.narratives.join(', ')}</p>
              {selections.narrativeText && (
                <p className="text-gray-400 italic">"{selections.narrativeText}"</p>
              )}
            </div>

            {/* Moodboard Placeholder */}
            <div>
              <h3 className="text-sm text-emerald-400 mb-4 font-medium">Moodboard Visual</h3>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-white/5 rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-8 space-y-4">
              <button className="w-full px-8 py-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-all shadow-xl shadow-emerald-500/20 text-lg">
                Guardar ADN de Marca (27€)
              </button>
              <button className="w-full px-8 py-4 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-all border border-white/10 text-lg">
                Branding Personalizado con Dirección Creativa (750€)
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}