import React from "react";
import { TextInput, ImageUpload } from "@/components/admin/SectionEditor";

export default function ExploracionEditor({ config, onUpdate, isUploading, setIsUploading }) {
  const handleFieldUpdate = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <TextInput
        label="Título"
        value={config?.exploracion_title || "EXPLORACIÓN"}
        onChange={(v) => handleFieldUpdate('exploracion_title', v)}
        placeholder="EXPLORACIÓN"
      />
      
      <TextInput
        label="Subtítulo"
        value={config?.exploracion_subtitle || "con Prod. by Weber"}
        onChange={(v) => handleFieldUpdate('exploracion_subtitle', v)}
        placeholder="con Prod. by Weber"
      />
      
      <TextInput
        label="Descripción completa"
        value={config?.exploracion_description || ""}
        onChange={(v) => handleFieldUpdate('exploracion_description', v)}
        placeholder="Descripción completa de la sección..."
        multiline
      />

      <ImageUpload
        label="Imagen"
        value={config?.exploracion_image_url || ""}
        onChange={(v) => handleFieldUpdate('exploracion_image_url', v)}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />

      <div className="pt-4 border-t border-white/10">
        <label className="text-sm text-gray-400 mb-3 block font-medium">Enlaces de Redirección</label>
        
        <TextInput
          label="URL del Formulario"
          value={config?.exploracion_form_link || ""}
          onChange={(v) => handleFieldUpdate('exploracion_form_link', v)}
          placeholder="https://..."
        />

        <TextInput
          label="URL de Pago (Stripe)"
          value={config?.exploracion_payment_link || ""}
          onChange={(v) => handleFieldUpdate('exploracion_payment_link', v)}
          placeholder="https://buy.stripe.com/..."
        />

        <TextInput
          label="URL de Calendly"
          value={config?.exploracion_calendly_link || ""}
          onChange={(v) => handleFieldUpdate('exploracion_calendly_link', v)}
          placeholder="https://calendly.com/..."
        />
      </div>
    </div>
  );
}