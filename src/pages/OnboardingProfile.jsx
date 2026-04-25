import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Upload, Check, Loader, AlertCircle } from "lucide-react";

const COUNTRIES = [
  { code: "ES", name: "España", phone: "+34" },
  { code: "MX", name: "México", phone: "+52" },
  { code: "AR", name: "Argentina", phone: "+54" },
  { code: "CO", name: "Colombia", phone: "+57" },
  { code: "CL", name: "Chile", phone: "+56" },
  { code: "PE", name: "Perú", phone: "+51" },
  { code: "VE", name: "Venezuela", phone: "+58" },
  { code: "US", name: "Estados Unidos", phone: "+1" },
  { code: "BR", name: "Brasil", phone: "+55" },
  { code: "GB", name: "Reino Unido", phone: "+44" },
  { code: "FR", name: "Francia", phone: "+33" },
  { code: "DE", name: "Alemania", phone: "+49" },
  { code: "IT", name: "Italia", phone: "+39" },
  { code: "CA", name: "Canadá", phone: "+1" },
];

export default function OnboardingProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    stageName: "",
    residenceCountry: "ES",
    nationalityCountry: "ES",
    phoneCountry: "ES",
    phoneNumber: "",
    address: "",
    avatar: null,
    avatarPreview: null,
  });

  useEffect(() => {
    const initUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setError("Error al cargar datos del usuario");
      } finally {
        setLoading(false);
      }
    };
    initUser();
  }, []);

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setError("La foto no puede superar 20MB");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        avatar: file_url,
        avatarPreview: URL.createObjectURL(file),
      }));
      setError(null);
    } catch (err) {
      setError("Error al subir la foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validar campos obligatorios
      if (!formData.fullName || !formData.stageName || !formData.phoneNumber) {
        setError("Por favor completa todos los campos obligatorios");
        setSubmitting(false);
        return;
      }

      // Crear/actualizar registro del artista
      const artistData = {
        stageName: formData.stageName,
        legalName: `${formData.fullName} ${formData.lastName}`.trim(),
        avatar_url: formData.avatar,
        location: formData.address,
        phone: `${COUNTRIES.find(c => c.code === formData.phoneCountry)?.phone}${formData.phoneNumber}`,
        notes: `País residencia: ${COUNTRIES.find(c => c.code === formData.residenceCountry)?.name}\nNacionalidad: ${COUNTRIES.find(c => c.code === formData.nationalityCountry)?.name}`,
      };

      // Buscar si ya existe artista vinculado a este usuario
      const artists = await base44.entities.Artist.filter({ user_id: user.id });
      
      let artistId;
      if (artists.length > 0) {
        // Actualizar artista existente
        await base44.entities.Artist.update(artists[0].id, artistData);
        artistId = artists[0].id;
      } else {
        // Crear nuevo artista
        const newArtist = await base44.entities.Artist.create({
          ...artistData,
          user_id: user.id,
          status: "Active",
        });
        artistId = newArtist.id;
      }

      // Actualizar datos del usuario en la plataforma
      await base44.auth.updateMe({
        full_name: `${formData.fullName} ${formData.lastName}`.trim(),
      });

      setSuccess(true);
      setTimeout(() => {
        // Redirigir al dashboard
        window.location.href = "/Dashboard";
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Error al guardar el perfil");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const phoneCountryObj = COUNTRIES.find(c => c.code === formData.phoneCountry);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Completa tu Perfil
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Cuéntanos sobre ti para personalizar tu experiencia en la plataforma
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111113] rounded-2xl border border-white/10 p-6 sm:p-8"
        >
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex gap-3">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-400">Perfil completado. Redirigiendo...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de Perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Foto de Perfil
              </label>
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                  {formData.avatarPreview ? (
                    <img
                      src={formData.avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-white/40" />
                  )}
                </div>
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className="p-4 rounded-lg border border-dashed border-white/20 hover:border-emerald-500/50 bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-center">
                    <Upload className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm font-medium text-white">
                      {uploading ? "Subiendo..." : "Subir foto"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG (máx 20MB)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Nombre Completo y Apellidos */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellidos
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Tus apellidos"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Nombre Artístico */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre Artístico *
              </label>
              <input
                type="text"
                value={formData.stageName}
                onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
                placeholder="Tu nombre como artista"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                required
              />
            </div>

            {/* Ubicación */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País de Residencia
                </label>
                <select
                  value={formData.residenceCountry}
                  onChange={(e) => setFormData({ ...formData, residenceCountry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  País de Nacionalidad
                </label>
                <select
                  value={formData.nationalityCountry}
                  onChange={(e) => setFormData({ ...formData, nationalityCountry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.phoneCountry}
                  onChange={(e) => setFormData({ ...formData, phoneCountry: e.target.value })}
                  className="w-24 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.phone}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Número sin código de área"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Ejemplo: {phoneCountryObj?.phone} {phoneCountryObj?.code === 'ES' ? '912345678' : '5551234567'}
              </p>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, número, ciudad..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || uploading || success}
              className="w-full py-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  Completado
                </>
              ) : (
                "Completar Perfil"
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Los datos se sincronizarán automáticamente con tu cuenta
        </p>
      </div>
    </div>
  );
}