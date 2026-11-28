import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Check, X, Download } from "lucide-react";
import { Label, SelectField, TextField, ToggleField } from "./Field";
import SectionRow from "./SectionRow";
import { DEFAULT_HOME_SECTIONS } from "@/lib/homeDefaults";

const SECTION_TYPES = [
  { value: "hero", label: "Hero (vídeo + titular animado)" },
  { value: "paises", label: "Países" },
  { value: "marcas", label: "Marcas" },
  { value: "generos", label: "Géneros" },
  { value: "comunidad", label: "Comunidad" },
  { value: "proceso", label: "Cómo funciona" },
  { value: "comenzar", label: "Cómo comenzar" },
  { value: "antes_despues", label: "Antes / Después" },
  { value: "casa", label: "Founder" },
  { value: "cifras", label: "Cifras" },
  { value: "tendencia", label: "Tendencia" },
  { value: "final", label: "Cierre" },
];

const EMPTY = {
  key: "comunidad",
  eyebrow: "",
  title: "",
  subtitle: "",
  body: "",
  cta_label: "",
  cta_link: "",
  cta2_label: "",
  cta2_link: "",
  is_visible: true,
};

export default function SectionsPanel() {
  const [items, setItems] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const list = await base44.entities.LandingSection.list("-created_date", 200);
    setItems(list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const importDefaults = async () => {
    setBusy(true);
    try {
      await base44.entities.LandingSection.bulkCreate(
        DEFAULT_HOME_SECTIONS.map((section, index) => ({ ...section, order: index + 1 }))
      );
      await load();
      flash("Secciones importadas");
    } finally {
      setBusy(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = [...items];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setItems(next);
    await base44.entities.LandingSection.bulkUpdate(
      next.map((item, index) => ({ id: item.id, order: index + 1 }))
    );
    await load();
    flash("Orden guardado");
  };

  const toggle = async (section) => {
    await base44.entities.LandingSection.update(section.id, {
      is_visible: section.is_visible === false,
    });
    await load();
  };

  const duplicate = async (section) => {
    const { id, created_date, updated_date, created_by_id, ...rest } = section;
    await base44.entities.LandingSection.create({
      ...rest,
      title: section.title ? `${section.title} (copia)` : "",
      order: (section.order ?? 0) + 0.5,
    });
    const list = await base44.entities.LandingSection.list("-created_date", 200);
    const ordered = list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await base44.entities.LandingSection.bulkUpdate(
      ordered.map((item, index) => ({ id: item.id, order: index + 1 }))
    );
    await load();
    flash("Sección duplicada");
  };

  const remove = async (section) => {
    if (!window.confirm("¿Eliminar esta sección de la home?")) return;
    await base44.entities.LandingSection.delete(section.id);
    await load();
    flash("Sección eliminada");
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const { id, created_date, updated_date, created_by_id, ...rest } = draft;
      if (id) {
        await base44.entities.LandingSection.update(id, rest);
      } else {
        await base44.entities.LandingSection.create({
          ...rest,
          order: (items?.length || 0) + 1,
        });
      }
      setDraft(null);
      await load();
      flash("Guardado");
    } finally {
      setBusy(false);
    }
  };

  if (!items) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-white/30" />
      </div>
    );
  }

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setNotice("");
            setDraft({ ...EMPTY });
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white hover:bg-[#e04a28]"
        >
          <Plus size={12} /> Añadir sección
        </button>
        {!items.length && (
          <button
            type="button"
            onClick={importDefaults}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/15 text-[11px] font-semibold text-white/70 hover:text-white disabled:opacity-40"
          >
            <Download size={12} /> Traer las secciones actuales
          </button>
        )}
        {notice && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-300">
            <Check size={12} /> {notice}
          </span>
        )}
      </div>

      <p className="text-[11px] text-white/30 mb-4">
        Arrastra para cambiar el orden, oculta o duplica secciones y edita sus textos. Los cambios se
        aplican en la home al guardar.
      </p>

      {draft && (
        <div className="mb-5 rounded-xl border border-[#ff5833]/40 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
              {draft.id ? "Editar sección" : "Nueva sección"}
            </span>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="text-white/40 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Tipo de sección"
              value={draft.key}
              onChange={set("key")}
              options={SECTION_TYPES}
            />
            <TextField label="Etiqueta superior" value={draft.eyebrow} onChange={set("eyebrow")} />
            <div className="sm:col-span-2">
              <TextField label="Título" value={draft.title} onChange={set("title")} />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Subtítulo"
                value={draft.subtitle}
                onChange={set("subtitle")}
                textarea
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Texto de apoyo"
                value={draft.body}
                onChange={set("body")}
                textarea
              />
            </div>
            <TextField label="Botón principal" value={draft.cta_label} onChange={set("cta_label")} />
            <TextField
              label="Destino del botón"
              value={draft.cta_link}
              onChange={set("cta_link")}
              hint="#seccion o /ruta"
            />
            <TextField
              label="Botón secundario"
              value={draft.cta2_label}
              onChange={set("cta2_label")}
            />
            <TextField
              label="Destino secundario"
              value={draft.cta2_link}
              onChange={set("cta2_link")}
            />
            <div className="sm:col-span-2">
              <ToggleField
                label="Visible en la home"
                checked={draft.is_visible !== false}
                onChange={set("is_visible")}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="mt-4 flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff5833] text-[11px] font-bold text-white disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Guardar
          </button>
        </div>
      )}

      {items.length ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="home-sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid gap-2">
                {items.map((section, index) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    index={index}
                    onEdit={(item) => {
                      setNotice("");
                      setDraft({ ...item });
                    }}
                    onDuplicate={duplicate}
                    onToggle={toggle}
                    onRemove={remove}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="text-[12px] text-white/30 py-6 text-center">
          Todavía no hay secciones guardadas: la home usa el contenido por defecto. Pulsa «Traer las
          secciones actuales» para editarlas aquí.
        </p>
      )}
    </div>
  );
}