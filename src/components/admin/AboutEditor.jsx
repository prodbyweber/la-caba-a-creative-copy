import React from "react";
import { TextInput } from "@/components/admin/SectionEditor";

export default function AboutEditor({ config, onUpdate }) {
  const handleFieldUpdate = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <TextInput
        label="Párrafo Principal"
        value={config?.about_main_text || 'La Cabaña Creative nace de la convicción de que <span class="text-emerald-400 font-semibold">cada artista merece un espacio donde su visión pueda materializarse sin límites</span>.'}
        onChange={(v) => handleFieldUpdate('about_main_text', v)}
        placeholder="Texto principal (puedes usar HTML con <span class='text-emerald-400'>texto verde</span>)"
        multiline
      />
      
      <TextInput
        label="Párrafo Secundario"
        value={config?.about_secondary_text || 'No somos un estudio tradicional. Somos un refugio creativo donde la autenticidad y la identidad artística se encuentran. <span class="text-white font-medium">Buscamos dirección, claridad y una propuesta única</span>.'}
        onChange={(v) => handleFieldUpdate('about_secondary_text', v)}
        placeholder="Texto secundario (puedes usar HTML con <span class='text-white font-medium'>texto resaltado</span>)"
        multiline
      />

      <div className="pt-4 border-t border-white/10">
        <label className="text-sm text-gray-400 mb-3 block font-medium">Valores Clave (4 tarjetas)</label>
        
        <div className="space-y-3">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <TextInput
              label="Valor 1 - Título"
              value={config?.about_value1_title || "Enfoque Real"}
              onChange={(v) => handleFieldUpdate('about_value1_title', v)}
              placeholder="Título del primer valor"
            />
            <TextInput
              label="Valor 1 - Descripción"
              value={config?.about_value1_desc || "Estrategia sin humo"}
              onChange={(v) => handleFieldUpdate('about_value1_desc', v)}
              placeholder="Descripción corta"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <TextInput
              label="Valor 2 - Título"
              value={config?.about_value2_title || "Pasión"}
              onChange={(v) => handleFieldUpdate('about_value2_title', v)}
              placeholder="Título del segundo valor"
            />
            <TextInput
              label="Valor 2 - Descripción"
              value={config?.about_value2_desc || "Tu proyecto, nuestra misión"}
              onChange={(v) => handleFieldUpdate('about_value2_desc', v)}
              placeholder="Descripción corta"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <TextInput
              label="Valor 3 - Título"
              value={config?.about_value3_title || "Innovación"}
              onChange={(v) => handleFieldUpdate('about_value3_title', v)}
              placeholder="Título del tercer valor"
            />
            <TextInput
              label="Valor 3 - Descripción"
              value={config?.about_value3_desc || "Sonido único"}
              onChange={(v) => handleFieldUpdate('about_value3_desc', v)}
              placeholder="Descripción corta"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <TextInput
              label="Valor 4 - Título"
              value={config?.about_value4_title || "Autenticidad"}
              onChange={(v) => handleFieldUpdate('about_value4_title', v)}
              placeholder="Título del cuarto valor"
            />
            <TextInput
              label="Valor 4 - Descripción"
              value={config?.about_value4_desc || "Tu identidad, amplificada"}
              onChange={(v) => handleFieldUpdate('about_value4_desc', v)}
              placeholder="Descripción corta"
            />
          </div>
        </div>
      </div>
    </div>
  );
}