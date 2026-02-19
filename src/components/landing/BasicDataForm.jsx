import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function BasicDataForm({ isOpen, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre && formData.email && formData.whatsapp) {
      onSubmit(formData);
      setFormData({ nombre: "", email: "", whatsapp: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-zinc-900 rounded-xl border border-white/10 p-5 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Datos de contacto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Tu email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
            required
          />
          <input
            type="tel"
            name="whatsapp"
            placeholder="Tu WhatsApp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm rounded-lg transition-all"
          >
            Continuar
          </button>
        </form>
      </motion.div>
    </div>
  );
}