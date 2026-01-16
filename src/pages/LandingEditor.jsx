import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Eye, 
  GripVertical, 
  Upload, 
  Save, 
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Settings
} from "lucide-react";

export default function LandingEditor() {
  const [previewMode, setPreviewMode] = useState("desktop");
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      if (configs.length > 0) return configs[0];
      
      // Create default config
      const defaultConfig = {
        hero_title: "El estudio creativo definitivo para artistas que buscan conectar",
        hero_subtitle: "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.",
        hero_image_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=1000&fit=crop&q=80",
        hero_cta_text: "Aplicar a La Cabaña Creative",
        sections_order: ["hero", "features", "services", "howItWorks", "plans", "stats"],
        sections_enabled: {
          hero: true,
          features: true,
          services: true,
          howItWorks: true,
          plans: true,
          stats: true
        }
      };
      const created = await base44.entities.LandingConfig.create(defaultConfig);
      return created;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingConfig.update(config.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingConfig'] });
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(config.sections_order);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateMutation.mutate({ sections_order: items });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      updateMutation.mutate({ hero_image_url: file_url });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const toggleSection = (sectionKey) => {
    updateMutation.mutate({
      sections_enabled: {
        ...config.sections_enabled,
        [sectionKey]: !config.sections_enabled[sectionKey]
      }
    });
  };

  const sectionLabels = {
    hero: "Hero Principal",
    features: "Características",
    services: "Servicios (Carrusel)",
    howItWorks: "Cómo Trabajamos",
    plans: "Planes de Membresía",
    stats: "Estadísticas"
  };

  if (isLoading) {
    return (
      <AdminLayout activePage="Settings">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="Settings">
      <div className="min-h-screen bg-[#0a0a0b] p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Editor de Landing Page</h1>
              <p className="text-gray-500">Personaliza y organiza las secciones de tu página principal</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-medium flex items-center gap-2 transition-colors"
              >
                <Eye className="w-5 h-5" />
                {showPreview ? 'Cerrar Preview' : 'Preview'}
              </button>
              
              <button
                onClick={() => updateMutation.mutate(config)}
                disabled={updateMutation.isPending}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium flex items-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 w-fit">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                previewMode === "desktop" 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                previewMode === "mobile" 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Sections Editor */}
          <div className="bg-[#111113] rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Secciones de la Landing
            </h2>

            {/* Hero Section Editor */}
            <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Hero Principal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Título</label>
                  <textarea
                    value={config.hero_title}
                    onChange={(e) => updateMutation.mutate({ hero_title: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Subtítulo</label>
                  <textarea
                    value={config.hero_subtitle}
                    onChange={(e) => updateMutation.mutate({ hero_subtitle: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Texto del Botón</label>
                  <input
                    type="text"
                    value={config.hero_cta_text}
                    onChange={(e) => updateMutation.mutate({ hero_cta_text: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Imagen del Artista</label>
                  <div className="flex items-center gap-4">
                    {config.hero_image_url && (
                      <img 
                        src={config.hero_image_url} 
                        alt="Hero" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <label className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white cursor-pointer flex items-center gap-2 transition-colors">
                      <Upload className="w-4 h-4" />
                      Cambiar Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recomendado: Imagen con fondo transparente PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Draggable Sections */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {config.sections_order.map((sectionKey, index) => (
                      <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white/5 rounded-xl border border-white/10 p-4 transition-all ${
                              snapshot.isDragging ? 'shadow-2xl shadow-emerald-500/20 border-emerald-500/50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-5 h-5 text-gray-500 cursor-grab" />
                                </div>
                                <span className="font-medium text-white">
                                  {sectionLabels[sectionKey]}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => toggleSection(sectionKey)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  config.sections_enabled[sectionKey]
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-white/5 text-gray-500'
                                }`}
                              >
                                {config.sections_enabled[sectionKey] ? 'Visible' : 'Oculta'}
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-[#111113] rounded-2xl border border-white/10 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-4">Vista Previa</h2>
            
            <div className={`bg-black rounded-xl overflow-hidden border border-white/10 ${
              previewMode === "mobile" ? 'max-w-[375px] mx-auto' : 'w-full'
            }`}>
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-gray-500">
                <iframe
                  src="/landing?preview=true"
                  className="w-full h-[600px] bg-black"
                  title="Landing Preview"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              La previsualización se actualiza automáticamente al guardar cambios
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}