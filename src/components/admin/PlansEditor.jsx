import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder-white/25 focus:outline-none focus:border-white/30 text-sm";
const labelCls = "block text-xs font-semibold text-white/40 uppercase tracking-widest mb-1";

export default function PlansEditor() {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price_id: "",
    price: "",
    description: "",
    features: [],
    highlighted: false,
    order: 0
  });
  const [featureInput, setFeatureInput] = useState("");

  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: () => base44.entities.Plan.list('order')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Plan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Plan.update(editingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Plan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] })
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price_id: "",
      price: "",
      description: "",
      features: [],
      highlighted: false,
      order: 0
    });
    setFeatureInput("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput("");
    }
  };

  const removeFeature = (idx) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Planes de Suscripción</h3>
          <p className="text-xs text-white/30 mt-1">Edita los planes y sus Price IDs de Stripe</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border transition-all ${
              plan.highlighted
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-white/10 bg-white/[0.02]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-white">{plan.name}</h4>
                {plan.highlighted && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                    DESTACADO
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(plan.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-white/40">Price ID:</span>
                <p className="text-white/80 font-mono text-xs break-all">{plan.price_id}</p>
              </div>
              <div>
                <span className="text-xs text-white/40">Precio:</span>
                <p className="text-white/80">{plan.price}</p>
              </div>
              {plan.features && plan.features.length > 0 && (
                <div>
                  <span className="text-xs text-white/40">Características: {plan.features.length}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-[#111113] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#111113]">
                <h3 className="text-lg font-bold text-white">
                  {editingId ? "Editar Plan" : "Nuevo Plan"}
                </h3>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-white/10">
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className={labelCls}>Nombre del Plan</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Explorador"
                  />
                </div>

                <div>
                  <label className={labelCls}>Price ID de Stripe</label>
                  <input
                    type="text"
                    required
                    value={formData.price_id}
                    onChange={(e) => setFormData({ ...formData, price_id: e.target.value })}
                    className={inputCls}
                    placeholder="price_1TFJCM2cunznauNixSZVbGIw"
                  />
                  <p className="text-[10px] text-white/30 mt-1">Obtén este ID de tu dashboard de Stripe</p>
                </div>

                <div>
                  <label className={labelCls}>Precio a Mostrar</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Consultar o €49"
                  />
                </div>

                <div>
                  <label className={labelCls}>Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={inputCls}
                    rows="2"
                    placeholder="Descripción corta del plan"
                  />
                </div>

                <div>
                  <label className={labelCls}>Características</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className={inputCls}
                      placeholder="Agregar característica..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="space-y-1.5">
                      {formData.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <span className="text-sm text-white/80">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-white/30 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="highlighted"
                    checked={formData.highlighted}
                    onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="highlighted" className="text-sm text-white/70 cursor-pointer">
                    Plan destacado (Recomendado)
                  </label>
                </div>

                <div>
                  <label className={labelCls}>Orden</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className={inputCls}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "Guardar Cambios" : "Crear Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}