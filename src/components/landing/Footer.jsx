import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Footer() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    setIsSubmitting(true);
    try {
      // Aquí enviarías los datos del formulario
      console.log("Contacto:", contactForm);
      setSubmitStatus("success");
      setContactForm({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 3000);
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
                  <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <a href="mailto:contacto@lacabanacreative.com" className="text-gray-300 hover:text-white transition-colors">
                    contacto@lacabanacreative.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <a href="tel:+34000000000" className="text-gray-300 hover:text-white transition-colors">
                    +34 000 000 000
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-gray-300">Madrid, España</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
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
                <input
                  type="tel"
                  placeholder="Tu teléfono (opcional)"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none transition-colors"
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span className="text-xl font-semibold tracking-tight">
                Cabaña <span style={{ color: '#ff5833' }}>Creative</span>
              </span>
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