import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Save, Plus, Trash2, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";

export function SectionEditor({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, multiline = false }) {
  const [localValue, setLocalValue] = React.useState(value || "");
  
  React.useEffect(() => {
    setLocalValue(value || "");
  }, [value]);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };
  
  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };
  
  const Component = multiline ? "textarea" : "input";
  
  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <Component
        type={multiline ? undefined : "text"}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}

export function ImageUpload({ label, value, onChange, isUploading, setIsUploading }) {
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 30MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    try {
      setIsUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <img 
            src={value} 
            alt="Preview" 
            className="w-20 h-20 object-cover rounded-lg border border-white/10"
          />
        )}
        <label className={`px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white cursor-pointer flex items-center gap-2 transition-colors ${
          isUploading ? 'opacity-50 pointer-events-none' : ''
        }`}>
          <Upload className="w-4 h-4" />
          {isUploading ? 'Subiendo...' : 'Cambiar Imagen'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}

export function ArrayEditor({ label, items, onChange, itemLabel, placeholder }) {
  const addItem = () => {
    onChange([...items, ""]);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <div className="space-y-2">
        {items?.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={() => removeItem(index)}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar {itemLabel}
        </button>
      </div>
    </div>
  );
}