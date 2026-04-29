import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, X, Camera, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Button that lets authorized users (admin OR credited artist) upload
 * images/short-videos directly to a project's gallery in ExplorarItem.
 *
 * Props:
 *  - projectRaw: the raw ExplorarItem record
 *  - currentUser: authenticated user object
 *  - onUploaded: called after successful save (no args needed — parent re-fetches)
 */
export default function GalleryUploadButton({ projectRaw, currentUser, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [restricted, setRestricted] = useState(false);
  const [preview, setPreview] = useState(null); // { url, file }
  const fileRef = useRef();

  if (!projectRaw || !currentUser) return null;

  const handleFile = (file) => {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview({ url: localUrl, file, isVideo: file.type.startsWith("video/") });
    setOpen(true);
  };

  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: preview.file });
      const newItem = {
        id: `g_${Date.now()}`,
        type: "image",
        url: file_url,
        caption: caption.trim(),
        restricted,
        uploader_user_id: currentUser.id,
      };
      const currentGallery = projectRaw.gallery || [];
      await base44.entities.ExplorarItem.update(projectRaw.id, {
        gallery: [...currentGallery, newItem],
      });
      setOpen(false);
      setPreview(null);
      setCaption("");
      setRestricted(false);
      onUploaded?.();
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPreview(null);
    setCaption("");
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.6)",
        }}
        title="Añadir a galería"
      >
        <Plus className="w-3.5 h-3.5" />
        Añadir a galería
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/mov"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Upload modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1300] bg-black/90 backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{ background: "#111" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <p className="text-sm font-bold text-white">Añadir a galería</p>
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview */}
                {preview && (
                  <div className="relative rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 200, aspectRatio: "9/16" }}>
                    {preview.isVideo ? (
                      <video src={preview.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                    ) : (
                      <img src={preview.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => { setPreview(null); fileRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest block mb-1.5">
                    Caption (opcional)
                  </label>
                  <input
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="Describe el contenido..."
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-white/25 placeholder-white/20"
                  />
                </div>

                {/* Restricted toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white/60">Solo para el equipo</p>
                    <p className="text-[10px] text-white/25">Visible solo para miembros del proyecto</p>
                  </div>
                  <div
                    onClick={() => setRestricted(r => !r)}
                    className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${restricted ? "bg-amber-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full mt-0.5 shadow transition-transform ${restricted ? "translate-x-4" : "translate-x-0.5"}`} />
                  </div>
                </div>

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={!preview || uploading}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  style={{ background: uploading ? "rgba(255,255,255,0.5)" : "white" }}
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Subiendo..." : "Publicar en galería"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}