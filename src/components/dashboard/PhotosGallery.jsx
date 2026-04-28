import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, Trash2, Loader2 } from "lucide-react";

export default function PhotosGallery({ userProfileId }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-photos", userProfileId],
    queryFn: async () => {
      if (!userProfileId) return null;
      const profiles = await base44.entities.UserProfile.list();
      return profiles.find(p => p.id === userProfileId);
    },
    enabled: !!userProfileId,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(userProfileId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile-photos", userProfileId] }),
  });

  const handleUpload = async (file) => {
    if (!file || file.size > 20 * 1024 * 1024) {
      alert("El archivo debe ser menor a 20MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const currentPhotos = userProfile?.media_items || [];
      const newPhotos = [
        ...currentPhotos,
        {
          id: Date.now().toString(),
          type: "image",
          url: file_url,
          title: file.name,
          thumbnail: file_url,
        },
      ];
      await updateProfileMutation.mutateAsync({ media_items: newPhotos });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (photoId) => {
    const updated = (userProfile?.media_items || []).filter(m => m.id !== photoId);
    updateProfileMutation.mutate({ media_items: updated });
  };

  const photos = (userProfile?.media_items || []).filter(m => m.type === "image");

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div>
        <label className="block">
          <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-white/40 hover:bg-white/[0.02] transition-all cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-white/30 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
              )}
              <div>
                <p className="text-sm font-medium text-white/70">
                  {uploading ? "Subiendo..." : "Sube una foto"}
                </p>
                <p className="text-xs text-white/30 mt-1">Máximo 20MB • JPG, PNG</p>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Gallery Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/40 text-sm">Aún no hay fotos. Sube tu primera foto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative rounded-xl overflow-hidden bg-white/5 aspect-square"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}