import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StartupsEditor() {
  const queryClient = useQueryClient();
  const [editingStartups, setEditingStartups] = useState(null);

  const { data: config } = useQuery({
    queryKey: ['landingConfig'],
    queryFn: async () => {
      const configs = await base44.entities.LandingConfig.list();
      return configs.length > 0 ? configs[0] : null;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (config?.id) {
        return await base44.entities.LandingConfig.update(config.id, data);
      } else {
        return await base44.entities.LandingConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['landingConfig']);
      toast.success('Startups actualizadas');
      setEditingStartups(null);
    },
    onError: (error) => {
      toast.error('Error al actualizar startups: ' + error.message);
    }
  });

  React.useEffect(() => {
    if (config && !editingStartups) {
      setEditingStartups(config.startups || []);
    }
  }, [config]);

  const handleAddStartup = () => {
    const newStartup = {
      id: Date.now(),
      image: "",
      name: "",
      description: "",
      category: "",
      link: ""
    };
    setEditingStartups([...editingStartups, newStartup]);
  };

  const handleUpdateStartup = (index, field, value) => {
    const updated = [...editingStartups];
    updated[index] = { ...updated[index], [field]: value };
    setEditingStartups(updated);
  };

  const handleDeleteStartup = (index) => {
    if (confirm('¿Eliminar esta startup?')) {
      const updated = editingStartups.filter((_, i) => i !== index);
      setEditingStartups(updated);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ startups: editingStartups });
  };

  if (!editingStartups) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Nuestras Startups</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleAddStartup}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Startup
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {editingStartups.map((startup, index) => (
          <Card key={startup.id} className="p-4 bg-zinc-900/50 border-zinc-800">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-zinc-500 mt-2 cursor-move" />
                <div className="flex-1 space-y-3">
                  {/* Image URL */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      URL de Imagen
                    </label>
                    <Input
                      value={startup.image}
                      onChange={(e) => handleUpdateStartup(index, 'image', e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Nombre
                    </label>
                    <Input
                      value={startup.name}
                      onChange={(e) => handleUpdateStartup(index, 'name', e.target.value)}
                      placeholder="Nombre de la startup"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Categoría
                    </label>
                    <Input
                      value={startup.category}
                      onChange={(e) => handleUpdateStartup(index, 'category', e.target.value)}
                      placeholder="Music Tech, Co-working, etc."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Descripción
                    </label>
                    <Textarea
                      value={startup.description}
                      onChange={(e) => handleUpdateStartup(index, 'description', e.target.value)}
                      placeholder="Descripción de la startup..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                      rows={3}
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">
                      Link (opcional)
                    </label>
                    <Input
                      value={startup.link}
                      onChange={(e) => handleUpdateStartup(index, 'link', e.target.value)}
                      placeholder="https://..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>

                  {/* Preview */}
                  {startup.image && (
                    <div className="mt-3">
                      <img 
                        src={startup.image} 
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteStartup(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {editingStartups.length === 0 && (
          <div className="text-center py-8 text-zinc-500">
            No hay startups agregadas. Haz clic en "Agregar Startup" para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}