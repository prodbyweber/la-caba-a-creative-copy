import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { User, Music2, Building2, Camera, ChevronRight, Check } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+507", country: "Panamá", flag: "🇵🇦" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+49", country: "Alemania", flag: "🇩🇪" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
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

export default function OnboardingForm({ user, onComplete }) {
  const [step, setStep] = useState(1); // 1: tipo, 2: datos personales, 3: foto
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    artist_name: "",
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
      await base44.entities.UserProfile.create({
        user_id: user.id,
        user_email: user.email,
        full_name: form.full_name,
        artist_name: form.artist_name,
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

  const canProceedStep1 = !!form.account_type;
  const canProceedStep2 = form.full_name && form.phone && form.nationality;

  return (
    <div className="fixed inset-0 z-[500] bg-[#080808] flex items-center justify-center p-4">
      {/* Background subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-[11px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">Cabaña Creative</div>
          <h1 className="text-3xl font-black text-white leading-none" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
            {step === 1 ? "¿Quién eres?" : step === 2 ? "Tus datos" : "Casi listo"}
          </h1>
          <p className="text-white/30 text-sm mt-2">
            {step === 1 ? "Cuéntanos cómo usar la plataforma" : step === 2 ? "Completa tu perfil" : "Agrega una foto opcional"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-white" : "bg-white/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Tipo de cuenta */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { key: "artist", label: "Artista", desc: "Músico, creativo, performer", IconComp: Music2 },
                  { key: "brand", label: "Marca", desc: "Empresa, proyecto, colectivo", IconComp: Building2 },
                ].map(({ key, label, desc, IconComp }) => (
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
                    <IconComp className={`w-6 h-6 mb-3 ${form.account_type === key ? "text-white" : "text-white/30"}`} />
                    <p className={`font-bold text-base ${form.account_type === key ? "text-white" : "text-white/50"}`}>{label}</p>
                    <p className="text-[11px] text-white/25 mt-1 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>

              <button
                disabled={!canProceedStep1}
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
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input className={inputClass} placeholder="Tu nombre completo" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>{form.account_type === "brand" ? "Nombre de marca" : "Nombre artístico"}</label>
                <input className={inputClass} placeholder={form.account_type === "brand" ? "Nombre de tu marca" : "Tu alias artístico"} value={form.artist_name} onChange={e => set("artist_name", e.target.value)} />
              </div>

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
                      <option key={c.code} value={c.code} className="bg-[#111]">{c.flag} {c.code}</option>
                    ))}
                  </select>
                  <input className={inputClass} placeholder="Número de teléfono" value={form.phone} onChange={e => set("phone", e.target.value)} type="tel" />
                </div>
              </div>

              <div>
                <label className={labelClass}>País de nacionalidad *</label>
                <select value={form.nationality} onChange={e => set("nationality", e.target.value)} className={inputClass}>
                  <option value="" className="bg-[#111]">Selecciona un país</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass}>Dirección</label>
                <input className={inputClass} placeholder="Ciudad, País" value={form.address} onChange={e => set("address", e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>Correo electrónico</label>
                <input className={inputClass} value={user?.email || ""} disabled style={{ opacity: 0.4, cursor: "not-allowed" }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all">
                  Atrás
                </button>
                <button
                  disabled={!canProceedStep2}
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
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                  <div className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-200 ${form.profile_photo_url ? "border-white/30" : "border-white/15 group-hover:border-white/30"}`}>
                    {form.profile_photo_url ? (
                      <img src={form.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-6 h-6 text-white/25 group-hover:text-white/50 transition-colors" />
                        <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors">
                          {uploadingPhoto ? "Subiendo..." : "Subir foto"}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
                <p className="text-white/25 text-xs mt-4">Opcional — puedes añadirla después</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all">
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