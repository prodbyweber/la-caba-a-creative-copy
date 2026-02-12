import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, Check, Music, Target, Sparkles, Globe, DollarSign, Lightbulb, Upload } from "lucide-react";

const formSteps = [
  {
    id: 1,
    icon: Music,
    title: "Información Básica",
    subtitle: "Cuéntanos quién eres",
    fields: [
      { name: "nombre", label: "Nombre artístico", type: "text", placeholder: "Tu nombre de artista", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "tu@email.com", required: true },
      { name: "telefono", label: "Teléfono", type: "tel", placeholder: "+34 600 000 000", required: true },
    ]
  },
  {
    id: 2,
    icon: Sparkles,
    title: "Identidad Artística",
    subtitle: "Define tu esencia musical",
    fields: [
      { 
        name: "genero", 
        label: "¿Qué género defines tu sonido?", 
        type: "cards",
        options: [
          { value: "urbano", label: "Urbano", emoji: "🎤" },
          { value: "pop", label: "Pop", emoji: "✨" },
          { value: "rnb", label: "R&B", emoji: "🎵" },
          { value: "trap", label: "Trap", emoji: "🔥" },
          { value: "reggaeton", label: "Reggaeton", emoji: "🌴" },
          { value: "otro", label: "Otro", emoji: "🎹" }
        ],
        required: true 
      },
      { 
        name: "emocion", 
        label: "¿Qué emoción transmite tu música?", 
        type: "cards",
        options: [
          { value: "energia", label: "Energía", emoji: "⚡" },
          { value: "melancolia", label: "Melancolía", emoji: "🌙" },
          { value: "felicidad", label: "Felicidad", emoji: "☀️" },
          { value: "intensidad", label: "Intensidad", emoji: "🔥" },
          { value: "romance", label: "Romance", emoji: "💫" },
          { value: "rebeldia", label: "Rebeldía", emoji: "🚀" }
        ],
        required: true 
      },
    ]
  },
  {
    id: 3,
    icon: Globe,
    title: "Referencias y Música",
    subtitle: "Muéstranos tu trabajo",
    fields: [
      { name: "musica_publicada", label: "Enlace a tu música", type: "text", placeholder: "Spotify, YouTube, SoundCloud...", required: false },
      { name: "instagram", label: "Instagram", type: "text", placeholder: "@tuusuario", required: false },
      { name: "referencia_sonido", label: "Artista de referencia", type: "text", placeholder: "¿Quién inspira tu sonido?", required: false },
    ]
  },
  {
    id: 4,
    icon: Target,
    title: "Presencia Digital",
    subtitle: "Tu alcance actual",
    fields: [
      { 
        name: "experiencia", 
        label: "¿Cuánto tiempo llevas creando música?", 
        type: "timeline",
        options: [
          { value: "nuevo", label: "Menos de 1 año" },
          { value: "intermedio", label: "1-2 años" },
          { value: "avanzado", label: "3-5 años" },
          { value: "profesional", label: "Más de 5 años" }
        ],
        required: true 
      },
      { name: "seguidores", label: "Total de seguidores (aprox.)", type: "text", placeholder: "Ej: 5,000", required: false },
    ]
  },
  {
    id: 5,
    icon: DollarSign,
    title: "Inversión",
    subtitle: "Compromiso con tu carrera",
    fields: [
      { 
        name: "presupuesto", 
        label: "¿Cuánto estás dispuesto a invertir mensualmente?", 
        type: "pricing",
        options: [
          { value: "300-500", label: "300-500€", subtitle: "Inicio" },
          { value: "500-1000", label: "500-1.000€", subtitle: "Crecimiento", featured: true },
          { value: "1000-2000", label: "1.000-2.000€", subtitle: "Profesional" },
          { value: "2000+", label: "+2.000€", subtitle: "Elite" }
        ],
        required: true 
      },
    ]
  },
  {
    id: 6,
    icon: Lightbulb,
    title: "Visión",
    subtitle: "Tu objetivo final",
    fields: [
      { 
        name: "objetivo_principal", 
        label: "¿Qué buscas lograr?", 
        type: "objectives",
        options: [
          { value: "marca", label: "Definir mi sonido y marca", icon: "🎯" },
          { value: "primer_proyecto", label: "Producir mi primer proyecto profesional", icon: "🎤" },
          { value: "escalar", label: "Escalar mi proyecto actual", icon: "📈" },
          { value: "calidad", label: "Mejorar la calidad de mi música", icon: "✨" }
        ],
        required: true 
      },
      { name: "vision", label: "¿Dónde te ves en 1 año?", type: "textarea", placeholder: "Cuéntanos tu visión...", required: false },
    ]
  }
];

