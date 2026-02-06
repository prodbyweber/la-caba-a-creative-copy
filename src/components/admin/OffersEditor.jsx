import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GripVertical, X, Upload, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function OffersEditor({ offers = [], onUpdate }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const defaultOffer = {
    id: Date.now(),
    tag: "",
    title: "",
    price: "",
    description: "",
    cta: "Ver más",
    color: "emerald",
    featured: false,
    highlights: [],
    technical: [],
    trailer_url: "",
    full_description: "",
    for_who: "",
    what_you_gain: [],
    key_content: [],
    image_url: "",
    title_font_size: "text-2xl",
    title_font_weight: "font-bold",
    description_font_size: "text-base",
    price_font_size: "text-4xl"
  };

  const handleAdd = () => {
    setShowAddModal(true);
    setEditingIndex(-1);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setShowAddModal(true);
  };

  const handleDelete = (index) => {
    const newOffers = offers.filter((_, i) => i !== index);
    onUpdate(newOffers);
  };

  const handleSave = (offerData) => {
    let newOffers;
    if (editingIndex === -1) {
      newOffers = [...offers, offerData];
    } else {
      newOffers = offers.map((offer, i) => i === editingIndex ? offerData : offer);
    }
    onUpdate(newOffers);
    setShowAddModal(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Offers List */}
      <div className="space-y-3">
        {offers.map((offer, index) => (
          <div
            key={offer.id || index}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-white truncate">{offer.title}</h4>
                  {offer.featured && (
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Destacado
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{offer.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  {offer.price && (
                    <span className="text-sm font-semibold text-white">{offer.price}</span>
                  )}
                  {offer.tag && (
                    <span className="text-xs text-gray-500">{offer.tag}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(index)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Añadir oferta
      </button>

      {/* Add/Edit Modal */}
      <OfferModal
        isOpen={showAddModal}
        offer={editingIndex !== null && editingIndex >= 0 ? offers[editingIndex] : defaultOffer}
        onSave={handleSave}
        onClose={() => {
          setShowAddModal(false);
          setEditingIndex(null);
        }}
      />
    </div>
  );
}

function OfferModal({ isOpen, offer, onSave, onClose }) {
  const [formData, setFormData] = useState(offer);
  const [uploadingImage, setUploadingImage] = useState(false);

  React.useEffect(() => {
    setFormData(offer);
  }, [offer]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateArrayField = (field, value) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData({ ...formData, [field]: items });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
    } catch (error) {
      alert('Error al subir la imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#111113] rounded-2xl border border-white/10 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {formData.id === offer.id && offer.title ? 'Editar Oferta' : 'Nueva Oferta'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Precio</label>
                <input
                  type="text"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ej: 27,99 €"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tag</label>
                <input
                  type="text"
                  value={formData.tag || ''}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="Ej: Gratis"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Descripción corta *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Texto del botón</label>
              <input
                type="text"
                value={formData.cta}
                onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                Destacar oferta
              </label>
            </div>
          </div>

          {/* Extended Info */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Información detallada (Panel)</h4>

            <div>
              <label className="block text-sm text-gray-400 mb-2">URL del Trailer (YouTube/Vimeo embed)</label>
              <input
                type="text"
                value={formData.trailer_url || ''}
                onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Usa el formato embed: youtube.com/embed/VIDEO_ID o player.vimeo.com/video/VIDEO_ID
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Descripción completa</label>
              <textarea
                value={formData.full_description || ''}
                onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">¿Para quién es?</label>
              <textarea
                value={formData.for_who || ''}
                onChange={(e) => setFormData({ ...formData, for_who: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Qué ganarás (uno por línea)</label>
              <textarea
                value={(formData.what_you_gain || []).join('\n')}
                onChange={(e) => updateArrayField('what_you_gain', e.target.value)}
                rows={5}
                placeholder="Ejemplo:&#10;Claridad sobre tu identidad artística&#10;Dirección creativa profesional&#10;Música competitiva"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contenido clave (uno por línea)</label>
              <textarea
                value={(formData.key_content || []).join('\n')}
                onChange={(e) => updateArrayField('key_content', e.target.value)}
                rows={5}
                placeholder="Ejemplo:&#10;El mapa del artista&#10;Guía y Explorador&#10;Dirección y producción creativa"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Highlights - Incluye (uno por línea)</label>
              <textarea
                value={(formData.highlights || []).join('\n')}
                onChange={(e) => updateArrayField('highlights', e.target.value)}
                rows={3}
                placeholder="Ejemplo:&#10;10 horas de creación&#10;1 mix & master&#10;1 revisión de contenido"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Detalles técnicos (uno por línea)</label>
              <textarea
                value={(formData.technical || []).join('\n')}
                onChange={(e) => updateArrayField('technical', e.target.value)}
                rows={3}
                placeholder="Ejemplo:&#10;Mix + Master 170 €&#10;Mix 120 €&#10;Dolby Atmos desde 450 €"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Color de la tarjeta</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="emerald">Esmeralda</option>
                <option value="purple">Morado</option>
                <option value="blue">Azul</option>
                <option value="orange">Naranja</option>
                <option value="red">Rojo</option>
                <option value="zinc">Gris</option>
                <option value="teal">Turquesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Imagen de la tarjeta</label>
              
              {/* Image Preview */}
              {formData.image_url && (
                <div className="mb-3 relative rounded-xl overflow-hidden border border-white/10">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 rounded-lg text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition-colors">
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-sm text-gray-400">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Subir desde mis archivos</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {/* URL Input */}
              <div className="mt-2">
                <input
                  type="text"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="O pega una URL de imagen"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          </div>

          {/* Typography Styles */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-lg font-semibold text-white mb-4">Estilos tipográficos</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tamaño título</label>
                <select
                  value={formData.title_font_size || 'text-2xl'}
                  onChange={(e) => setFormData({ ...formData, title_font_size: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="text-xl">Pequeño (XL)</option>
                  <option value="text-2xl">Mediano (2XL)</option>
                  <option value="text-3xl">Grande (3XL)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Peso título</label>
                <select
                  value={formData.title_font_weight || 'font-bold'}
                  onChange={(e) => setFormData({ ...formData, title_font_weight: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="font-normal">Normal</option>
                  <option value="font-semibold">Semi Bold</option>
                  <option value="font-bold">Bold</option>
                  <option value="font-black">Black</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tamaño descripción</label>
                <select
                  value={formData.description_font_size || 'text-base'}
                  onChange={(e) => setFormData({ ...formData, description_font_size: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="text-xs">Muy pequeño</option>
                  <option value="text-sm">Pequeño</option>
                  <option value="text-base">Normal</option>
                  <option value="text-lg">Grande</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Tamaño precio</label>
                <select
                  value={formData.price_font_size || 'text-4xl'}
                  onChange={(e) => setFormData({ ...formData, price_font_size: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="text-2xl">Pequeño (2XL)</option>
                  <option value="text-3xl">Mediano (3XL)</option>
                  <option value="text-4xl">Grande (4XL)</option>
                  <option value="text-5xl">Muy grande (5XL)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-black font-medium transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}