import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CheckCircle, ArrowRight, Clock, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ArtistApplicationForm from "./ArtistApplicationForm";

export default function OfferDetailPanel({ offer, isOpen, onClose }) {
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const VIDEO_DURATION = 240; // 4 minutes in seconds

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user?.role === 'admin');
      } catch (error) {
        setIsAdmin(false);
      }
    };
    if (isOpen) {
      checkAdmin();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setVideoWatchTime(0);
      setIsVideoCompleted(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isVideoCompleted) return;

    const interval = setInterval(() => {
      setVideoWatchTime(prev => {
        const newTime = prev + 1;
        if (newTime >= VIDEO_DURATION) {
          setIsVideoCompleted(true);
          clearInterval(interval);
          return VIDEO_DURATION;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isVideoCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (videoWatchTime / VIDEO_DURATION) * 100;

  if (!offer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
              <div className="max-w-5xl mx-auto">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Trailer Section */}
                {offer.trailer_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-zinc-900 to-black shadow-2xl"
                  >
                    <iframe
                      src={offer.trailer_url}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      title={`${offer.title} Trailer`}
                    />
                  </motion.div>
                )}

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 md:p-10"
                >
                  {/* Header */}
                  <div className="mb-8">
                    {offer.tag && (
                      <span className={`inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-semibold ${
                        offer.tag === "Gratis" 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-gray-400'
                      }`}>
                        {offer.tag}
                      </span>
                    )}
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                      {offer.title}
                    </h2>
                    
                    {offer.price && (
                      <div className="text-4xl sm:text-5xl font-bold text-white mb-4">
                        {offer.price}
                      </div>
                    )}
                    
                    <p className="text-lg sm:text-xl text-gray-400 leading-relaxed">
                      {offer.full_description || offer.description}
                    </p>
                  </div>

                  {/* For Who Section */}
                  {offer.for_who && (
                    <div className="mb-8 pb-8 border-b border-white/10">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                        ¿Para quién es?
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {offer.for_who}
                      </p>
                    </div>
                  )}

                  {/* What You Gain Section */}
                  {offer.what_you_gain && offer.what_you_gain.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-white/10">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        ¿Qué ganarás?
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {offer.what_you_gain.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Content Section */}
                  {offer.key_content && offer.key_content.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
                        Contenido clave
                      </h3>
                      <div className="space-y-3">
                        {offer.key_content.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-gray-300">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                              {i + 1}
                            </div>
                            <span className="leading-relaxed pt-1">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {offer.highlights && offer.highlights.length > 0 && (
                    <div className="mb-8 pb-8 border-b border-white/10">
                      <h3 className="text-xl font-bold text-white mb-4">Incluye:</h3>
                      <div className="space-y-3">
                        {offer.highlights.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-gray-300">
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Progress Indicator */}
                  {!isVideoCompleted && !isAdmin && (
                    <div className="mb-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Tiempo de visualización</span>
                        </div>
                        <span className="text-sm font-mono text-emerald-400">
                          {formatTime(videoWatchTime)} / {formatTime(VIDEO_DURATION)}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Al finalizar el video se habilitará el botón para agendar tu meeting
                      </p>
                    </div>
                  )}

                  {/* Admin Badge */}
                  {isAdmin && !isVideoCompleted && (
                    <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      <p className="text-xs text-emerald-400 font-medium">
                        ✓ Modo Admin: Acceso completo sin restricciones
                      </p>
                    </div>
                  )}

                  {/* Booking Button - Always visible if link exists */}
                  {offer.booking_link && (
                    (isVideoCompleted || isAdmin) ? (
                      <motion.a
                        href={offer.booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 sm:py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 mb-4"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Agendar Videollamada
                        <ArrowRight className="w-5 h-5" />
                      </motion.a>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full py-4 sm:py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 bg-zinc-800/50 text-gray-600 cursor-not-allowed mb-4 border border-zinc-700/50"
                      >
                        <Lock className="w-5 h-5" />
                        Agendar Videollamada
                        <Clock className="w-5 h-5" />
                      </motion.div>
                    )
                  )}

                  {/* Payment Section - Premium Style */}
                  {offer.payment_link && (
                    <div className="mb-4 p-6 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-700/50 shadow-2xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                          Pago único
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        Al proceder al pago, se redactará automáticamente tu contrato personalizado con los datos proporcionados. Podrás revisarlo y firmarlo digitalmente de forma segura.
                      </p>

                      {/* Pre-purchase consultation button */}
                      {offer.pre_purchase_calendly_link && (
                        <a
                          href={offer.pre_purchase_calendly_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mb-3 py-3 px-4 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all border border-zinc-600/50"
                        >
                          💬 Agendar videollamada antes de comprar
                        </a>
                      )}

                      {/* Payment button */}
                      <motion.a
                        href={offer.payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/30"
                      >
                        🔒 Proceder al pago
                        <ArrowRight className="w-5 h-5" />
                      </motion.a>

                      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                        <CheckCircle className="w-3 h-3" />
                        <span>Pago seguro mediante Stripe</span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      offer.featured
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {offer.cta}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Application Form Modal */}
          <ArtistApplicationForm
            isOpen={showApplicationForm}
            onClose={() => setShowApplicationForm(false)}
            onSuccess={() => {
              setShowApplicationForm(false);
              alert('¡Formulario enviado! Recibirás un email con el enlace de Calendly para agendar tu meeting.');
            }}
            formId={offer?.form_id}
          />
        </>
      )}
    </AnimatePresence>
  );
}