const SelectableCard = ({ option, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={() => onClick(option.value)}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
      selected
        ? 'border-emerald-400 bg-emerald-400/5 shadow-lg shadow-emerald-500/20'
        : 'border-white/10 bg-white/5 hover:border-white/20'
    }`}
  >
    {selected && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center"
      >
        <Check className="w-4 h-4 text-black" />
      </motion.div>
    )}
    <div className="text-3xl mb-3">{option.emoji || option.icon}</div>
    <div className="text-white font-semibold text-lg mb-1">{option.label}</div>
    {option.subtitle && <div className="text-white/50 text-sm">{option.subtitle}</div>}
  </motion.button>
);

export default function ArtistApplicationForm({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onSuccess();
  };

  const currentStepData = formSteps[currentStep];
  const progress = ((currentStep + 1) / formSteps.length) * 100;
  const StepIcon = currentStepData.icon;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.03), #0B0B0D 50%)' }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#0B0B0D]" />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto bg-transparent"
        >
          {/* Progress Bar */}
          <div className="sticky top-0 z-10 backdrop-blur-2xl bg-black/40 border-b border-white/5">
            <div className="h-0.5 bg-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="px-6 sm:px-12 py-4 flex items-center justify-between">
              <span className="text-xs font-medium text-white/40 tracking-wider uppercase">
                Paso {currentStep + 1} de {formSteps.length}
              </span>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 transition-colors text-sm"
                disabled={isSubmitting}
              >
                Cerrar
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-12 py-8 sm:py-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Step Icon & Title */}
                <div className="mb-10 sm:mb-16">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6"
                  >
                    <div className="inline-flex p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                      <StepIcon className="w-8 h-8 text-emerald-400" strokeWidth={1.5} />
                    </div>
                  </motion.div>
                  
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-5xl font-bold text-white mb-3 tracking-tight"
                  >
                    {currentStepData.title}
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg text-white/40"
                  >
                    {currentStepData.subtitle}
                  </motion.p>
                </div>

                {/* Form Fields */}
                <div className="space-y-8 mb-12">
                  {currentStepData.fields.map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className="space-y-3"
                    >
                      <label className="block text-sm font-medium text-white/60 tracking-wide">
                        {field.label}
                        {field.required && <span className="text-emerald-400 ml-1">*</span>}
                      </label>

                      {field.type === "cards" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {field.options.map(option => (
                            <SelectableCard
                              key={option.value}
                              option={option}
                              selected={formData[field.name] === option.value}
                              onClick={(value) => handleFieldChange(field.name, value)}
                            />
                          ))}
                        </div>
                      )}

                      {field.type === "pricing" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {field.options.map(option => (
                            <SelectableCard
                              key={option.value}
                              option={option}
                              selected={formData[field.name] === option.value}
                              onClick={(value) => handleFieldChange(field.name, value)}
                            />
                          ))}
                        </div>
                      )}

                      {field.type === "objectives" && (
                        <div className="grid grid-cols-1 gap-3">
                          {field.options.map(option => (
                            <SelectableCard
                              key={option.value}
                              option={option}
                              selected={formData[field.name] === option.value}
                              onClick={(value) => handleFieldChange(field.name, value)}
                            />
                          ))}
                        </div>
                      )}

                      {field.type === "timeline" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {field.options.map(option => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleFieldChange(field.name, option.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-5 rounded-xl border transition-all text-center ${
                                formData[field.name] === option.value
                                  ? 'border-emerald-400 bg-emerald-400/5'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="text-white font-medium">{option.label}</div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          rows={4}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:bg-white/10 transition-all resize-none"
                        />
                      )}

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:bg-white/10 transition-all"
                        />
                      )}

                      {field.type === "email" && (
                        <input
                          type="email"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:bg-white/10 transition-all"
                        />
                      )}

                      {field.type === "tel" && (
                        <input
                          type="tel"
                          value={formData[field.name] || ""}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 focus:bg-white/10 transition-all"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {currentStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="px-8 py-4 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Volver
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className={`flex-1 px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isSubmitting
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-400 to-emerald-300 text-black hover:shadow-lg hover:shadow-emerald-500/20'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : currentStep === formSteps.length - 1 ? (
                      <>
                        Confirmar y Agendar
                        <Check className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        Continuar
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}