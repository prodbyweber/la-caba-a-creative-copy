import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, Save, LogOut, Edit, Music, Palette } from "lucide-react";
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

  const { data: adnData } = useQuery({
    queryKey: ['myADN'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const adns = await base44.entities.ADNdeMarca.filter({ user_id: user.id });
      return adns.length > 0 ? adns[0] : null;
    }
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
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
        {adnData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8 mt-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold">ADN de Marca</h2>
              </div>
              <button
                onClick={() => navigate(createPageUrl("ADNdeMarca"))}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            </div>

            <div className="space-y-6">
              {/* Banner Preview */}
              <div 
                className="relative rounded-xl overflow-hidden h-32 flex items-center justify-center"
                style={{
                  background: adnData.colors?.length >= 4 
                    ? `linear-gradient(135deg, ${adnData.colors[0]} 0%, ${adnData.colors[1]} 35%, ${adnData.colors[2]} 65%, ${adnData.colors[3]} 100%)`
                    : 'linear-gradient(135deg, #0D0D0D 0%, #10B981 100%)'
                }}
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">{adnData.nombre_artistico}</h3>
                  <p className="text-white/80 text-sm">{adnData.project_theme}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Países</p>
                  <p className="text-sm text-white">{adnData.pais_nacimiento} → {adnData.pais_residencia}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Energía</p>
                  <p className="text-sm text-white">{adnData.vibe}</p>
                </div>
              </div>

              {/* Keywords */}
              {adnData.project_keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {adnData.project_keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Musical References */}
              {adnData.musical_references?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Music className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-400">Referencias Musicales</p>
                  </div>
                  <div className="space-y-2">
                    {adnData.musical_references.map((ref, idx) => (
                      <a
                        key={idx}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-white/5 rounded text-xs text-emerald-400 hover:bg-white/10 transition-colors truncate"
                      >
                        {ref.url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {adnData.colors?.length > 0 && (
                <div className="flex gap-2">
                  {adnData.colors.map((color, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: color }}
                      className="w-12 h-12 rounded-lg ring-1 ring-white/20"
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}