import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
import StartCreadoresEditor from "@/components/admin/StartCreadoresEditor";
import { Link } from "react-router-dom";
import {
  Eye, GripVertical, Upload, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Monitor, Smartphone, Settings, X, ZoomIn
} from "lucide-react";

export default function LandingEditorInner() {
  const [previewMode, setPreviewMode] = useState("desktop");
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
      const defaultConfig = {
        hero_title: "El estudio creativo definitivo para artistas que buscan conectar",
        hero_subtitle: "Producción por horas, visuales cinematográficos y digitalización artística para proyectos que van en serio.",
        hero_image_url: "",
        hero_cta_text: "Aplicar a La Cabaña Creative",
        brand_logos: [],
        sections_order: ["hero", "features", "howItWorks", "forSeriousArtists", "platformPreview", "membershipPlans", "finalCTA"],
        sections_enabled: { hero: true, features: true, howItWorks: true, forSeriousArtists: true, platformPreview: true, membershipPlans: true, finalCTA: true }
      };
      return await base44.entities.LandingConfig.create(defaultConfig);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.LandingConfig.update(config.id, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ['landingConfig'] });
      const previous = queryClient.getQueryData(['landingConfig']);
      queryClient.setQueryData(['landingConfig'], (old) => old ? { ...old, ...data } : old);
      return { previous };
    },
    onError: (_e, _d, context) => { if (context?.previous) queryClient.setQueryData(['landingConfig'], context.previous); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['landingConfig'] }),
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(config.sections_order);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    updateMutation.mutate({ sections_order: items });
  };

  const updateField = (field, value) => updateMutation.mutate({ [field]: value });

  const toggleSection = (sectionKey) => updateMutation.mutate({
    sections_enabled: { ...config.sections_enabled, [sectionKey]: !config.sections_enabled[sectionKey] }
  });

  const sectionLabels = {
    hero: "Hero Principal", features: "Características", howItWorks: "Servicios / Cómo Trabajamos",
    forSeriousArtists: "Para Artistas Serios", platformPreview: "Preview de Plataforma",
    membershipPlans: "Planes de Membresía", finalCTA: "CTA Final"
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-3 sm:p-4">
      {/* Toolbar */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button onClick={() => setPreviewMode("desktop")}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1 text-xs transition-colors ${previewMode === "desktop" ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Monitor className="w-3.5 h-3.5" /><span className="hidden sm:inline">Desktop</span>
          </button>
          <button onClick={() => setPreviewMode("mobile")}
            className={`px-2.5 py-1.5 rounded-md flex items-center gap-1 text-xs transition-colors ${previewMode === "mobile" ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            <Smartphone className="w-3.5 h-3.5" /><span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white font-medium flex items-center gap-1.5 text-xs">
            <Eye className="w-4 h-4" /><span className="hidden sm:inline">{showPreview ? 'Cerrar' : 'Preview'}</span>
          </button>
          <button onClick={() => updateMutation.mutate(config)} disabled={updateMutation.isPending}
            className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-1.5 text-xs">
            <Save className="w-4 h-4" /><span className="hidden sm:inline">{updateMutation.isPending ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-4">
        {/* Editor panel */}
        <div className="lg:col-span-2 bg-[#111113] rounded-xl border border-white/10 p-4 sm:p-5 max-h-[calc(100vh-220px)] overflow-y-auto">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 sticky top-0 bg-[#111113] pb-3 z-10">
            <Settings className="w-4 h-4 text-emerald-400" /> Editar Contenido de la Landing
          </h2>

          <SectionEditor title="Página /start — Landing de Conversión" defaultOpen={true}><StartPageEditor /></SectionEditor>
          <SectionEditor title="/start — Sección Creadores (carrusel + servicios)" defaultOpen={false}><StartCreadoresEditor /></SectionEditor>

          <SectionEditor title="Popup para Invitados (no registrados)" defaultOpen={false}>
            <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Editar contenido y diseño del popup</p>
                <p className="text-xs text-white/40 mt-0.5">Personaliza el título, subtítulo, botones y colores.</p>
              </div>
              <button onClick={() => setShowGuestPopupEditor(true)}
                className="flex-shrink-0 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap">
                Editar popup →
              </button>
            </div>
          </SectionEditor>

          <SectionEditor title="Planes de Suscripción" defaultOpen={false}><PlansEditor /></SectionEditor>
          <SectionEditor title="Gestión de Formularios" defaultOpen={false}><FormsEditor /></SectionEditor>
          <SectionEditor title="Historias que hemos contado"><StoriesEditor testimonials={config.testimonials || []} onSave={(t) => updateField('testimonials', t)} /></SectionEditor>
          <SectionEditor title="Nuestras Startups"><StartupsEditor /></SectionEditor>
          <SectionEditor title="Acerca de Nosotros"><AboutEditor config={config} onUpdate={(data) => updateMutation.mutate(data)} /></SectionEditor>
          <SectionEditor title="Timeline Biográfico"><TimelineEditor timeline={config.timeline_milestones || []} onUpdate={(t) => updateField('timeline_milestones', t)} /></SectionEditor>
          <SectionEditor title="Exploración con Prod. by Weber"><ExploracionEditor config={config} onUpdate={(data) => updateMutation.mutate(data)} isUploading={isUploading} setIsUploading={setIsUploading} /></SectionEditor>

          <SectionEditor title="Banners de Portada (3 bloques)" defaultOpen={false}>
            <div className="mb-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Editor dedicado de Banners</p>
                <p className="text-xs text-white/40 mt-0.5">Accede al editor completo para subir imágenes y videos.</p>
              </div>
              <Link to="/BannersAdmin" className="flex-shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-sm font-medium transition-colors whitespace-nowrap">
                Abrir editor →
              </Link>
            </div>
            <BannersEditor configId={config.id} config={config} />
          </SectionEditor>

          <SectionEditor title="Hero Principal" defaultOpen={true}>
            <TextInput label="Tagline" value={config.hero_subtitle} onChange={(v) => updateField('hero_subtitle', v)} placeholder="Producción, imagen y narrativa..." multiline />
            <TextInput label="Texto del Botón CTA" value={config.hero_cta_text} onChange={(v) => updateField('hero_cta_text', v)} placeholder="Aplicar..." />
            <ImageUpload label="Imagen de Fondo" value={config.hero_image_url} onChange={(v) => updateField('hero_image_url', v)} isUploading={isUploading} setIsUploading={setIsUploading} />
            <div className="mt-4">
              <label className="text-sm text-gray-400 mb-2 block font-medium">Video del Hero</label>
              {config.hero_video_url && (
                <div className="mb-3 relative rounded-xl overflow-hidden border border-white/10">
                  <video src={config.hero_video_url} className="w-full h-36 object-cover" muted loop autoPlay playsInline />
                  <button onClick={() => updateField('hero_video_url', '')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : 'bg-white/5 hover:bg-white/10'}`}>
                <input type="file" accept="video/mp4,video/webm,video/mov,video/quicktime" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || file.size > 50 * 1024 * 1024) return;
                    setIsUploading(true);
                    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); updateField('hero_video_url', file_url); }
                    finally { setIsUploading(false); }
                  }} />
                <Upload className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white">{isUploading ? 'Subiendo video...' : 'Subir video (máx. 50 MB)'}</span>
              </label>
            </div>
          </SectionEditor>

          {/* Brand Logos */}
          <SectionEditor title="Logos de Marcas Colaboradoras">
            {previewLogoUrl && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setPreviewLogoUrl(null)}>
                <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPreviewLogoUrl(null)} className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
                  <img src={previewLogoUrl} alt="Logo preview" className="max-w-full max-h-48 object-contain" />
                </div>
              </div>
            )}
            <div className="space-y-3">
              {(config.brand_logos || []).map((logo, index) => (
                <div key={index} className="bg-white/5 rounded-xl border border-white/10 p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { const n = config.brand_logos.filter((_, i) => i !== index); updateField('brand_logos', n); }} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                    <button type="button" onClick={() => logo && setPreviewLogoUrl(logo)} className="relative flex-shrink-0 w-16 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden group border border-white/10 hover:border-emerald-500/50 transition-colors">
                      {logo ? <><img src={logo} alt="" className="max-w-full max-h-full object-contain p-1" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"><ZoomIn className="w-4 h-4 text-white" /></div></> : <span className="text-gray-400 text-[10px]">Sin img</span>}
                    </button>
                    <input type="text" value={logo} onChange={(e) => { const n = [...config.brand_logos]; n[index] = e.target.value; updateField('brand_logos', n); }} className="flex-1 min-w-0 px-3 py-2 bg-white/5 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="URL del logo" />
                    <label className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors cursor-pointer flex-shrink-0">
                      <input type="file" accept="image/png,image/jpg,image/jpeg" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          setIsUploading(true);
                          try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); const n = [...config.brand_logos]; n[index] = file_url; updateField('brand_logos', n); }
                          catch (err) { console.error(err); } finally { setIsUploading(false); }
                        }} />
                      <Upload className="w-4 h-4" />
                    </label>
                  </div>
                </div>
              ))}
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-dashed border-white/20 text-white cursor-pointer transition-all">
                <input type="file" accept="image/png,image/jpg,image/jpeg" className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setIsUploading(true);
                    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); updateField('brand_logos', [...(config.brand_logos || []), file_url]); }
                    catch (err) { console.error(err); } finally { setIsUploading(false); }
                  }} />
                <Upload className="w-4 h-4" />
                <span className="text-sm">{isUploading ? 'Subiendo...' : 'Subir nuevo logo'}</span>
              </label>
            </div>
          </SectionEditor>

          <SectionEditor title="Características">
            <TextInput label="Título" value={config.features_title} onChange={(v) => updateField('features_title', v)} placeholder="Digitalizamos artistas." />
            <TextInput label="Subtítulo" value={config.features_subtitle} onChange={(v) => updateField('features_subtitle', v)} multiline />
          </SectionEditor>

          <SectionEditor title="Cómo Trabajamos">
            <TextInput label="Título" value={config.how_it_works_title} onChange={(v) => updateField('how_it_works_title', v)} />
            <TextInput label="Subtítulo" value={config.how_it_works_subtitle} onChange={(v) => updateField('how_it_works_subtitle', v)} multiline />
            <div className="pt-4 border-t border-white/10 mt-4">
              <label className="text-sm text-gray-400 mb-3 block font-medium">Tarjetas de Servicios</label>
              <HowItWorksEditor config={config} onUpdate={(steps) => updateField('how_it_works_steps', steps)} />
            </div>
          </SectionEditor>

          <SectionEditor title="Para Artistas Serios">
            <TextInput label="Título Principal" value={config.serious_artists_title} onChange={(v) => updateField('serious_artists_title', v)} />
            <TextInput label="Subtítulo" value={config.serious_artists_subtitle} onChange={(v) => updateField('serious_artists_subtitle', v)} />
            <ArrayEditor label="Puntos Clave" items={config.serious_artists_points || []} onChange={(v) => updateField('serious_artists_points', v)} itemLabel="punto" placeholder="Ej: Invierten en su proyecto" />
            <TextInput label="Texto Final" value={config.serious_artists_footer} onChange={(v) => updateField('serious_artists_footer', v)} />
          </SectionEditor>

          <SectionEditor title="Planes de Membresía">
            <TextInput label="Título" value={config.membership_title} onChange={(v) => updateField('membership_title', v)} />
            <TextInput label="Subtítulo" value={config.membership_subtitle} onChange={(v) => updateField('membership_subtitle', v)} multiline />
          </SectionEditor>

          <SectionEditor title="CTA Final">
            <TextInput label="Título" value={config.final_cta_title} onChange={(v) => updateField('final_cta_title', v)} />
            <TextInput label="Subtítulo" value={config.final_cta_subtitle} onChange={(v) => updateField('final_cta_subtitle', v)} multiline />
            <TextInput label="Texto del Botón" value={config.final_cta_button} onChange={(v) => updateField('final_cta_button', v)} />
          </SectionEditor>

          <SectionEditor title="Configuración del Menú" defaultOpen={false}>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-white mb-4">Visibilidad de botones del menú:</h3>
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
                    <button onClick={() => { const n = { ...config.menu_buttons }; n[btn.key] = !n[btn.key]; updateField('menu_buttons', n); }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${config.menu_buttons?.[btn.key] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
                      {config.menu_buttons?.[btn.key] ? 'Visible' : 'Oculto'}
                    </button>
                  </div>
                ))}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div>
                      <label className="text-sm font-medium text-orange-300">Bloqueo de Explorar para invitados</label>
                      <p className="text-[11px] text-white/30 mt-0.5">{config.explorar_guest_blocked ? "Popup activo para no registrados" : "Explorar es público"}</p>
                    </div>
                    <button onClick={() => updateField('explorar_guest_blocked', !config.explorar_guest_blocked)}
                      className={`flex-shrink-0 ml-3 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${config.explorar_guest_blocked ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-500'}`}>
                      {config.explorar_guest_blocked ? 'Bloqueado' : 'Público'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <TextInput label="Enlace ADN de Marca" value={config.adn_marca_link || ''} onChange={(v) => updateField('adn_marca_link', v)} placeholder="/ADNdeMarca o URL personalizada" />
              </div>
            </div>
          </SectionEditor>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {(config.sections_order || []).map((sectionKey, index) => (
                    <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}
                          className={`bg-white/5 rounded-xl border border-white/10 p-4 transition-all ${snapshot.isDragging ? 'shadow-2xl border-emerald-500/50' : ''}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps}><GripVertical className="w-5 h-5 text-gray-500 cursor-grab" /></div>
                              <span className="font-medium text-white text-sm">{sectionLabels[sectionKey]}</span>
                            </div>
                            <button onClick={() => toggleSection(sectionKey)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${config.sections_enabled[sectionKey] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500'}`}>
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

        {/* Preview panel */}
        <div className="bg-[#111113] rounded-xl border border-white/10 p-4 sticky top-6 max-h-[calc(100vh-220px)]">
          <h2 className="text-sm font-bold text-white mb-3">Vista Previa</h2>
          <div className={`bg-black rounded-xl overflow-hidden border border-white/10 ${previewMode === "mobile" ? 'max-w-[375px] mx-auto' : 'w-full'}`}>
            <iframe src="/landing?preview=true" className="w-full h-[600px] bg-black" title="Landing Preview" />
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">Se actualiza al guardar cambios</p>
        </div>
      </div>

      <GuestPopupEditor isOpen={showGuestPopupEditor} onClose={() => setShowGuestPopupEditor(false)} />
    </div>
  );
}