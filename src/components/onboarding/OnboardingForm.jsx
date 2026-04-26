import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Music2, Building2, Camera, ChevronRight, Check, User } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", country: "US/CA" },
  { code: "+34", flag: "🇪🇸", country: "España" },
  { code: "+52", flag: "🇲🇽", country: "México" },
  { code: "+54", flag: "🇦🇷", country: "Argentina" },
  { code: "+57", flag: "🇨🇴", country: "Colombia" },
  { code: "+58", flag: "🇻🇪", country: "Venezuela" },
  { code: "+51", flag: "🇵🇪", country: "Perú" },
  { code: "+56", flag: "🇨🇱", country: "Chile" },
  { code: "+593", flag: "🇪🇨", country: "Ecuador" },
  { code: "+53", flag: "🇨🇺", country: "Cuba" },
  { code: "+507", flag: "🇵🇦", country: "Panamá" },
  { code: "+503", flag: "🇸🇻", country: "El Salvador" },
  { code: "+502", flag: "🇬🇹", country: "Guatemala" },
  { code: "+504", flag: "🇭🇳", country: "Honduras" },
  { code: "+505", flag: "🇳🇮", country: "Nicaragua" },
  { code: "+506", flag: "🇨🇷", country: "Costa Rica" },
  { code: "+55", flag: "🇧🇷", country: "Brasil" },
  { code: "+598", flag: "🇺🇾", country: "Uruguay" },
  { code: "+591", flag: "🇧🇴", country: "Bolivia" },
  { code: "+595", flag: "🇵🇾", country: "Paraguay" },
  { code: "+44", flag: "🇬🇧", country: "UK" },
  { code: "+33", flag: "🇫🇷", country: "Francia" },
  { code: "+49", flag: "🇩🇪", country: "Alemania" },
  { code: "+39", flag: "🇮🇹", country: "Italia" },
];

const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Venezuela", "Perú", "Chile",
  "Ecuador", "Cuba", "Panamá", "El Salvador", "Guatemala", "Honduras",
  "Nicaragua", "Costa Rica", "Brasil", "Uruguay", "Bolivia", "Paraguay",
  "República Dominicana", "Puerto Rico", "Estados Unidos", "Canadá",
  "Reino Unido", "Francia", "Alemania", "Italia", "Portugal", "Otro"
];

const inputClass = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/30 transition-colors";
const labelClass = "block text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2";

const STEPS = [
  { id: 1, title: "¿Quién eres?", subtitle: "Cuéntanos cómo usar la plataforma" },
  { id: 2, title: "Tus datos", subtitle: "Información personal y de contacto" },
  { id: 3, title: "Casi listo", subtitle: "Agrega una foto de perfil" },
];

