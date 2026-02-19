import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CheckCircle, ArrowRight, Clock, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ArtistApplicationForm from "./ArtistApplicationForm";
import BasicDataForm from "./BasicDataForm";

const HIGH_TICKET_SERVICES = ["Plan de Acción Artístico", "Creación + Dirección", "Artista Pro – Madrid"];

export default function OfferDetailPanel({ offer, isOpen, onClose }) {
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showBasicForm, setShowBasicForm] = useState(false);
  const [userDataSubmitted, setUserDataSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminViewMode, setAdminViewMode] = useState(false);
  const VIDEO_DURATION = 240; // 4 minutes in seconds
  const isHighTicket = HIGH_TICKET_SERVICES.includes(offer?.title);
  const showRestrictions = !adminViewMode;

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
      setUserDataSubmitted(false);
      setAdminViewMode(false);
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
            <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
              <div className="max-w-3xl mx-auto">
                {/* Admin View Toggle */}
                {isAdmin && (
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10">
                    <button
                      onClick={() => setAdminViewMode(!adminViewMode)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all"
                    >
                      <span className="text-[10px] font-semibold text-white uppercase">
                        {adminViewMode ? "Admin" : "Usuario"}
                      </span>
                      <div className={`w-6 h-3.5 rounded-full transition-all ${adminViewMode ? 'bg-blue-500' : 'bg-gray-500'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${adminViewMode ? 'translate-x-3' : 'translate-x-0'} mt-0.25`} />
                      </div>
                    </button>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Trailer Section */}
                {offer.trailer_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-zinc-900 to-black shadow-lg"
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
                  className="bg-zinc-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 sm:p-5"
                >
                  {/* Header */}
                  <div className="mb-5">
                    {offer.tag && (
                      <span className={`inline-block mb-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        offer.tag === "Gratis" 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-gray-400'
                      }`}>
                        {offer.tag}
                      </span>
                    )}
                    
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {offer.title}
                    </h2>
                    
                    {offer.price && (
                      <div className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        {offer.price}
                      </div>
                    )}
                    
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                      {offer.full_description || offer.description}
                    </p>
                  </div>

                  {/* For Who Section */}
                  {offer.for_who && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <h3 className="text-sm font-bold text-white mb-2">
                        ¿Para quién es?
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        {offer.for_who}
                      </p>
                    </div>
                  )}

                  {/* What You Gain Section */}
                  {offer.what_you_gain && offer.what_you_gain.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <h3 className="text-sm font-bold text-white mb-3">
                        ¿Qué ganarás?
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {offer.what_you_gain.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 text-xs leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Content Section */}
                  {offer.key_content && offer.key_content.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-white mb-3">
                        Contenido clave
                      </h3>
                      <div className="space-y-2">
                        {offer.key_content.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-gray-300">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                              {i + 1}
                            </div>
                            <span className="text-xs leading-relaxed pt-0.5">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {offer.highlights && offer.highlights.length > 0 && (
                    <div className="mb-4 pb-4 border-b border-white/10">
                      <h3 className="text-sm font-bold text-white mb-2">Incluye:</h3>
                      <div className="space-y-2">
                        {offer.highlights.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Progress Indicator */}
                  {!isVideoCompleted && showRestrictions && (
                    <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Visualización</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">
                          {formatTime(videoWatchTime)} / {formatTime(VIDEO_DURATION)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1.5">
                        Al finalizar se habilitará el botón para agendar
                      </p>
                    </div>
                  )}

                  {/* Admin Badge - Only show in admin view */}
                  {adminViewMode && !isVideoCompleted && (
                    <div className="mb-3 p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <p className="text-[10px] text-blue-400 font-medium">
                        ✓ Vista Admin: Restricciones deshabilitadas
                      </p>
                    </div>
                  )}

                  {/* Booking Button - Always visible if link exists */}
                  {offer.booking_link && (
                    (isVideoCompleted || !showRestrictions) ? (
                      <motion.a
                        href={offer.booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 mb-3"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Agendar Videollamada
                        <ArrowRight className="w-4 h-4" />
                      </motion.a>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-zinc-800/50 text-gray-600 cursor-not-allowed mb-3 border border-zinc-700/50"
                      >
                        <Lock className="w-4 h-4" />
                        Agendar Videollamada
                        <Clock className="w-4 h-4" />
                      </motion.div>
                    )
                  )}

                  {/* Payment Section - Only show when video is completed or admin view */}
                  {offer.payment_link && (isVideoCompleted || !showRestrictions) && (
                    <div className="mb-3 p-3 bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                          Pago único
                        </span>
                      </div>
                      
                      <p className="text-[10px] sm:text-xs text-gray-400 mb-3 leading-relaxed">
                        Se redactará automáticamente tu contrato personalizado. Podrás revisarlo y firmarlo digitalmente.
                      </p>

                      {/* Form for high ticket services */}
                      {isHighTicket && !userDataSubmitted && (
                        <button
                          onClick={() => setShowBasicForm(true)}
                          className="w-full py-2 mb-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold text-xs rounded-lg transition-all border border-blue-500/30"
                        >
                          Completar datos
                        </button>
                      )}

                      {/* Payment button - Show conditions based on service type */}
                      {(!isHighTicket || userDataSubmitted) && (
                        <motion.a
                          href={offer.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30"
                        >
                          🔒 Proceder al pago
                          <ArrowRight className="w-3.5 h-3.5" />
                        </motion.a>
                      )}

                      {isHighTicket && !userDataSubmitted && (
                        <p className="text-[10px] text-gray-500 text-center mt-2">
                          Completa tus datos para proceder al pago
                        </p>
                      )}

                      <div className="flex flex-col items-center gap-1 mt-2">
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Pago seguro mediante Stripe</span>
                        </div>
                        
                        {/* Pre-purchase consultation link */}
                        {offer.pre_purchase_calendly_link && (
                          <a
                            href={offer.pre_purchase_calendly_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] text-gray-500 hover:text-gray-300 underline transition-colors"
                          >
                            Videollamada antes de comprar
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  {!offer.payment_link && !offer.booking_link && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 sm:py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white text-black hover:bg-gray-100"
                    >
                      {offer.cta}
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}
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

          {/* Basic Data Form Modal */}
          <BasicDataForm
            isOpen={showBasicForm}
            onClose={() => setShowBasicForm(false)}
            onSubmit={(data) => {
              setUserDataSubmitted(true);
              setShowBasicForm(false);
            }}
          />
          </>
          )}
          </AnimatePresence>
          );
          }