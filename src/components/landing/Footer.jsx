import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PhoneInput from "./PhoneInput";

export default function Footer() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [phoneValue, setPhoneValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setIsSubmitting(true);
    try {
      await base44.functions.invoke('sendContactEmail', {
        name: contactForm.name,
        email: contactForm.email,
        phone: phoneValue,
        message: contactForm.message
      });
      setSubmitStatus("success");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setPhoneValue("");
      setTimeout(() => setSubmitStatus(null), 4000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-6 pt-16 footer-inner-padding">
        
        {/* Contact Section — Premium */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 relative overflow-hidden rounded-3xl"
          style={{ background: "linear-gradient(135deg, #0e0e0f 0%, #141416 60%, #0a0a0b 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff5833]/[0.04] rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/[0.015] rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-0">
            {/* Left — Contact Info */}
            <div className="p-10 lg:p-14 lg:border-r border-white/[0.05] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-[10px] font-bold text-[#ff5833] uppercase tracking-[0.35em]">Contacto</span>
                  <div className="h-px bg-[#ff5833]/20 w-8" />
                </div>
                <h3
                  className="text-4xl sm:text-5xl font-black text-white leading-[0.92] tracking-tight mb-5"
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  Hablemos.
                </h3>
                <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                  Cuéntanos sobre tu proyecto. Encontraremos la mejor forma de trabajar juntos.
                </p>
              </div>

              <div className="mt-10 space-y-3">
                <a
                  href="mailto:hola@cabanacreative.es"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center group-hover:border-[#ff5833]/30 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-white/30 group-hover:text-[#ff5833]/70 transition-colors" />
                  </div>
                  <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors">hola@cabanacreative.es</span>
                </a>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-white/30" />
                  </div>
                  <span className="text-sm text-white/40">Madrid, España</span>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <form onSubmit={handleContactSubmit} className="p-10 lg:p-14 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,88,51,0.35)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(255,88,51,0.35)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                  required
                />
              </div>
              <div>
                <PhoneInput value={phoneValue} onChange={setPhoneValue} />
              </div>
              <textarea
                placeholder="Cuéntanos sobre tu proyecto..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all resize-none h-28"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                onFocus={e => e.target.style.borderColor = "rgba(255,88,51,0.35)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.07)"}
                required
              />

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-40"
                style={{
                  background: isSubmitting ? "rgba(255,88,51,0.5)" : "#ff5833",
                  color: "white",
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
              </motion.button>

              {submitStatus === "success" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400/80 text-xs text-center">
                  Mensaje enviado correctamente.
                </motion.p>
              )}
              {submitStatus === "error" && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400/80 text-xs text-center">
                  Error al enviar. Intenta de nuevo.
                </motion.p>
              )}
            </form>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://media.base44.com/images/public/6966ddf48947f217e81ea27c/6b7c4002a_Titulo.png" 
                alt="Cabaña Creative"
                className="h-12 w-auto"
              />
              <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, lineHeight: 1, display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0 }}>
                <span style={{ letterSpacing: '-0.04em', display: 'inline-flex', alignItems: 'flex-start', lineHeight: 1, margin: 0, padding: 0, color: '#ff5833', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, fontSize: '1.25rem' }}>
                  Cabaña<sup style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.6rem', fontWeight: 400, lineHeight: 1, marginLeft: '3px', verticalAlign: 'top', position: 'relative', top: '2px' }}>®</sup>
                </span>
                <span style={{ letterSpacing: '-0.04em', display: 'block', lineHeight: 1, margin: 0, padding: 0, color: 'white', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 900, fontSize: '1.25rem' }}>Creative</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-3">
              Una plataforma de música, films y creadores. Seleccionado. Organizado. En movimiento.
            </p>
            <p className="text-xs text-gray-600 italic">
              Contenido real, creadores reales.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Servicios</h4>
            <ul className="space-y-3">
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Producción Musical</a></li>
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Mix y Mastering</a></li>
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Branding</a></li>
              <li><a href="#ofertas" className="text-sm text-gray-500 hover:text-white transition-colors">Estrategia de Contenido</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Redes</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">YouTube</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">TikTok</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Cabaña Creative. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacidad</a>
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}