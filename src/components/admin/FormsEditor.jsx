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
      fields: [...step.fields, {
        name: `field_${Date.now()}`,
        label: "Nueva pregunta",
        type: "text",
        required: false
      }]
    };
    updateStep(stepIndex, updatedStep);
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4"
            />
            <label className="text-sm text-white/60">Formulario activo</label>
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
                <div className="text-sm text-white/40">
                  {step.fields?.length || 0} campos configurados
                </div>
                <Button
                  size="sm"
                  onClick={() => addFieldToStep(stepIndex)}
                  variant="outline"
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Agregar Campo
                </Button>
                <p className="text-xs text-white/40">
                  Nota: La configuración avanzada de campos estará disponible próximamente
                </p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}