export default function OnboardingForm({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    artist_name: "",
    gender: "",
    phone_country_code: "+34",
    phone: "",
    nationality: "",
    address: "",
    profile_photo_url: "",
    account_type: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("profile_photo_url", file_url);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const full_name = `${form.first_name} ${form.last_name}`.trim();
      await base44.entities.UserProfile.create({
        user_id: user.id,
        user_email: user.email,
        first_name: form.first_name,
        last_name: form.last_name,
        full_name,
        artist_name: form.artist_name,
        gender: form.gender,
        phone: form.phone,
        phone_country_code: form.phone_country_code,
        nationality: form.nationality,
        address: form.address,
        profile_photo_url: form.profile_photo_url,
        account_type: form.account_type,
        onboarding_completed: true,
      });
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const canStep1 = !!form.account_type;
  const canStep2 = form.first_name && form.last_name && form.phone && form.nationality && form.gender;

  return (
    <div className="fixed inset-0 z-[500] bg-[#080808] flex items-center justify-center p-4 overflow-y-auto">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md py-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Cabaña Creative</div>
          <h1
            className="text-3xl font-black text-white leading-none"
            style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}
          >
            {STEPS[step - 1].title}
          </h1>
          <p className="text-white/30 text-sm mt-2">{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map(s => (
            <div
              key={s.id}
              className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${s.id <= step ? "bg-white" : "bg-white/10"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Tipo de cuenta */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { key: "artist", label: "Artista", desc: "Músico, creativo, performer", Icon: Music2 },
                  { key: "brand", label: "Marca", desc: "Empresa, proyecto, colectivo", Icon: Building2 },
                ].map(({ key, label, desc, Icon }) => (
                  <button
                    key={key}
                    onClick={() => set("account_type", key)}
                    className={`relative p-6 rounded-2xl border text-left transition-all duration-200 ${
                      form.account_type === key
                        ? "border-white/50 bg-white/[0.08]"
                        : "border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {form.account_type === key && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" strokeWidth={3} />
                      </div>
                    )}
                    <Icon className={`w-6 h-6 mb-3 ${form.account_type === key ? "text-white" : "text-white/30"}`} />
                    <p className={`font-bold text-base ${form.account_type === key ? "text-white" : "text-white/50"}`}>{label}</p>
                    <p className="text-[11px] text-white/25 mt-1 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>

              <button
                disabled={!canStep1}
                onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: Datos personales */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {/* Nombre y apellido */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input
                    className={inputClass}
                    placeholder="Tu nombre"
                    value={form.first_name}
                    onChange={e => set("first_name", e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Apellido *</label>
                  <input
                    className={inputClass}
                    placeholder="Tu apellido"
                    value={form.last_name}
                    onChange={e => set("last_name", e.target.value)}
                  />
                </div>
              </div>

              {/* Nombre artístico / marca */}
              <div>
                <label className={labelClass}>{form.account_type === "brand" ? "Nombre de marca" : "Nombre artístico"}</label>
                <input
                  className={inputClass}
                  placeholder={form.account_type === "brand" ? "Nombre de tu marca" : "Tu alias artístico"}
                  value={form.artist_name}
                  onChange={e => set("artist_name", e.target.value)}
                />
              </div>

              {/* Género */}
              <div>
                <label className={labelClass}>Género *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "male", label: "Masculino" },
                    { key: "female", label: "Femenino" },
                    { key: "prefer_not_to_say", label: "Prefiero no decirlo" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => set("gender", key)}
                      className={`py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                        form.gender === key
                          ? "border-white/50 bg-white/[0.1] text-white"
                          : "border-white/[0.07] bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className={labelClass}>Teléfono *</label>
                <div className="flex gap-2">
                  <select
                    value={form.phone_country_code}
                    onChange={e => set("phone_country_code", e.target.value)}
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-colors"
                    style={{ minWidth: 90 }}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} className="bg-[#111]">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder="Número de teléfono"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    type="tel"
                  />
                </div>
              </div>

              {/* Nacionalidad */}
              <div>
                <label className={labelClass}>País de nacionalidad *</label>
                <select value={form.nationality} onChange={e => set("nationality", e.target.value)} className={inputClass}>
                  <option value="" className="bg-[#111]">Selecciona un país</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </div>

              {/* Dirección */}
              <div>
                <label className={labelClass}>Dirección</label>
                <input
                  className={inputClass}
                  placeholder="Ciudad, País"
                  value={form.address}
                  onChange={e => set("address", e.target.value)}
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input className={inputClass} value={user?.email || ""} disabled style={{ opacity: 0.4, cursor: "not-allowed" }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
                >
                  Atrás
                </button>
                <button
                  disabled={!canStep2}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Foto de perfil */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex flex-col items-center mb-8">
                <label className="cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                  />
                  <div className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-200 ${
                    form.profile_photo_url ? "border-white/30" : "border-white/15 group-hover:border-white/30"
                  }`}>
                    {form.profile_photo_url ? (
                      <img src={form.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-7 h-7 text-white/25 group-hover:text-white/50 transition-colors" />
                        <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors text-center px-2">
                          {uploadingPhoto ? "Subiendo..." : "Subir foto"}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
                <p className="text-white/25 text-xs mt-4">Opcional — puedes añadirla después</p>

                {/* Summary */}
                <div className="mt-6 w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/30">Nombre</span>
                    <span className="text-white font-medium">{form.first_name} {form.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Tipo</span>
                    <span className="text-white font-medium capitalize">{form.account_type === "artist" ? "Artista" : "Marca"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">País</span>
                    <span className="text-white font-medium">{form.nationality}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : (
                    <><Check className="w-4 h-4" /> Entrar a Cabaña</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}