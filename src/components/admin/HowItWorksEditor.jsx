import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const gradientOptions = [
  { value: "from-emerald-500 to-emerald-600", label: "Verde Esmeralda", color: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
  { value: "from-purple-500 to-purple-600", label: "Púrpura", color: "bg-gradient-to-br from-purple-500 to-purple-600" },
  { value: "from-orange-500 to-orange-600", label: "Naranja", color: "bg-gradient-to-br from-orange-500 to-orange-600" },
  { value: "from-blue-500 to-blue-600", label: "Azul", color: "bg-gradient-to-br from-blue-500 to-blue-600" },
  { value: "from-pink-500 to-pink-600", label: "Rosa", color: "bg-gradient-to-br from-pink-500 to-pink-600" },
  { value: "from-red-500 to-red-600", label: "Rojo", color: "bg-gradient-to-br from-red-500 to-red-600" },
  { value: "from-teal-500 to-teal-600", label: "Verde Azulado", color: "bg-gradient-to-br from-teal-500 to-teal-600" },
  { value: "from-yellow-500 to-yellow-600", label: "Amarillo", color: "bg-gradient-to-br from-yellow-500 to-yellow-600" }
];

export default function HowItWorksEditor({ config, onUpdate }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const steps = config?.how_it_works_steps || [];

  const addStep = () => {
    const newStep = {
      title: "Nuevo Servicio",
      description: "Describe este servicio aquí",
      price: "€0/hora",
      gradient: "from-emerald-500 to-emerald-600"
    };
    onUpdate([...steps, newStep]);
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    onUpdate(newSteps);
  };

  const removeStep = (index) => {
    onUpdate(steps.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          Arrastra para reordenar, haz clic para editar
        </p>
        <button
          onClick={addStep}
          className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Tarjeta
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <p className="text-gray-500 mb-4">No hay tarjetas creadas</p>
          <button
            onClick={addStep}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
          >
            Crear Primera Tarjeta
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="how-it-works-steps">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {steps.map((step, index) => (
                  <Draggable key={index} draggableId={`step-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all ${
                          snapshot.isDragging ? 'shadow-2xl shadow-emerald-500/20 border-emerald-500/50' : ''
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </div>
                          
                          <div className={`w-10 h-10 rounded-lg ${step.gradient} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold">{String(index + 1).padStart(2, '0')}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white truncate">{step.title}</h4>
                            <p className="text-xs text-gray-400 truncate">{step.price}</p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStep(index);
                            }}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {expandedIndex === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Expanded Content */}
                        {expandedIndex === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/10 p-4 space-y-4"
                          >
                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">Título</label>
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => updateStep(index, 'title', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="Ej: Producción musical por horas"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">Descripción</label>
                              <textarea
                                value={step.description}
                                onChange={(e) => updateStep(index, 'description', e.target.value)}
                                rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-emerald-500/50"
                                placeholder="Describe el servicio..."
                              />
                            </div>

                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">Precio</label>
                              <input
                                type="text"
                                value={step.price}
                                onChange={(e) => updateStep(index, 'price', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                placeholder="Ej: Desde €50/hora"
                              />
                            </div>

                            <div>
                              <label className="text-sm text-gray-400 mb-2 block">Color de Gradiente</label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {gradientOptions.map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() => updateStep(index, 'gradient', option.value)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      step.gradient === option.value
                                        ? 'border-white scale-105'
                                        : 'border-white/10 hover:border-white/30'
                                    }`}
                                  >
                                    <div className={`h-12 rounded-lg ${option.color}`} />
                                    <p className="text-xs text-gray-400 mt-2 text-center">{option.label}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}