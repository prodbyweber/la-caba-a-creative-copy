import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, CheckCircle, ArrowRight } from "lucide-react";

export default function OfferDetailPanel({ offer, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
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

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 sm:py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                      offer.featured
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
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
        </>
      )}
    </AnimatePresence>
  );
}