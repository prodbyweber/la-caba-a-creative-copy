import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Check, FolderOpen } from "lucide-react";
import { LICENSE_TYPES } from "@/lib/musicConstants";

export default function BeatLicensesModal({ beat, onClose, user }) {
  if (!beat) return null;
  const licenses = beat.licenses || [];

  const handleDownloadLicense = (license) => {
    if (license.download_url) {
      window.open(license.download_url, "_blank");
    } else if (license.drive_folder_url) {
      window.open(license.drive_folder_url, "_blank");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[160] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ background: "#141416", border: "1px solid rgba(255,255,255,0.08)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              {beat.cover_url && (
                <img src={beat.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">{beat.title}</h3>
                <p className="text-xs text-white/40">{beat.producer}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Licenses */}
          <div className="p-5 space-y-3">
            {licenses.length === 0 ? (
              // Default: show all 4 types as placeholders
              LICENSE_TYPES.map(lt => (
                <div key={lt.id} className="p-4 rounded-xl border border-white/8 bg-white/[0.03]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{lt.label}</h4>
                    <span className="text-xs text-white/30">No disponible</span>
                  </div>
                </div>
              ))
            ) : (
              licenses.map((license, i) => {
                const typeInfo = LICENSE_TYPES.find(t => t.id === license.type) || { label: license.type };
                return (
                  <div key={i} className="p-4 rounded-xl border transition-all"
                    style={{ background: "rgba(255,88,51,0.06)", borderColor: "rgba(255,88,51,0.25)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-1">{typeInfo.label}</h4>
                        {license.description && (
                          <p className="text-xs text-white/50 leading-relaxed">{license.description}</p>
                        )}
                      </div>
                      {license.price != null && (
                        <span className="text-lg font-black text-white flex-shrink-0">
                          {license.price === 0 ? "Gratis" : `${license.price}€`}
                        </span>
                      )}
                    </div>

                    {/* Files included */}
                    {license.files_included && (
                      <div className="flex items-center gap-1.5 mb-3 text-xs text-white/40">
                        <Check className="w-3 h-3 text-emerald-400" />
                        {license.files_included}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadLicense(license)}
                        disabled={!license.download_url && !license.drive_folder_url}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-30"
                        style={{ background: "linear-gradient(135deg, #ff5833, #e0451f)" }}
                      >
                        <Download className="w-3 h-3" />
                        Descargar
                      </button>
                      {license.drive_folder_url && (
                        <a
                          href={license.drive_folder_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/60 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <FolderOpen className="w-3 h-3" />
                          Drive
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}