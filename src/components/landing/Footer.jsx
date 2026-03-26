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
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 border border-white/5 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">Ponte en contacto</h3>
              <p className="text-gray-400 mb-8">Cuéntanos sobre tu proyecto y encontraremos la mejor forma de ayudarte.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0" style={{ color: '#ff5833' }} />
                  <a href="mailto:hola@lacabanacreative.com" className="text-gray-300 hover:text-white transition-colors">
                    hola@lacabanacreative.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0" style={{ color: '#ff5833' }} />
                  <p className="text-gray-300">Madrid, España</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4 min-w-0 w-full overflow-hidden">
              <div>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Tu email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <PhoneInput
                  value={phoneValue}
                  onChange={setPhoneValue}
                />
              </div>
              <div>
                <textarea
                  placeholder="Cuéntanos sobre tu proyecto"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors h-24 resize-none"
                  required
                />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#ff5833] hover:bg-[#e84d2a] text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Enviando..." : "Enviar mensaje"}
              </motion.button>

              {submitStatus === "success" && (
                <p className="text-emerald-400 text-sm text-center">¡Mensaje enviado con éxito!</p>
              )}
              {submitStatus === "error" && (
                <p className="text-red-400 text-sm text-center">Error al enviar. Intenta de nuevo.</p>
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
              Formación, dirección creativa y producción musical para artistas que quieren ir en serio.
            </p>
            <p className="text-xs text-gray-600 italic">
              Algunos servicios requieren validación previa
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