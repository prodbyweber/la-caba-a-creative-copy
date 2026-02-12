import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSteps = [
  {
    id: 1,
    title: "Información básica",
    fields: [
      { name: "nombre", label: "Nombre artístico", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "telefono", label: "Teléfono", type: "tel", required: true },
    ]
  },
  {
    id: 2,
    title: "Tu proyecto",
    fields: [
      { 
        name: "genero", 
        label: "¿Qué género haces?", 
        type: "select",
        options: ["Urbano", "Pop", "R&B", "Trap", "Reggaeton", "Otro"],
        required: true 
      },
      { 
        name: "experiencia", 
        label: "¿Cuánto tiempo llevas haciendo música?", 
        type: "select",
        options: ["Menos de 1 año", "1-2 años", "3-5 años", "Más de 5 años"],
        required: true 
      },
      { name: "musica_publicada", label: "¿Tienes música publicada? (enlace)", type: "text", required: false },
    ]
  },
  {
    id: 3,
    title: "Objetivos",
    fields: [
      { 
        name: "objetivo_principal", 
        label: "¿Cuál es tu objetivo principal?", 
        type: "select",
        options: [
          "Definir mi sonido y marca",
          "Producir mi primer proyecto profesional",
          "Escalar mi proyecto actual",
          "Mejorar la calidad de mi música"
        ],
        required: true 
      },
      { 
        name: "presupuesto", 
        label: "¿Cuál es tu presupuesto mensual para invertir en tu proyecto?", 
        type: "select",
        options: ["300-500€", "500-1000€", "1000-2000€", "Más de 2000€"],
        required: true 
      },
      { name: "informacion_adicional", label: "¿Algo más que debamos saber?", type: "textarea", required: false },
    ]
  }
];

export default function ArtistApplicationForm({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    onSuccess();
  };

  const currentStepData = formSteps[currentStep];
  const progress = ((currentStep + 1) / formSteps.length) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-zinc-800">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Paso {currentStep + 1} de {formSteps.length}</p>
                  <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 mb-8">
              {currentStepData.fields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {field.label}
                    {field.required && <span className="text-emerald-400 ml-1">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <select
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="">Selecciona una opción</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                      rows={4}
                      placeholder="Escribe aquí..."
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder={`Ingresa tu ${field.label.toLowerCase()}`}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-3 rounded-xl border-zinc-700 text-white hover:bg-zinc-800"
                  disabled={isSubmitting}
                >
                  Atrás
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  currentStep === 0 ? 'w-full' : ''
                } ${
                  isSubmitting 
                    ? 'bg-zinc-700 cursor-not-allowed' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                }`}
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : currentStep === formSteps.length - 1 ? (
                  <>
                    Agendar Meeting
                    <CheckCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>

            {/* Cancel Link */}
            <button
              onClick={onClose}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}