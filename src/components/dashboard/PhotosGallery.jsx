import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Upload, Trash2, Loader2 } from "lucide-react";

export default function PhotosGallery({ userProfileId, compact = false }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [resolvedProfileId, setResolvedProfileId] = useState(userProfileId);

  useEffect(() => {
    if (!userProfileId) {
      base44.auth.me().then(async (u) => {
        if (!u?.id) return;
        const profiles = await base44.entities.UserProfile.filter({ user_id: u.id });
        if (profiles[0]?.id) setResolvedProfileId(profiles[0].id);
      }).catch(() => {});
    } else {
      setResolvedProfileId(userProfileId);
    }
  }, [userProfileId]);

  const activeProfileId = resolvedProfileId;

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-photos", activeProfileId],
    queryFn: async () => {
      if (!activeProfileId) return null;
      const profiles = await base44.entities.UserProfile.filter({ id: activeProfileId });
      return profiles[0] || null;
    },
    enabled: !!activeProfileId,
    staleTime: 0,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.update(activeProfileId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-profile-photos", activeProfileId] }),
  });

  const MAX_PHOTOS = 4;

  const handleUpload = async (files) => {
    const fileArr = Array.from(files);
    const currentPhotos = userProfile?.media_items || [];
    const currentCount = currentPhotos.filter(m => m.type === "image").length;
    const available = MAX_PHOTOS - currentCount;
    if (available <= 0) {
      alert(`Límite de ${MAX_PHOTOS} fotos alcanzado.`);
      return;
    }
    const toUpload = fileArr.slice(0, available).filter(f => f.size <= 20 * 1024 * 1024);
    if (!toUpload.length) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(toUpload.map(f => base44.integrations.Core.UploadFile({ file: f })));
      const newItems = uploaded.map((res, i) => ({
        id: `${Date.now()}_${i}`,
        type: "image",
        url: res.file_url,
        title: toUpload[i].name,
        thumbnail: res.file_url,
      }));
      await updateProfileMutation.mutateAsync({ media_items: [...currentPhotos, ...newItems] });
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
    <div className={compact ? "space-y-3" : "space-y-6"}>
      {photos.length < MAX_PHOTOS && (
        compact ? (
          <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/8 transition-colors">
            <input type="file" accept="image/*" multiple onChange={(e) => e.target.files?.length && handleUpload(e.target.files)} disabled={uploading} className="hidden" />
            {uploading
              ? <Loader2 className="w-3 h-3 text-white/30 animate-spin" />
              : <Upload className="w-3 h-3 text-white/30" />}
            <span className="text-[10px] text-white/30 font-medium">{uploading ? "Subiendo..." : "Añadir"}</span>
          </label>
        ) : (
          <label className="block cursor-pointer">
            <div className="relative border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-white/40 hover:bg-white/[0.02] transition-all group">
              <input type="file" accept="image/*" multiple onChange={(e) => e.target.files?.length && handleUpload(e.target.files)} disabled={uploading} className="hidden" />
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-white/30 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
                )}
                <div>
                  <p className="text-sm font-medium text-white/70">{uploading ? "Subiendo..." : "Sube fotos"}</p>
                  <p className="text-xs text-white/30 mt-1">{photos.length}/{MAX_PHOTOS} fotos · Máx 20MB</p>
                </div>
              </div>
            </div>
          </label>
        )
      )}
      {photos.length >= MAX_PHOTOS && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs text-white/25"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <span>Límite de {MAX_PHOTOS} fotos — elimina una para subir otra</span>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-xs">Sin fotos aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative rounded-xl overflow-hidden bg-white/5 aspect-square"
            >
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3 h-3" />
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