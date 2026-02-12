import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Copy, Edit2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function FormsEditor() {
  const [editingForm, setEditingForm] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const queryClient = useQueryClient();

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['applicationForms'],
    queryFn: () => base44.entities.ApplicationForm.list()
  });

  const createFormMutation = useMutation({
    mutationFn: (formData) => base44.entities.ApplicationForm.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationForms'] });
      toast({ title: "Formulario creado exitosamente" });
      setShowFormBuilder(false);
      setEditingForm(null);
    }
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ApplicationForm.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationForms'] });
      toast({ title: "Formulario actualizado exitosamente" });
      setEditingForm(null);
    }
  });

  const deleteFormMutation = useMutation({
    mutationFn: (id) => base44.entities.ApplicationForm.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicationForms'] });
      toast({ title: "Formulario eliminado" });
    }
  });

  const duplicateForm = async (form) => {
    const duplicatedForm = {
      ...form,
      name: `${form.name} (Copia)`,
      is_active: false
    };
    delete duplicatedForm.id;
    delete duplicatedForm.created_date;
    delete duplicatedForm.updated_date;
    delete duplicatedForm.created_by;
    
    await createFormMutation.mutateAsync(duplicatedForm);
  };

  const handleSaveForm = async (formData) => {
    if (editingForm?.id) {
      await updateFormMutation.mutateAsync({ id: editingForm.id, data: formData });
    } else {
      await createFormMutation.mutateAsync(formData);
    }
  };

  if (isLoading) {
    return <div className="text-white">Cargando formularios...</div>;
  }

  if (showFormBuilder || editingForm) {
    return (
      <FormBuilder
        form={editingForm}
        onSave={handleSaveForm}
        onCancel={() => {
          setShowFormBuilder(false);
          setEditingForm(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Formularios</h2>
          <p className="text-white/60 text-sm mt-1">Crea y edita formularios personalizados para tus ofertas</p>
        </div>
        <Button
          onClick={() => setShowFormBuilder(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Formulario
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map(form => (
          <Card key={form.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="truncate">{form.name}</span>
                {form.is_active && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                    Activo
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">
                {form.description || "Sin descripción"}
              </p>
              <div className="text-xs text-white/40 mb-4">
                {form.steps?.length || 0} pasos
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingForm(form)}
                  className="flex-1"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateForm(form)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm("¿Eliminar este formulario?")) {
                      deleteFormMutation.mutate(form.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {forms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/40 mb-4">No hay formularios creados</p>
          <Button onClick={() => setShowFormBuilder(true)}>
            Crear primer formulario
          </Button>
        </div>
      )}
    </div>
  );
}

function FormBuilder({ form, onSave, onCancel }) {
  const [formData, setFormData] = useState(form || {
    name: "",
    description: "",
    steps: [],
    is_active: true
  });

  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
      return;
    }
    if (formData.steps.length === 0) {
      toast({ title: "Error", description: "Agrega al menos un paso", variant: "destructive" });
      return;
    }
    onSave(formData);
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        id: prev.steps.length + 1,
        title: "Nuevo Paso",
        subtitle: "",
        icon: "Music",
        fields: []
      }]
    }));
  };

  const updateStep = (index, updatedStep) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? updatedStep : step)
    }));
  };

  const deleteStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const addFieldToStep = (stepIndex) => {
    const step = formData.steps[stepIndex];
    const updatedStep = {
      ...step,
      fields: [...(step.fields || []), {
        name: `field_${Date.now()}`,
        label: "Nueva pregunta",
        type: "text",
        required: false,
        placeholder: ""
      }]
    };
    updateStep(stepIndex, updatedStep);
  };

  const updateField = (stepIndex, fieldIndex, updatedField) => {
    const step = formData.steps[stepIndex];
    const updatedStep = {
      ...step,
      fields: step.fields.map((field, i) => i === fieldIndex ? updatedField : field)
    };
    updateStep(stepIndex, updatedStep);
  };

  const deleteField = (stepIndex, fieldIndex) => {
    const step = formData.steps[stepIndex];
    const updatedStep = {
      ...step,
      fields: step.fields.filter((_, i) => i !== fieldIndex)
    };
    updateStep(stepIndex, updatedStep);
  };

  const loadDefaultForm = () => {
    const defaultSteps = [
      {
        id: 1,
        icon: "Music",
        title: "Información Básica",
        subtitle: "Cuéntanos quién eres",
        fields: [
          { name: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre", required: true },
          { name: "apellido", label: "Apellido", type: "text", placeholder: "Tu apellido", required: true },
          { name: "nombre_artistico", label: "Nombre artístico", type: "text", placeholder: "Tu nombre de artista", required: true },
          { name: "email", label: "Email", type: "email", placeholder: "tu@email.com", required: true },
          { name: "telefono", label: "Teléfono", type: "phone", placeholder: "Número de teléfono", required: true },
          { name: "sexo", label: "Sexo", type: "sex", options: ["Masculino", "Femenino", "Prefiero no decirlo"], required: true },
          { name: "pais_nacimiento", label: "País de nacimiento", type: "country", required: true },
          { name: "pais_residencia", label: "País de residencia actual", type: "country", required: true }
        ]
      },
      {
        id: 2,
        icon: "Sparkles",
        title: "Identidad Artística",
        subtitle: "Define tu esencia musical",
        fields: [
          { 
            name: "generos", 
            label: "¿Qué géneros definen tu sonido?", 
            type: "multi-cards",
            maxSelections: 4,
            options: [
              { value: "urbano", label: "Urbano" },
              { value: "pop", label: "Pop" },
              { value: "rnb", label: "R&B" },
              { value: "trap", label: "Trap" },
              { value: "reggaeton", label: "Reggaeton" },
              { value: "rap", label: "Rap" },
              { value: "indie", label: "Indie" },
              { value: "electronica", label: "Electrónica" },
              { value: "rock", label: "Rock" },
              { value: "otro", label: "Otro" }
            ],
            required: true 
          },
          { 
            name: "emociones", 
            label: "¿Qué emociones transmite tu música?", 
            type: "multi-cards",
            maxSelections: 4,
            options: [
              { value: "energia", label: "Energía" },
              { value: "melancolia", label: "Melancolía" },
              { value: "felicidad", label: "Felicidad" },
              { value: "intensidad", label: "Intensidad" },
              { value: "romance", label: "Romance" },
              { value: "rebeldia", label: "Rebeldía" },
              { value: "nostalgia", label: "Nostalgia" },
              { value: "esperanza", label: "Esperanza" }
            ],
            required: true 
          }
        ]
      },
      {
        id: 3,
        icon: "Globe",
        title: "Presencia Digital",
        subtitle: "Comparte tus redes",
        fields: [
          { name: "spotify", label: "Spotify", type: "text", placeholder: "https://open.spotify.com/artist/...", icon: "spotify", required: false },
          { name: "instagram", label: "Instagram", type: "text", placeholder: "https://instagram.com/...", icon: "instagram", required: false },
          { name: "tiktok", label: "TikTok", type: "text", placeholder: "https://tiktok.com/@...", icon: "tiktok", required: false },
          { name: "youtube", label: "YouTube", type: "text", placeholder: "https://youtube.com/@...", icon: "youtube", required: false },
          { name: "facebook", label: "Facebook", type: "text", placeholder: "https://facebook.com/...", icon: "facebook", required: false }
        ]
      },
      {
        id: 4,
        icon: "Target",
        title: "Experiencia",
        subtitle: "Tu trayectoria musical",
        fields: [
          { 
            name: "experiencia", 
            label: "¿Cuánto tiempo llevas creando música?", 
            type: "timeline",
            options: [
              { value: "nuevo", label: "Menos de 1 año" },
              { value: "intermedio", label: "1-2 años" },
              { value: "avanzado", label: "3-5 años" },
              { value: "profesional", label: "Más de 5 años" }
            ],
            required: true 
          },
          { name: "referencia_sonido", label: "Artista de referencia", type: "text", placeholder: "¿Quién inspira tu sonido?", required: false }
        ]
      },
      {
        id: 5,
        icon: "DollarSign",
        title: "Inversión",
        subtitle: "Compromiso con tu carrera",
        fields: [
          { 
            name: "presupuesto", 
            label: "¿Cuánto estás dispuesto a invertir mensualmente?", 
            type: "pricing",
            options: [
              { value: "1500-2500", label: "1.500 € – 2.500 €", subtitle: "Inicio" },
              { value: "2500-5000", label: "2.500 € – 5.000 €", subtitle: "Crecimiento", featured: true },
              { value: "7500-10000", label: "7.500 € – 10.000 €", subtitle: "Profesional" }
            ],
            required: true 
          }
        ]
      },
      {
        id: 6,
        icon: "Lightbulb",
        title: "Visión",
        subtitle: "Tu objetivo final",
        fields: [
          { 
            name: "objetivo_principal", 
            label: "¿Qué buscas lograr?", 
            type: "objectives",
            options: [
              { value: "marca", label: "Definir mi sonido y marca" },
              { value: "primer_proyecto", label: "Producir mi primer proyecto profesional" },
              { value: "escalar", label: "Escalar mi proyecto actual" },
              { value: "calidad", label: "Mejorar la calidad de mi música" }
            ],
            required: true 
          },
          { name: "vision", label: "¿Dónde te ves en 1 año?", type: "textarea", placeholder: "Cuéntanos tu visión...", required: false }
        ]
      }
    ];

    setFormData({
      ...formData,
      steps: defaultSteps
    });
    toast({ title: "Formulario por defecto cargado" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {form ? "Editar Formulario" : "Nuevo Formulario"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Información General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Nombre del formulario</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Formulario de Aplicación Premium"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-2 block">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción interna del formulario"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <label className="text-sm text-white/60">Formulario activo</label>
            </div>
            {formData.steps.length === 0 && (
              <Button
                size="sm"
                onClick={loadDefaultForm}
                variant="outline"
                className="text-emerald-400 border-emerald-500/30"
              >
                Cargar formulario por defecto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Pasos del Formulario</h3>
          <Button onClick={addStep} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Paso
          </Button>
        </div>

        {formData.steps.map((step, stepIndex) => (
          <Card key={stepIndex} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Paso {stepIndex + 1}: {step.title}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingStepIndex(editingStepIndex === stepIndex ? null : stepIndex)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteStep(stepIndex)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            {editingStepIndex === stepIndex && (
              <CardContent className="space-y-4">
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(stepIndex, { ...step, title: e.target.value })}
                  placeholder="Título del paso"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Input
                  value={step.subtitle}
                  onChange={(e) => updateStep(stepIndex, { ...step, subtitle: e.target.value })}
                  placeholder="Subtítulo"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                
                {/* Fields List */}
                <div className="pt-4 border-t border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white/60 font-medium">Campos del paso</label>
                    <Button
                      size="sm"
                      onClick={() => addFieldToStep(stepIndex)}
                      variant="outline"
                      className="h-8"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Campo
                    </Button>
                  </div>
                  
                  {(step.fields || []).map((field, fieldIndex) => (
                    <div key={fieldIndex} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white font-medium">{field.label || "Campo sin nombre"}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingFieldIndex(editingFieldIndex === fieldIndex ? null : fieldIndex)}
                            className="h-7 px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteField(stepIndex, fieldIndex)}
                            className="h-7 px-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {editingFieldIndex === fieldIndex && (
                        <div className="space-y-2 pt-2 border-t border-zinc-700">
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { ...field, name: e.target.value })}
                            placeholder="Nombre del campo (interno)"
                            className="bg-zinc-900 border-zinc-600 text-white text-sm h-8"
                          />
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { ...field, label: e.target.value })}
                            placeholder="Etiqueta visible"
                            className="bg-zinc-900 border-zinc-600 text-white text-sm h-8"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { ...field, type: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-600 rounded text-white text-sm h-8 px-2"
                          >
                            <option value="text">Texto</option>
                            <option value="email">Email</option>
                            <option value="phone">Teléfono</option>
                            <option value="textarea">Área de texto</option>
                            <option value="country">Selector de país</option>
                            <option value="sex">Sexo</option>
                            <option value="multi-cards">Tarjetas múltiples</option>
                            <option value="timeline">Timeline</option>
                            <option value="pricing">Precios</option>
                            <option value="objectives">Objetivos</option>
                          </select>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(stepIndex, fieldIndex, { ...field, placeholder: e.target.value })}
                            placeholder="Placeholder"
                            className="bg-zinc-900 border-zinc-600 text-white text-sm h-8"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(stepIndex, fieldIndex, { ...field, required: e.target.checked })}
                              className="w-3 h-3"
                            />
                            <label className="text-xs text-white/60">Campo requerido</label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}