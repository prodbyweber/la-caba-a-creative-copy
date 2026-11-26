import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MediaField from "@/components/fullaccess/admin/MediaField";

/** Lista editable con orden por arrastre, subida de archivos y visibilidad. */
export default function SortablePanel({ title, description, entity, fields, defaults = {}, preview }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const list = await base44.entities[entity].list("order");
    setItems(list || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [entity]);

  const change = (id, key, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const save = async (item) => {
    setBusyId(item.id);
    const payload = {};
    fields.forEach((field) => {
      payload[field.key] = item[field.key];
    });
    await base44.entities[entity].update(item.id, payload);
    setBusyId(null);
  };

  const add = async () => {
    const created = await base44.entities[entity].create({ ...defaults, order: items.length });
    setItems((prev) => [...prev, created]);
  };

  const remove = async (id) => {
    await base44.entities[entity].delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = Array.from(items);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    const ordered = next.map((item, index) => ({ ...item, order: index }));
    setItems(ordered);
    await base44.entities[entity].bulkUpdate(ordered.map((item) => ({ id: item.id, order: item.order })));
  };

  const renderField = (item, field) => {
    if (field.type === "media") {
      return (
        <MediaField
          value={item[field.key]}
          onChange={(next) => change(item.id, field.key, next)}
          accept={field.accept}
          hint={field.hint}
        />
      );
    }
    if (field.type === "bool") {
      return (
        <input
          type="checkbox"
          checked={item[field.key] !== false}
          onChange={(event) => change(item.id, field.key, event.target.checked)}
          className="mt-1 h-4 w-4 accent-[#ff5833]"
        />
      );
    }
    if (field.type === "textarea") {
      return (
        <textarea
          rows={3}
          value={item[field.key] ?? ""}
          onChange={(event) => change(item.id, field.key, event.target.value)}
          className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
        />
      );
    }
    return (
      <input
        type={field.type === "number" ? "number" : "text"}
        value={item[field.key] ?? ""}
        onChange={(event) =>
          change(
            item.id,
            field.key,
            field.type === "number" ? Number(event.target.value) : event.target.value
          )
        }
        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#ff5833]"
      />
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description ? <p className="mt-1 text-xs text-zinc-500">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-md bg-[#ff5833] px-3 py-2 text-xs font-semibold text-white"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      {typeof preview === "function" && !loading ? preview(items) : null}

      {loading ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 size={14} className="animate-spin" /> Cargando...
        </p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`${entity}-list`}>
            {(provided) => (
              <div className="mt-5 space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className="rounded-lg border border-white/10 bg-[#111112] p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            {...drag.dragHandleProps}
                            className="cursor-grab text-zinc-500 hover:text-white"
                            aria-label="Reordenar"
                          >
                            <GripVertical size={15} />
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                            {index + 1}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {fields.map((field) => (
                            <label key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                {field.label}
                              </span>
                              {renderField(item, field)}
                            </label>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => save(item)}
                            disabled={busyId === item.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#ff5833] px-3 py-2 text-xs font-semibold text-white"
                          >
                            {busyId === item.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Save size={13} />
                            )}
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-400 hover:border-red-500/50 hover:text-red-400"
                          >
                            <Trash2 size={13} /> Eliminar
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
      )}
    </div>
  );
}