import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ExploracionForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    nombre_artistico: "",
    email: "",
    telefono: "",
    pais_nacimiento: "",
    pais_residencia: "",
    direccion: "",
    instagram: "",
    tiktok: "",
    spotify: "",
    youtube: "",
    nivel_actual: "",
    que_frena_crecimiento: "",
    que_espera_resolver: "",
    enlaces_musica: [""],
    compromiso_inversion: ""
  });

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: (data) => base44.entities.ExploracionLead.create(data),
    onSuccess: () => {
      handleRedirect();
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMusicLinkChange = (index, value) => {
    const newLinks = [...formData.enlaces_musica];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, enlaces_musica: newLinks }));
  };

  const addMusicLink = () => {
    if (formData.enlaces_musica.length < 3) {
      setFormData(prev => ({ ...prev, enlaces_musica: [...prev.enlaces_musica, ""] }));
    }
  };

  const removeMusicLink = (index) => {
    const newLinks = formData.enlaces_musica.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, enlaces_musica: newLinks.length ? newLinks : [""] }));
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.nombre && formData.apellido && formData.nombre_artistico && 
             formData.email && formData.telefono && formData.pais_nacimiento && 
             formData.pais_residencia && formData.direccion;
    }
    if (step === 2) {
      const urlRegex = /^https?:\/\/.+/i;
      return formData.instagram && urlRegex.test(formData.instagram) &&
             formData.tiktok && urlRegex.test(formData.tiktok) &&
             formData.spotify && urlRegex.test(formData.spotify) &&
             formData.youtube && urlRegex.test(formData.youtube);
    }
    if (step === 3) {
      return formData.nivel_actual;
    }
    if (step === 4) {
      return formData.que_frena_crecimiento && formData.que_espera_resolver;
    }
    if (step === 5) {
      return formData.enlaces_musica.some(link => link.trim() !== "");
    }
    if (step === 6) {
      return formData.compromiso_inversion;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleRedirect = () => {
    const commitment = formData.compromiso_inversion;
    
    if (commitment === "Sí, estoy listo/a para avanzar") {
      const paymentLink = config?.exploracion_payment_link || "https://buy.stripe.com/test_payment";
      window.location.href = paymentLink;
    } else if (commitment === "Me interesa, pero quiero más información antes de confirmar") {
      const calendlyLink = config?.exploracion_calendly_link || "https://calendly.com/lacabanacreative";
      window.location.href = calendlyLink;
    } else {
      navigate(createPageUrl("Landing"));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    
    // Clasificar lead automáticamente
    let status = "Interesado";
    if (formData.compromiso_inversion === "Sí, estoy listo/a para avanzar") {
      status = "Alta intención";
    } else if (formData.compromiso_inversion === "Ahora mismo no estoy en ese punto") {
      status = "No listo";
    }

    const cleanedLinks = formData.enlaces_musica.filter(link => link.trim() !== "");

    try {
      await createLeadMutation.mutateAsync({
        ...formData,
        enlaces_musica: cleanedLinks,
        status
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-light tracking-wider mb-2">
            EXPLORACIÓN
          </h1>
          <p className="text-sm text-gray-400">con Prod. by Weber</p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div
                key={s}
                className={`h-1 rounded-full transition-all ${
                  s <= step ? 'bg-emerald-500 w-12' : 'bg-white/10 w-8'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Paso {step} de 6</p>
        </motion.div>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8"
        >
          {/* Step 1: Datos Personales */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">Datos Personales</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Apellido *</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleChange('apellido', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Nombre artístico *</label>
                <input
                  type="text"
                  value={formData.nombre_artistico}
                  onChange={(e) => handleChange('nombre_artistico', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Número de teléfono (WhatsApp) *</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="+34 600 000 000"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">País de nacimiento *</label>
                  <input
                    type="text"
                    value={formData.pais_nacimiento}
                    onChange={(e) => handleChange('pais_nacimiento', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">País donde resides *</label>
                  <input
                    type="text"
                    value={formData.pais_residencia}
                    onChange={(e) => handleChange('pais_residencia', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Dirección de domicilio *</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Presencia Digital */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">Presencia Digital</h2>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Instagram *</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://instagram.com/tu_usuario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">TikTok *</label>
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => handleChange('tiktok', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://tiktok.com/@tu_usuario"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Spotify *</label>
                <input
                  type="url"
                  value={formData.spotify}
                  onChange={(e) => handleChange('spotify', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://open.spotify.com/artist/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">YouTube *</label>
                <input
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => handleChange('youtube', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="https://youtube.com/@tu_canal"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Nivel Actual */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">Nivel Actual</h2>
              <p className="text-sm text-gray-400 mb-4">¿En qué punto estás actualmente? *</p>
              
              <div className="space-y-3">
                {[
                  "Estoy empezando",
                  "Tengo música publicada",
                  "Soy constante pero no crezco",
                  "Estoy creciendo y quiero escalar",
                  "Vivo parcialmente de la música"
                ].map((option) => (
                  <label
                    key={option}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.nivel_actual === option
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nivel_actual"
                      value={option}
                      checked={formData.nivel_actual === option}
                      onChange={(e) => handleChange('nivel_actual', e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Diagnóstico */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">Diagnóstico</h2>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ¿Qué sientes que está frenando tu crecimiento actualmente? *
                </label>
                <textarea
                  value={formData.que_frena_crecimiento}
                  onChange={(e) => handleChange('que_frena_crecimiento', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 min-h-[120px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  ¿Qué esperas resolver con esta Exploración? *
                </label>
                <textarea
                  value={formData.que_espera_resolver}
                  onChange={(e) => handleChange('que_espera_resolver', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 min-h-[120px]"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 5: Música */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6">Música (Análisis)</h2>
              <p className="text-sm text-gray-400 mb-4">
                Añade hasta 3 enlaces (Google Drive, Spotify, YouTube, YouTube Music). Mínimo 1 obligatorio.
              </p>
              <p className="text-xs text-gray-500 mb-6 italic">
                "Pueden ser temas inéditos. Todo el material se mantiene privado."
              </p>

              {formData.enlaces_musica.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleMusicLinkChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    placeholder="https://drive.google.com/... o https://open.spotify.com/..."
                  />
                  {formData.enlaces_musica.length > 1 && (
                    <button
                      onClick={() => removeMusicLink(index)}
                      className="px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}

              {formData.enlaces_musica.length < 3 && (
                <button
                  onClick={addMusicLink}
                  className="w-full px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  + Añadir enlace
                </button>
              )}
            </div>
          )}

          {/* Step 6: Compromiso e Inversión */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Inversión y Compromiso</h2>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 space-y-4">
                <p className="text-white font-semibold text-lg">
                  La Exploración con Prod. by Weber tiene una inversión de 650€.
                </p>
                
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="font-medium text-white">Incluye:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>Sesión estratégica privada de 1 hora (análisis completo)</li>
                    <li>Plan de ejecución y norte creativo</li>
                    <li>2 horas en estudio junto a Prod. by Weber</li>
                    <li>Producción de un tema desde cero para tu catálogo</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-400 italic pt-2">
                  Queremos asegurarnos de trabajar con artistas listos para avanzar con intención.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-4">
                  ¿Estás dispuesto/a a realizar esta inversión si tu perfil encaja con el programa? *
                </p>
                
                <div className="space-y-3">
                  {[
                    { value: "Sí, estoy listo/a para avanzar", message: "Perfecto. Estás a un paso de confirmar tu Exploración." },
                    { value: "Me interesa, pero quiero más información antes de confirmar", message: "Agenda una llamada breve con nuestro equipo para resolver tus dudas." },
                    { value: "Ahora mismo no estoy en ese punto", message: "Cuando estés listo/a para avanzar con intención, aquí estaremos." }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.compromiso_inversion === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="compromiso_inversion"
                        value={option.value}
                        checked={formData.compromiso_inversion === option.value}
                        onChange={(e) => handleChange('compromiso_inversion', e.target.value)}
                        className="sr-only"
                      />
                      <div>
                        <p className="text-white font-medium mb-1">{option.value}</p>
                        {formData.compromiso_inversion === option.value && (
                          <p className="text-xs text-emerald-400 mt-2">{option.message}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            )}

            {step < 6 ? (
              <button
                onClick={handleNext}
                disabled={!validateStep()}
                className={`ml-auto flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                  validateStep()
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep() || loading}
                className={`ml-auto flex items-center gap-2 px-8 py-3 rounded-lg transition-colors ${
                  validateStep() && !loading
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}