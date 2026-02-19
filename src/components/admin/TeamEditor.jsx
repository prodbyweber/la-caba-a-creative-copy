import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Upload, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TeamEditor({ config, onUpdate }) {
  const [teamMembers, setTeamMembers] = useState(config?.team_members || []);
  const [uploadingImage, setUploadingImage] = useState(null);

  const handleAddMember = () => {
    const newMember = {
      id: Date.now(),
      name: "",
      role: "",
      bio: "",
      image_url: "",
      collaborations: ""
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleRemoveMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleUpdateMember = (id, field, value) => {
    setTeamMembers(teamMembers.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleImageUpload = async (memberId, file) => {
    if (!file) return;
    
    setUploadingImage(memberId);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleUpdateMember(memberId, 'image_url', file_url);
      toast.success('Imagen subida exitosamente');
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(teamMembers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setTeamMembers(items);
  };

  const handleSave = async () => {
    try {
      await onUpdate({ team_members: teamMembers });
      toast.success('Equipo actualizado exitosamente');
    } catch (error) {
      toast.error('Error al guardar cambios');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Equipo</h3>
          <p className="text-sm text-gray-400">Gestiona los miembros del equipo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Miembro
          </Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            Guardar Cambios
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="team-members">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              <AnimatePresence>
                {teamMembers.map((member, index) => (
                  <Draggable key={member.id} draggableId={String(member.id)} index={index}>
                    {(provided) => (
                      <motion.div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-zinc-900 border border-white/10 rounded-xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          {/* Drag handle */}
                          <div {...provided.dragHandleProps} className="mt-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </div>

                          {/* Image upload */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-lg bg-zinc-800 border border-white/10 overflow-hidden relative">
                              {member.image_url ? (
                                <img 
                                  src={member.image_url} 
                                  alt={member.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Upload className="w-6 h-6 text-gray-600" />
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(member.id, e.target.files[0])}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploadingImage === member.id}
                              />
                              {uploadingImage === member.id && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Form fields */}
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block">Nombre</label>
                                <Input
                                  value={member.name}
                                  onChange={(e) => handleUpdateMember(member.id, 'name', e.target.value)}
                                  placeholder="Nombre completo"
                                  className="bg-zinc-800 border-white/10"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block">Rol</label>
                                <Input
                                  value={member.role}
                                  onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                                  placeholder="Ej: Fundador & CEO"
                                  className="bg-zinc-800 border-white/10"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Biografía</label>
                              <Input
                                value={member.bio}
                                onChange={(e) => handleUpdateMember(member.id, 'bio', e.target.value)}
                                placeholder="Ej: Nacido en Venezuela, radicado en Madrid"
                                className="bg-zinc-800 border-white/10"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Colaboraciones</label>
                              <Textarea
                                value={member.collaborations}
                                onChange={(e) => handleUpdateMember(member.id, 'collaborations', e.target.value)}
                                placeholder="Ha colaborado con..."
                                className="bg-zinc-800 border-white/10 min-h-[80px]"
                              />
                            </div>
                          </div>

                          {/* Delete button */}
                          <Button
                            onClick={() => handleRemoveMember(member.id)}
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </Draggable>
                ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {teamMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No hay miembros del equipo aún</p>
          <p className="text-sm mt-2">Haz clic en "Agregar Miembro" para comenzar</p>
        </div>
      )}
    </div>
  );
}