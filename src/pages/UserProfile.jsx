import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, Save, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function UserProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: brandDNA } = useQuery({
    queryKey: ['userBrandDNA', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const dnas = await base44.entities.ArtistBrandDNA.filter({ user_id: user.id });
      return dnas.length > 0 ? dnas[0] : null;
    },
    enabled: !!user?.id
  });

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    avatar_url: user?.avatar_url || ""
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        avatar_url: user.avatar_url || ""
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success("Perfil actualizado");
    },
    onError: (error) => {
      toast.error("Error al actualizar: " + error.message);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
      toast.success("Imagen subida");
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      full_name: formData.full_name,
      avatar_url: formData.avatar_url
    });
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Landing"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(createPageUrl("Landing"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate(createPageUrl("AdminDashboard"))}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-all"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8"
        >
          <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-4 border-white/10">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/40">
                    {formData.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">Haz clic para cambiar tu foto</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nombre Completo
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Tu nombre"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <Input
                value={formData.email}
                disabled
                className="bg-zinc-800/50 border-zinc-700 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>

            <Button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* ADN de Marca Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 mt-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">ADN de Marca</h2>
                <p className="text-sm text-gray-400">Tu identidad artística</p>
              </div>
            </div>
            <button
              onClick={() => navigate(createPageUrl("ADNdeMarca"))}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-all"
            >
              {brandDNA ? 'Editar' : 'Crear'}
            </button>
          </div>

          {brandDNA ? (
            <div className="space-y-6">
              {/* Banner Preview */}
              <div 
                className="relative rounded-xl overflow-hidden h-32 flex items-center justify-center"
                style={{
                  background: brandDNA.colors?.length >= 4 
                    ? `linear-gradient(135deg, ${brandDNA.colors[0]} 0%, ${brandDNA.colors[1]} 35%, ${brandDNA.colors[2]} 65%, ${brandDNA.colors[3]} 100%)`
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <div className="relative z-10 text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                    {brandDNA.artistName || formData.full_name}
                  </h3>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {brandDNA.emotions?.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Emociones</p>
                    <p className="text-sm font-medium text-white">{brandDNA.emotions.slice(0, 2).join(', ')}</p>
                  </div>
                )}
                {brandDNA.genres?.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Géneros</p>
                    <p className="text-sm font-medium text-white">{brandDNA.genres.slice(0, 2).join(', ')}</p>
                  </div>
                )}
                {brandDNA.vibe && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Energía</p>
                    <p className="text-sm font-medium text-white">{brandDNA.vibe}</p>
                  </div>
                )}
                {brandDNA.colors?.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Paleta</p>
                    <div className="flex gap-1 mt-1">
                      {brandDNA.colors.slice(0, 4).map((color, idx) => (
                        <div
                          key={idx}
                          style={{ backgroundColor: color }}
                          className="w-6 h-6 rounded border border-white/20"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  {brandDNA.has_paid ? (
                    <span className="text-emerald-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      ADN Completo Desbloqueado
                    </span>
                  ) : (
                    <span className="text-orange-400 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      ADN Básico (Desbloquea el completo)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Crea tu ADN de Marca
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Define tu identidad artística, emociones, géneros, paleta de colores y más.
              </p>
              <button
                onClick={() => navigate(createPageUrl("ADNdeMarca"))}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/20"
              >
                Comenzar Ahora
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}