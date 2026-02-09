import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SectionEditor, TextInput, ImageUpload, ArrayEditor } from "@/components/admin/SectionEditor";
import HowItWorksEditor from "@/components/admin/HowItWorksEditor";
import OffersEditor from "@/components/admin/OffersEditor";
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
  const [isUploading, setIsUploading] = useState(false);

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
        brand_logos: [
          "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
          "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop",
          "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop",
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
          "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=100&fit=crop"
        ],
        services_title: "Formas de trabajar contigo",
        services_subtitle: "Servicios diseñados para artistas que buscan profesionalismo y resultados reales.",
        services: [],
        offers: [
          {
            id: 1,
            tag: "Gratis",
            title: "Empieza aquí",
            price: null,
            description: "Contenido educativo grabado para artistas que quieren entender la industria, la marca personal y el poder del sonido.",
            cta: "Acceder",
            color: "emerald",
            featured: false,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 2,
            title: "Marca Artística",
            price: "27,99 €",
            description: "Curso grabado paso a paso para definir tu identidad como artista, tu sonido, tu narrativa visual y producir música competitiva.",
            cta: "Ver curso",
            color: "purple",
            featured: false,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 3,
            title: "Plan de Acción Artístico",
            price: "99,99 €",
            description: "Videollamada estratégica para diagnosticar tu proyecto y salir con un plan claro de qué hacer y en qué orden.",
            cta: "Reservar sesión",
            color: "blue",
            featured: false,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 4,
            title: "Creación + Dirección",
            price: "750 €",
            description: "Programa híbrido donde creamos música contigo, te damos dirección creativa y construimos tu marca mientras produces.",
            highlights: ["10 horas de creación", "1 mix & master", "1 revisión de contenido"],
            cta: "Aplicar",
            color: "orange",
            featured: true,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 5,
            tag: "Solo Madrid · Cupos limitados",
            title: "Artista Pro – Madrid",
            price: "1.200 €",
            description: "Dirección creativa y producción total presencial en Madrid. Marca, música, contenido y estrategia para posicionarte a nivel profesional.",
            cta: "Aplicar",
            color: "red",
            featured: true,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 6,
            title: "Producción Técnica",
            price: null,
            description: "Mix, master y Dolby Atmos para artistas que ya han pasado por nuestros procesos creativos.",
            technical: ["Mix + Master 170 €", "Mix 120 €", "Dolby Atmos desde 450 €"],
            cta: "Ver condiciones",
            color: "zinc",
            featured: false,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          },
          {
            id: 7,
            title: "Workshops Grabados",
            price: null,
            description: "Formación especializada bajo demanda sobre marca artística, frecuencias, producción, contenido y carrera musical.",
            cta: "Ver workshops",
            color: "teal",
            featured: false,
            trailer_url: "",
            full_description: "",
            for_who: "",
            what_you_gain: [],
            key_content: []
          }
        ],
        features_title: "Digitalizamos artistas.",
        features_subtitle: "Imagen, identidad y narrativa para destacar en un entorno saturado.",
        features: [],
        how_it_works_title: "Formas de trabajar conmigo",
        how_it_works_subtitle: "Trabajamos por horas, no por canciones sueltas. Proceso claro, profesional y sostenible.",
        how_it_works_steps: [
          {
            title: "Producción musical por horas",
            description: "Trabajamos el tiempo que el proyecto necesita. Sin atajos ni fórmulas. Proceso claro y profesional.",
            price: "Desde €50/hora",
            gradient: "from-emerald-500 to-emerald-600"
          },
          {
            title: "Dirección creativa real",
            description: "No hacemos canciones sueltas. Construimos identidad, narrativa y coherencia visual para tu proyecto.",
            price: "Desde €300/mes",
            gradient: "from-purple-500 to-purple-600"
          },
          {
            title: "Flujo ordenado",
            description: "Sin improvisación. Enfoque en progreso constante, no en promesas vacías. Estructura que funciona.",
            price: "Consultoría personalizada",
            gradient: "from-orange-500 to-orange-600"
          }
        ],
        serious_artists_title: "Esto no es para todo el mundo.",
        serious_artists_subtitle: "La Cabaña Creative es para artistas que:",
        serious_artists_points: [],
        serious_artists_footer: "Si buscas algo rápido y barato, este no es tu sitio.",
        membership_title: "Trabajamos por membresía.",
        membership_subtitle: "No cobramos por canción. Trabajamos por tiempo, foco y proceso creativo. Así protegemos la calidad del proyecto y del trabajo.",
        membership_plans: [],
        final_cta_title: "Construye tu proyecto con estructura",
        final_cta_subtitle: "Menos caos. Más claridad. Más avance real.",
        final_cta_button: "Aplicar ahora",
        sections_order: ["hero", "features", "howItWorks", "forSeriousArtists", "platformPreview", "membershipPlans", "finalCTA"],
        sections_enabled: {
          hero: true,
          features: true,
          howItWorks: true,
          forSeriousArtists: true,
          platformPreview: true,
          membershipPlans: true,
          finalCTA: true
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
    },
    onError: (error) => {
      console.error('Error updating config:', error);
    }
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(config.sections_order);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateMutation.mutate({ sections_order: items });
  };

  const updateField = (field, value) => {
    console.log('Updating field:', field, 'with value:', value);
    updateMutation.mutate({ [field]: value });
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
    howItWorks: "Servicios / Cómo Trabajamos",
    forSeriousArtists: "Para Artistas Serios",
    platformPreview: "Preview de Plataforma",
    membershipPlans: "Planes de Membresía",
    finalCTA: "CTA Final"
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
          <div className="bg-[#111113] rounded-2xl border border-white/10 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 sticky top-0 bg-[#111113] pb-4 z-10">
              <Settings className="w-5 h-5 text-emerald-400" />
              Editar Contenido de la Landing
            </h2>

            {/* Offers Section Editor */}
            <SectionEditor title="💎 Formas de Ayudarte" defaultOpen={true}>
              <OffersEditor 
                offers={config.offers || []}
                onUpdate={(offers) => updateField('offers', offers)}
              />
            </SectionEditor>

            {/* Hero Section Editor */}
            <SectionEditor title="🎬 Hero Principal">
              <TextInput
                label="Título"
                value={config.hero_title}
                onChange={(v) => updateField('hero_title', v)}
                placeholder="El estudio creativo definitivo..."
                multiline
              />
              <TextInput
                label="Subtítulo"
                value={config.hero_subtitle}
                onChange={(v) => updateField('hero_subtitle', v)}
                placeholder="Producción por horas..."
                multiline
              />
              <TextInput
                label="Texto del Botón CTA"
                value={config.hero_cta_text}
                onChange={(v) => updateField('hero_cta_text', v)}
                placeholder="Aplicar a La Cabaña Creative"
              />
              <ImageUpload
                label="Imagen del Hero"
                value={config.hero_image_url}
                onChange={(v) => updateField('hero_image_url', v)}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </SectionEditor>

            {/* Brands Logos Section Editor */}
            <SectionEditor title="🏢 Logos de Marcas Colaboradoras">
              <div className="space-y-3">
                {(config.brand_logos || []).map((logo, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <img src={logo} alt={`Brand ${index + 1}`} className="w-20 h-12 object-contain bg-white rounded p-2" />
                    <input
                      type="text"
                      value={logo}
                      onChange={(e) => {
                        const newLogos = [...config.brand_logos];
                        newLogos[index] = e.target.value;
                        updateField('brand_logos', newLogos);
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="URL de la imagen del logo"
                    />
                    <button
                      onClick={() => {
                        const newLogos = config.brand_logos.filter((_, i) => i !== index);
                        updateField('brand_logos', newLogos);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/20 text-white cursor-pointer transition-all">
                  <input
                    type="file"
                    accept="image/png,image/jpg,image/jpeg"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      setIsUploading(true);
                      try {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        const newLogos = [...(config.brand_logos || []), file_url];
                        updateField('brand_logos', newLogos);
                      } catch (error) {
                        console.error('Error uploading logo:', error);
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{isUploading ? 'Subiendo...' : 'Subir nuevo logo'}</span>
                </label>
              </div>
            </SectionEditor>

            {/* Features Section Editor */}
            <SectionEditor title="✨ Características">
              <TextInput
                label="Título"
                value={config.features_title}
                onChange={(v) => updateField('features_title', v)}
                placeholder="Digitalizamos artistas."
              />
              <TextInput
                label="Subtítulo"
                value={config.features_subtitle}
                onChange={(v) => updateField('features_subtitle', v)}
                placeholder="Imagen, identidad y narrativa..."
                multiline
              />
            </SectionEditor>

            {/* How It Works Section Editor */}
            <SectionEditor title="🔄 Cómo Trabajamos">
              <TextInput
                label="Título"
                value={config.how_it_works_title}
                onChange={(v) => updateField('how_it_works_title', v)}
                placeholder="Formas de trabajar conmigo"
              />
              <TextInput
                label="Subtítulo"
                value={config.how_it_works_subtitle}
                onChange={(v) => updateField('how_it_works_subtitle', v)}
                placeholder="Trabajamos por horas..."
                multiline
              />
              <div className="pt-4 border-t border-white/10 mt-4">
                <label className="text-sm text-gray-400 mb-3 block font-medium">Tarjetas de Servicios</label>
                <HowItWorksEditor 
                  config={config}
                  onUpdate={(steps) => updateField('how_it_works_steps', steps)}
                />
              </div>
            </SectionEditor>

            {/* Serious Artists Section Editor */}
            <SectionEditor title="🎯 Para Artistas Serios">
              <TextInput
                label="Título Principal"
                value={config.serious_artists_title}
                onChange={(v) => updateField('serious_artists_title', v)}
                placeholder="Esto no es para todo el mundo."
              />
              <TextInput
                label="Subtítulo"
                value={config.serious_artists_subtitle}
                onChange={(v) => updateField('serious_artists_subtitle', v)}
                placeholder="La Cabaña Creative es para artistas que:"
              />
              <ArrayEditor
                label="Puntos Clave"
                items={config.serious_artists_points || []}
                onChange={(v) => updateField('serious_artists_points', v)}
                itemLabel="punto"
                placeholder="Ej: Invierten en su proyecto"
              />
              <TextInput
                label="Texto Final"
                value={config.serious_artists_footer}
                onChange={(v) => updateField('serious_artists_footer', v)}
                placeholder="Si buscas algo rápido y barato..."
              />
            </SectionEditor>

            {/* Membership Plans Section Editor */}
            <SectionEditor title="💳 Planes de Membresía">
              <TextInput
                label="Título"
                value={config.membership_title}
                onChange={(v) => updateField('membership_title', v)}
                placeholder="Trabajamos por membresía."
              />
              <TextInput
                label="Subtítulo"
                value={config.membership_subtitle}
                onChange={(v) => updateField('membership_subtitle', v)}
                placeholder="No cobramos por canción..."
                multiline
              />
            </SectionEditor>

            {/* Final CTA Section Editor */}
            <SectionEditor title="🚀 CTA Final">
              <TextInput
                label="Título"
                value={config.final_cta_title}
                onChange={(v) => updateField('final_cta_title', v)}
                placeholder="Construye tu proyecto con estructura"
              />
              <TextInput
                label="Subtítulo"
                value={config.final_cta_subtitle}
                onChange={(v) => updateField('final_cta_subtitle', v)}
                placeholder="Menos caos. Más claridad..."
                multiline
              />
              <TextInput
                label="Texto del Botón"
                value={config.final_cta_button}
                onChange={(v) => updateField('final_cta_button', v)}
                placeholder="Aplicar ahora"
              />
            </SectionEditor>

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