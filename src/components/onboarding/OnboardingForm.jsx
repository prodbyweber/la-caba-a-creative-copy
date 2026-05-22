import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Music2, Building2, Camera, ChevronRight, Check, Move } from "lucide-react";

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
  { id: 3, title: "Tu username", subtitle: "Tu dirección única en la plataforma" },
  { id: 4, title: "Casi listo", subtitle: "Agrega una foto de perfil" },
];

const ACCOUNT_TYPES = [
  { key: "artist", label: "Artista", desc: "Músico, creativo, performer", Icon: Music2 },
  { key: "creator", label: "Creador", desc: "Modelo, influencer, content creator", Icon: Camera },
  { key: "brand", label: "Marca", desc: "Empresa, proyecto, colectivo", Icon: Building2 },
];

// Photo cropper — lets user drag to reposition
function PhotoCropper({ url, position, onPositionChange, onChangePhoto, uploading }) {
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(position || { x: 50, y: 50 });

  const clamp = (v) => Math.max(0, Math.min(100, v));

  const startDrag = (clientX, clientY) => {
    dragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  };

  const onMove = (clientX, clientY) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((clientX - lastPos.current.x) / rect.width) * -100;
    const dy = ((clientY - lastPos.current.y) / rect.height) * -100;
    lastPos.current = { x: clientX, y: clientY };
    setPos(p => {
      const next = { x: clamp(p.x + dx), y: clamp(p.y + dy) };
      onPositionChange(next);
      return next;
    });
  };

  const stopDrag = () => { dragging.current = false; };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/20 cursor-grab active:cursor-grabbing select-none shadow-2xl"
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onMouseMove={e => onMove(e.clientX, e.clientY)}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={stopDrag}
      >
        <img
          src={url}
          alt="Preview"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          style={{ objectPosition: `${pos.x}% ${pos.y}%` }}
        />
        {/* drag hint overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity rounded-full">
          <Move className="w-6 h-6 text-white/70" />
        </div>
      </div>
      <p className="text-[10px] text-white/25 flex items-center gap-1">
        <Move className="w-3 h-3" /> Arrastra para encuadrar
      </p>
      <label className="cursor-pointer text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onChangePhoto(e.target.files[0])} />
        {uploading ? "Subiendo..." : "Cambiar foto"}
      </label>
    </div>
  );
}

function toUsername(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 30);
}

export default function OnboardingForm({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPosition, setPhotoPosition] = useState({ x: 50, y: 50 });
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null|true|false
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    artist_name: "",
    username: "",
    gender: "",
    phone_country_code: "+34",
    phone: "",
    nationality: "",
    country_of_residence: "",
    address: "",
    profile_photo_url: "",
    account_type: "",
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const checkUsername = async (uname) => {
    if (!uname || uname.length < 3) { setUsernameAvailable(false); return; }
    setCheckingUsername(true);
    try {
      const existing = await base44.entities.UserProfile.filter({ username: uname });
      setUsernameAvailable(existing.length === 0);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (val) => {
    const clean = toUsername(val);
    set("username", clean);
    setUsernameAvailable(null);
  };

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
      const photo_position = `${photoPosition.x}% ${photoPosition.y}%`;
      const profileData = {
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
        country_of_residence: form.country_of_residence,
        address: form.address,
        profile_photo_url: form.profile_photo_url,
        photo_position,
        account_type: form.account_type,
        onboarding_completed: true,
        display_name: form.artist_name || full_name,
      };
      
      // Agregar datos específicos según el tipo de cuenta
      if (form.account_type === "creator") {
        profileData.role_tags = [];
      } else if (form.account_type === "brand") {
        profileData.promotion_enabled = false;
        profileData.active_campaigns = [];
      }
      
      profileData.username = form.username;
      await base44.entities.UserProfile.create(profileData);
      // Auto-crear perfil de artista vinculado al usuario
      try {
        await base44.functions.invoke('createArtistProfileForNewUser', {});
      } catch (e) {
        console.warn('Artist profile creation skipped:', e);
      }
      onComplete();
      // Redirigir al catálogo personal después del registro
      window.location.href = '/ArtistDashboard';
    } finally {
      setLoading(false);
    }
  };

  const canStep1 = !!form.account_type;
  const canStep2 = form.first_name && form.last_name && form.phone && form.nationality && form.gender && form.country_of_residence;
  const canStep3 = form.username.length >= 3 && usernameAvailable === true;

  return (
    <div className="fixed inset-0 z-[500] bg-[#080808] flex items-center justify-center p-4 overflow-y-auto">
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
          <h1 className="text-3xl font-black text-white leading-none" style={{ fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "-0.03em" }}>
            {STEPS[step - 1].title}
          </h1>
          <p className="text-white/30 text-sm mt-2">{STEPS[step - 1].subtitle}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map(s => (
            <div key={s.id} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${s.id <= step ? "bg-white" : "bg-white/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
           {step === 1 && (
             <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <div className="grid grid-cols-3 gap-3 mb-8">
                 {ACCOUNT_TYPES.map(({ key, label, desc, Icon }) => (
                  <button
                    key={key}
                    onClick={() => set("account_type", key)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${
                      form.account_type === key
                        ? "border-white/50 bg-white/[0.08]"
                        : "border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    {form.account_type === key && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                      </div>
                    )}
                    <Icon className={`w-5 h-5 mb-2 ${form.account_type === key ? "text-white" : "text-white/30"}`} />
                    <p className={`font-bold text-sm ${form.account_type === key ? "text-white" : "text-white/50"}`}>{label}</p>
                    <p className="text-[10px] text-white/25 mt-0.5 leading-tight">{desc}</p>
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

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input className={inputClass} placeholder="Tu nombre" value={form.first_name} onChange={e => set("first_name", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Apellido *</label>
                  <input className={inputClass} placeholder="Tu apellido" value={form.last_name} onChange={e => set("last_name", e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{form.account_type === "brand" ? "Nombre de marca" : "Nombre artístico"}</label>
                <input
                  className={inputClass}
                  placeholder={form.account_type === "brand" ? "Nombre de tu marca" : "Tu alias artístico"}
                  value={form.artist_name}
                  onChange={e => set("artist_name", e.target.value)}
                />
              </div>

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

              {/* Nacionalidad */}
              <div>
                <label className={labelClass}>País de nacionalidad *</label>
                <select value={form.nationality} onChange={e => set("nationality", e.target.value)} className={inputClass}>
                  <option value="" className="bg-[#111]">Selecciona un país</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </div>

              {/* País de residencia */}
              <div>
                <label className={labelClass}>País de residencia *</label>
                <select value={form.country_of_residence} onChange={e => set("country_of_residence", e.target.value)} className={inputClass}>
                  <option value="" className="bg-[#111]">¿Dónde vives actualmente?</option>
                  {COUNTRIES.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                </select>
              </div>

              {/* Ciudad */}
              <div>
                <label className={labelClass}>Ciudad</label>
                <input className={inputClass} placeholder="Ciudad" value={form.address} onChange={e => set("address", e.target.value)} />
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
                  disabled={!canStep2}
                  onClick={() => { setStep(3); if (!form.username) { const suggestion = toUsername(`${form.first_name}${form.last_name}`); set("username", suggestion); checkUsername(suggestion); } }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Username */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className={labelClass}>Tu username *</label>
                <p className="text-white/25 text-xs mb-3 leading-relaxed">
                  Esta será tu URL pública: <span className="text-white/50">cabana.cc/<strong>{form.username || "tunombre"}</strong></span>
                </p>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm select-none">@</div>
                  <input
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-10 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="tunombreusuario"
                    value={form.username}
                    onChange={e => handleUsernameChange(e.target.value)}
                    onBlur={() => form.username.length >= 3 && checkUsername(form.username)}
                    maxLength={30}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && <span className="text-white/30 text-xs">...</span>}
                    {!checkingUsername && usernameAvailable === true && <Check className="w-4 h-4 text-emerald-400" />}
                    {!checkingUsername && usernameAvailable === false && form.username.length >= 3 && (
                      <span className="text-red-400 text-lg leading-none">✕</span>
                    )}
                  </div>
                </div>
                {usernameAvailable === false && form.username.length >= 3 && (
                  <p className="text-red-400/70 text-xs mt-1.5">Este username ya está en uso. Prueba con otro.</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-emerald-400/70 text-xs mt-1.5">¡Disponible!</p>
                )}
                <p className="text-white/15 text-xs mt-2">Solo letras, números y guiones bajos. Mín. 3 caracteres.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all">
                  Atrás
                </button>
                <button
                  disabled={!canStep3}
                  onClick={() => setStep(4)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Foto */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex flex-col items-center mb-8">
                {form.profile_photo_url ? (
                  <PhotoCropper
                    url={form.profile_photo_url}
                    position={photoPosition}
                    onPositionChange={setPhotoPosition}
                    onChangePhoto={handlePhotoUpload}
                    uploading={uploadingPhoto}
                  />
                ) : (
                  <label className="cursor-pointer group">
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} />
                    <div className="w-36 h-36 rounded-full border-2 border-dashed border-white/15 group-hover:border-white/30 flex flex-col items-center justify-center overflow-hidden transition-all duration-200 bg-white/[0.03]">
                      <Camera className="w-8 h-8 text-white/25 group-hover:text-white/50 transition-colors" />
                      <span className="text-[10px] text-white/25 group-hover:text-white/40 transition-colors text-center px-2 mt-1">
                        {uploadingPhoto ? "Subiendo..." : "Subir foto"}
                      </span>
                    </div>
                  </label>
                )}
                <p className="text-white/20 text-xs mt-4">Opcional — puedes añadirla después</p>

                {/* Summary */}
                <div className="mt-6 w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/30">Nombre</span>
                    <span className="text-white font-medium">{form.first_name} {form.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-white/30">Tipo</span>
                     <span className="text-white font-medium">
                       {form.account_type === "artist" ? "Artista" : form.account_type === "creator" ? "Creador" : "Marca"}
                     </span>
                   </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Nacionalidad</span>
                    <span className="text-white font-medium">{form.nationality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/30">Residencia</span>
                    <span className="text-white font-medium">{form.country_of_residence}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-5 py-3.5 rounded-xl font-bold text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all">
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : (<><Check className="w-4 h-4" /> Entrar a Cabaña</>)}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}