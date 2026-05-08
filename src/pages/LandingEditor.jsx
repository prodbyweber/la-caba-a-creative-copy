import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SectionEditor, TextInput, ImageUpload, ArrayEditor } from "@/components/admin/SectionEditor";
import HowItWorksEditor from "@/components/admin/HowItWorksEditor";
import TimelineEditor from "@/components/admin/TimelineEditor";
import StoriesEditor from "@/components/admin/StoriesEditor.jsx";
import StartupsEditor from "@/components/admin/StartupsEditor";
import FormsEditor from "@/components/admin/FormsEditor";
import AboutEditor from "@/components/admin/AboutEditor";
import ExploracionEditor from "@/components/admin/ExploracionEditor";
import PlansEditor from "@/components/admin/PlansEditor";
import BannersEditor from "@/components/admin/BannersEditor";
import GuestPopupEditor from "@/components/admin/GuestPopupEditor";
import StartPageEditor from "@/components/admin/StartPageEditor";
import { Link } from "react-router-dom";
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
  Settings,
  X,
  ZoomIn
} from "lucide-react";

export default function LandingEditor() {
  const [previewMode, setPreviewMode] = useState("desktop");
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewLogoUrl, setPreviewLogoUrl] = useState(null);
  const [showGuestPopupEditor, setShowGuestPopupEditor] = useState(false);

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
    onMutate: async (data) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['landingConfig'] });
      const previous = queryClient.getQueryData(['landingConfig']);
      // Optimistically update the cache so StoriesEditor doesn't reset
      queryClient.setQueryData(['landingConfig'], (old) => old ? { ...old, ...data } : old);
      return { previous };
    },
    onError: (error, _data, context) => {
      if (context?.previous) queryClient.setQueryData(['landingConfig'], context.previous);
      console.error('Error updating config:', error);
    },
    onSuccess: () => {
      // Invalidate so other components (landing page) see fresh data
      queryClient.invalidateQueries({ queryKey: ['landingConfig'] });
    },
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
      <div className="min-h-screen bg-[#0a0a0b] p-3 sm:p-4">
         {/* Header */}
         <div className="max-w-7xl mx-auto mb-4 sm:mb-5">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Editor de Landing</h1>
               <p className="text-xs sm:text-sm text-gray-500">Personaliza tu página principal</p>
             </div>
            
            <div className="flex flex-wrap items-center gap-2">
               <button
                 onClick={() => setShowPreview(!showPreview)}
                 className="px-3 sm:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white font-medium flex items-center gap-1.5 transition-colors text-xs sm:text-sm"
               >
                 <Eye className="w-4 h-4" />
                 <span className="hidden sm:inline">{showPreview ? 'Cerrar' : 'Preview'}</span>
               </button>

               <button
                 onClick={() => updateMutation.mutate(config)}
                 disabled={updateMutation.isPending}
                 className="px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-1.5 transition-colors text-xs sm:text-sm"
               >
                 <Save className="w-4 h-4" />
                 <span className="hidden sm:inline">{updateMutation.isPending ? 'Guardando...' : 'Guardar'}</span>
               </button>
             </div>
          </div>

          {/* Device Toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-xs sm:text-sm ${
                previewMode === "desktop" 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors text-xs sm:text-sm ${
                previewMode === "mobile" 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-4">
          {/* Left Panel - Sections Editor */}
          <div className="lg:col-span-2 bg-[#111113] rounded-xl border border-white/10 p-4 sm:p-5 max-h-[calc(100vh-180px)] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 sticky top-0 bg-[#111113] pb-3 z-10">
              <Settings className="w-5 h-5 text-emerald-400" />
              Editar Contenido de la Landing
            </h2>

            {/* START PAGE EDITOR */}
            <SectionEditor title="🚀 Página /start — Landing de Conversión" defaultOpen={true}>
              <StartPageEditor />
            </SectionEditor>

            {/* Guest Popup Editor */}
            <SectionEditor title="🔓 Popup para Invitados (no registrados)" defaultOpen={false}>
              <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Editar contenido y diseño del popup</p>
                  <p className="text-xs text-white/40 mt-0.5">Personaliza el título, subtítulo, botones y colores que ven los usuarios no registrados.</p>
                </div>
                <button
                  onClick={() => setShowGuestPopupEditor(true)}
                  className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Editar popup →
                </button>
              </div>
            </SectionEditor>

            {/* Plans Management */}
            <SectionEditor title="💰 Planes de Suscripción" defaultOpen={false}>
              <PlansEditor />
            </SectionEditor>

            {/* Forms Management */}
            <SectionEditor title="📋 Gestión de Formularios" defaultOpen={false}>
              <FormsEditor />
            </SectionEditor>

            {/* Testimonials Section Editor */}
            <SectionEditor title="💬 Historias que hemos contado">
              <StoriesEditor
                testimonials={config.testimonials || []}
                onSave={(testimonials) => updateField('testimonials', testimonials)}
              />
            </SectionEditor>

            {/* Startups Section Editor */}
            <SectionEditor title="🚀 Nuestras Startups">
              <StartupsEditor />
            </SectionEditor>

            {/* About Section Editor */}
            <SectionEditor title="📖 Acerca de Nosotros">
              <AboutEditor 
                config={config}
                onUpdate={(data) => updateMutation.mutate(data)}
              />
            </SectionEditor>

            {/* Timeline Section Editor */}
            <SectionEditor title="📅 Timeline Biográfico">
              <TimelineEditor 
                timeline={config.timeline_milestones || []}
                onUpdate={(timeline) => updateField('timeline_milestones', timeline)}
              />
            </SectionEditor>

            {/* Exploración Section Editor */}
            <SectionEditor title="🎯 Exploración con Prod. by Weber">
              <ExploracionEditor 
                config={config}
                onUpdate={(data) => updateMutation.mutate(data)}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </SectionEditor>

            {/* Hero Banners Editor */}
            <SectionEditor title="🖼️ Banners de Portada (3 bloques)" defaultOpen={false}>
              <div className="mb-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Editor dedicado de Banners</p>
                  <p className="text-xs text-white/40 mt-0.5">Accede al editor completo para subir imágenes y videos con guardado directo.</p>
                </div>
                <Link
                  to="/BannersAdmin"
                  className="flex-shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Abrir editor →
                </Link>
              </div>
              <BannersEditor
                configId={config.id}
                config={config}
              />
            </SectionEditor>

            {/* Hero Section Editor */}
            <SectionEditor title="🎬 Hero Principal" defaultOpen={true}>
              <p className="text-xs text-white/40 mb-3">El Hero muestra el título "Cabaña® Creative" con animación al hacer scroll. En desktop el video se ve de fondo; en mobile aparece debajo del texto en formato vertical.</p>
              <TextInput
                label="Tagline (texto inferior izquierda)"
                value={config.hero_subtitle}
                onChange={(v) => updateField('hero_subtitle', v)}
                placeholder="Producción, imagen y narrativa para artistas que van en serio."
                multiline
              />
              <TextInput
                label="Texto del Botón CTA"
                value={config.hero_cta_text}
                onChange={(v) => updateField('hero_cta_text', v)}
                placeholder="Aplicar a La Cabaña Creative"
              />
              <ImageUpload
                label="Imagen de Fondo del Hero (full-screen)"
                value={config.hero_image_url}
                onChange={(v) => updateField('hero_image_url', v)}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />

              {/* Video Upload */}
              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-2 block font-medium">Video del Hero (desktop fondo / mobile vertical)</label>
                {config.hero_video_url && (
                  <div className="mb-3 relative rounded-xl overflow-hidden border border-white/10">
                    <video
                      src={config.hero_video_url}
                      className="w-full h-36 object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                    <button
                      onClick={() => updateField('hero_video_url', '')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : 'bg-white/5 hover:bg-white/10'}`}>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/mov,video/quicktime"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 50 * 1024 * 1024) {
                        alert('El video no puede superar los 50 MB.');
                        return;
                      }
                      setIsUploading(true);
                      try {
                        const { file_url } = await base44.integrations.Core.UploadFile({ file });
                        updateField('hero_video_url', file_url);
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                  />
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-white">{isUploading ? 'Subiendo video...' : 'Subir video (máx. 50 MB)'}</span>
                </label>
                <p className="text-[10px] text-white/30 mt-1.5">Formatos: MP4, WebM, MOV. En desktop aparece como fondo semitransparente. En mobile se muestra verticalmente bajo el título.</p>
              </div>
            </SectionEditor>

            {/* Brands Logos Section Editor */}
            <SectionEditor title="🏢 Logos de Marcas Colaboradoras">
              {/* Modal preview */}
              {previewLogoUrl && (
                <div
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                  onClick={() => setPreviewLogoUrl(null)}
                >
                  <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setPreviewLogoUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img src={previewLogoUrl} alt="Logo preview" className="max-w-full max-h-48 object-contain" />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(config.brand_logos || []).map((logo, index) => (
                  <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-3">
                    {/* Row: delete + thumbnail + url input + upload */}
                    <div className="flex items-center gap-2">
                      {/* Delete — siempre visible a la izquierda */}
                      <button
                        onClick={() => {
                          const newLogos = config.brand_logos.filter((_, i) => i !== index);
                          updateField('brand_logos', newLogos);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors flex-shrink-0"
                        title="Eliminar logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Thumbnail clicable para preview */}
                      <button
                        type="button"
                        onClick={() => logo && setPreviewLogoUrl(logo)}
                        className="relative flex-shrink-0 w-16 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden group border border-white/10 hover:border-emerald-500/50 transition-colors"
                        title="Ver logo"
                      >
                        {logo ? (
                          <>
                            <img src={logo} alt={`Brand ${index + 1}`} className="max-w-full max-h-full object-contain p-1" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 text-[10px]">Sin img</span>
                        )}
                      </button>

                      {/* URL input */}
                      <input
                        type="text"
                        value={logo}
                        onChange={(e) => {
                          const newLogos = [...config.brand_logos];
                          newLogos[index] = e.target.value;
                          updateField('brand_logos', newLogos);
                        }}
                        className="flex-1 min-w-0 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="URL de la imagen del logo"
                      />

                      {/* Upload */}
                      <label className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors cursor-pointer flex-shrink-0" title="Subir imagen">
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
                              const newLogos = [...config.brand_logos];
                              newLogos[index] = file_url;
                              updateField('brand_logos', newLogos);
                            } catch (error) {
                              console.error('Error uploading logo:', error);
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                        />
                        <Upload className="w-4 h-4" />
                      </label>
                    </div>
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

            {/* Menu Buttons Configuration */}
            <SectionEditor title="🔗 Configuración del Menú" defaultOpen={false}>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white mb-4">Visibilidad de botones del menú y funciones:</h3>
                  {[
                    { key: 'quienes_somos', label: 'Quiénes Somos' },
                    { key: 'artistas', label: 'Artistas' },
                    { key: 'adn_marca', label: 'ADN de Marca' },
                    { key: 'exploracion', label: 'Exploración' },
                    { key: 'startups', label: 'Startups' },
                    { key: 'comenzar', label: 'Comenzar' }
                  ].map(btn => (
                    <div key={btn.key} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <label className="text-sm text-gray-300">{btn.label}</label>
                      <button
                        onClick={() => {
                          const newMenuButtons = { ...config.menu_buttons };
                          newMenuButtons[btn.key] = !newMenuButtons[btn.key];
                          updateField('menu_buttons', newMenuButtons);
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          config.menu_buttons?.[btn.key] 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {config.menu_buttons?.[btn.key] ? 'Visible' : 'Oculto'}
                      </button>
                    </div>
                  ))}
                  
                  {/* Analytics Toggle */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <label className="text-sm font-medium text-purple-300">📊 Panel de Análisis (en cuentas de artistas)</label>
                      <button
                        onClick={() => {
                          const newSections = { ...config.sections_enabled };
                          newSections.analytics = newSections.analytics !== false ? false : true;
                          updateField('sections_enabled', newSections);
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          config.sections_enabled?.analytics !== false
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {config.sections_enabled?.analytics !== false ? 'Habilitado' : 'Deshabilitado'}
                      </button>
                    </div>
                    <p className="text-[11px] text-white/30 mt-2 px-2">Controla si los artistas ven el apartado de Análisis en el menú de su panel.</p>
                  </div>

                  {/* Explorar Guest Block Toggle */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <div>
                        <label className="text-sm font-medium text-orange-300">🔒 Bloqueo de Explorar para invitados</label>
                        <p className="text-[11px] text-white/30 mt-0.5">
                          {config.explorar_guest_blocked ? "Usuarios no registrados ven el popup y bloqueo" : "Explorar es público — cualquiera puede ver el contenido"}
                        </p>
                      </div>
                      <button
                        onClick={() => updateField('explorar_guest_blocked', !config.explorar_guest_blocked)}
                        className={`flex-shrink-0 ml-3 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          config.explorar_guest_blocked
                            ? 'bg-orange-500/20 text-orange-400' 
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {config.explorar_guest_blocked ? 'Bloqueado' : 'Público'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <TextInput
                    label="Enlace ADN de Marca"
                    value={config.adn_marca_link || ''}
                    onChange={(v) => updateField('adn_marca_link', v)}
                    placeholder="/ADNdeMarca o URL personalizada"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Este enlace se usa siempre que alguien acceda a ADN de Marca, aunque esté oculto del menú.
                  </p>
                </div>
              </div>
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
          <div className="bg-[#111113] rounded-xl border border-white/10 p-4 sticky top-6 max-h-[calc(100vh-180px)]">
            <h2 className="text-lg font-bold text-white mb-3">Vista Previa</h2>
            
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

        {/* Guest Popup Editor Modal */}
        <GuestPopupEditor isOpen={showGuestPopupEditor} onClose={() => setShowGuestPopupEditor(false)} />
      </div>
    </AdminLayout>
  );
}