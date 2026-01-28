import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { 
  Plus, 
  GitPullRequest, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Send,
  Lock,
  LockOpen,
  Calendar,
  FolderKanban,
  ChevronDown,
  ChevronUp,
  X,
  Link as LinkIcon,
  Edit2,
  Trash2,
  DollarSign
} from "lucide-react";

export default function Revisions() {
  const [viewMode, setViewMode] = useState("projects"); // "projects" | "timeline"
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: revisionBatches = [] } = useQuery({
    queryKey: ['revisionBatches'],
    queryFn: () => base44.entities.RevisionBatch.list('-created_date')
  });

  return (
    <AdminLayout activePage="Revisions">
      <div className="p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sistema de Revisiones</h1>
            <p className="text-gray-400">Gestión profesional de feedback y correcciones</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === "projects" ? "timeline" : "projects")}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium flex items-center gap-2"
            >
              {viewMode === "projects" ? <Calendar className="w-4 h-4" /> : <FolderKanban className="w-4 h-4" />}
              {viewMode === "projects" ? "Vista Timeline" : "Vista Proyectos"}
            </button>
            <button
              onClick={() => setShowCreateBatchModal(true)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Revisión
            </button>
          </div>
        </div>

        {viewMode === "projects" ? (
          <ProjectsView 
            projects={projects}
            artists={artists}
            revisionBatches={revisionBatches}
            onEditBatch={setEditingBatch}
          />
        ) : (
          <TimelineView 
            revisionBatches={revisionBatches}
            projects={projects}
            artists={artists}
          />
        )}
      </div>

      {showCreateBatchModal && (
        <CreateBatchModal
          onClose={() => setShowCreateBatchModal(false)}
          projects={projects}
          revisionBatches={revisionBatches}
        />
      )}

      {editingBatch && (
        <EditBatchModal
          batch={editingBatch}
          onClose={() => setEditingBatch(null)}
          projects={projects}
        />
      )}
    </AdminLayout>
  );
}

// Vista por Proyectos
function ProjectsView({ projects, artists, revisionBatches, onEditBatch }) {
  const [expandedProject, setExpandedProject] = useState(null);

  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const artist = artists.find(a => a.id === project.artist_id);
        const projectBatches = revisionBatches.filter(b => b.project_id === project.id).sort((a, b) => a.batch_number - b.batch_number);
        const includedCount = projectBatches.filter(b => b.is_included).length;
        const extraCount = projectBatches.filter(b => !b.is_included).length;
        const isExpanded = expandedProject === project.id;

        return (
          <motion.div
            key={project.id}
            className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
          >
            <div
              onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      project.status === 'Mixing' ? 'bg-blue-500/10 text-blue-400' :
                      project.status === 'Mastering' ? 'bg-purple-500/10 text-purple-400' :
                      project.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Artista: {artist?.stageName || 'N/A'}</span>
                    {project.start_date && <span>• Inicio: {new Date(project.start_date).toLocaleDateString('es-ES')}</span>}
                    {project.target_delivery_date && <span>• Entrega: {new Date(project.target_delivery_date).toLocaleDateString('es-ES')}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-emerald-400 font-medium text-sm">
                        Revisiones: {includedCount}/2 incluidas
                      </span>
                    </div>
                    {extraCount > 0 && (
                      <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <span className="text-orange-400 font-medium text-sm">
                          {extraCount} extra{extraCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{projectBatches.length} revisiones</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5"
                >
                  <div className="p-6 space-y-3">
                    {projectBatches.map((batch) => (
                      <BatchCard key={batch.id} batch={batch} onEdit={onEditBatch} />
                    ))}
                    {projectBatches.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No hay revisiones para este proyecto
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay proyectos registrados
        </div>
      )}
    </div>
  );
}

// Vista Timeline
function TimelineView({ revisionBatches, projects, artists }) {
  const [dateFilter, setDateFilter] = useState("all"); // "week" | "month" | "all"
  const [statusFilter, setStatusFilter] = useState("all");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filteredBatches = revisionBatches.filter(batch => {
    const batchDate = new Date(batch.created_date);
    
    if (dateFilter === "week" && batchDate < weekAgo) return false;
    if (dateFilter === "month" && batchDate < monthAgo) return false;
    if (statusFilter !== "all" && batch.status !== statusFilter) return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
        >
          <option value="all">Todas las fechas</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
        >
          <option value="all">Todos los estados</option>
          <option value="Sin comenzar">Sin comenzar</option>
          <option value="En proceso">En proceso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />
        
        {filteredBatches.map((batch, i) => {
          const project = projects.find(p => p.id === batch.project_id);
          const artist = artists.find(a => a.id === project?.artist_id);

          return (
            <motion.div
              key={batch.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex gap-4"
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center z-10 ${
                batch.status === 'Finalizado' ? 'bg-emerald-500/20 border-2 border-emerald-500' :
                batch.status === 'En proceso' ? 'bg-blue-500/20 border-2 border-blue-500' :
                'bg-gray-500/20 border-2 border-gray-500'
              }`}>
                <GitPullRequest className={`w-6 h-6 ${
                  batch.status === 'Finalizado' ? 'text-emerald-400' :
                  batch.status === 'En proceso' ? 'text-blue-400' :
                  'text-gray-400'
                }`} />
              </div>

              <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-bold">{project?.title || 'Proyecto eliminado'}</h4>
                    <p className="text-sm text-gray-500">
                      Revisión #{batch.batch_number} {!batch.is_included && '(Extra)'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    batch.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-400' :
                    batch.status === 'En proceso' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {batch.status}
                  </span>
                </div>

                <div className="text-sm text-gray-400 mb-2">
                  {batch.corrections?.length || 0}/10 correcciones
                </div>

                {batch.feedback_sent_at && (
                  <div className="text-xs text-gray-500">
                    Feedback enviado: {new Date(batch.feedback_sent_at).toLocaleString('es-ES')}
                  </div>
                )}

                {batch.delivery_sent_at && batch.delivery_link && (
                  <div className="mt-2">
                    <a
                      href={batch.delivery_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <LinkIcon className="w-3 h-3" />
                      Ver versión entregada
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredBatches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay revisiones que mostrar
          </div>
        )}
      </div>
    </div>
  );
}

// Tarjeta de Revisión (Batch)
function BatchCard({ batch, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const deleteBatch = useMutation({
    mutationFn: (id) => base44.entities.RevisionBatch.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revisionBatches'] })
  });

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {batch.is_locked ? <Lock className="w-5 h-5 text-yellow-400" /> : <LockOpen className="w-5 h-5 text-emerald-400" />}
            <div>
              <h4 className="text-white font-bold">
                Revisión #{batch.batch_number}
                {!batch.is_included && <span className="ml-2 text-orange-400">(Extra)</span>}
              </h4>
              <p className="text-xs text-gray-500">
                {batch.corrections?.length || 0}/10 correcciones
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
              batch.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-400' :
              batch.status === 'En proceso' ? 'bg-blue-500/10 text-blue-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {batch.status}
            </span>
            <button
              onClick={() => onEdit(batch)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteBatch.mutate(batch.id)}
              className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {batch.delivery_link && (
          <a
            href={batch.delivery_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-2"
          >
            <LinkIcon className="w-4 h-4" />
            Link de entrega
          </a>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-2"
            >
              {batch.corrections?.map((correction, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{correction.timecode}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs">
                        {correction.type}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      correction.status === 'Hecho' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {correction.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{correction.description}</p>
                </div>
              ))}
              {(!batch.corrections || batch.corrections.length === 0) && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No hay correcciones registradas
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Modal Crear Revisión
function CreateBatchModal({ onClose, projects, revisionBatches }) {
  const [formData, setFormData] = useState({
    project_id: '',
    batch_number: 1,
    is_included: true,
    status: 'Sin comenzar',
    extra_cost: 0
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RevisionBatch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisionBatches'] });
      onClose();
    }
  });

  const handleProjectChange = (projectId) => {
    const projectBatches = revisionBatches.filter(b => b.project_id === projectId);
    const nextNumber = projectBatches.length + 1;
    const isIncluded = nextNumber <= 2;
    
    setFormData({
      ...formData,
      project_id: projectId,
      batch_number: nextNumber,
      is_included: isIncluded,
      extra_cost: isIncluded ? 0 : 50
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-lg"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Nueva Revisión</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proyecto *</label>
            <select
              value={formData.project_id}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="">Seleccionar proyecto...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>

          {formData.project_id && (
            <>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Revisión #{formData.batch_number}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    formData.is_included ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {formData.is_included ? 'Incluida' : 'Extra'}
                  </span>
                </div>
                {!formData.is_included && (
                  <div className="text-sm text-orange-400">
                    Coste: €{formData.extra_cost}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  {formData.is_included 
                    ? 'Esta revisión está incluida en el proyecto (2 revisiones incluidas)' 
                    : 'Esta es una revisión extra. Las primeras 2 están incluidas.'}
                </div>
              </div>

              {!formData.is_included && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coste Revisión Extra (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.extra_cost}
                    onChange={(e) => setFormData({ ...formData, extra_cost: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear Revisión'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Modal Editar Revisión
function EditBatchModal({ batch, onClose, projects }) {
  const [corrections, setCorrections] = useState(batch.corrections || []);
  const [newCorrection, setNewCorrection] = useState({
    timecode: '',
    type: 'Mix',
    description: '',
    status: 'Pendiente'
  });
  const [deliveryLink, setDeliveryLink] = useState(batch.delivery_link || '');
  const [referenceLink, setReferenceLink] = useState(batch.reference_link || '');
  const [showLockWarning, setShowLockWarning] = useState(false);

  const queryClient = useQueryClient();
  const project = projects.find(p => p.id === batch.project_id);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.RevisionBatch.update(batch.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisionBatches'] });
      onClose();
    }
  });

  const addCorrection = () => {
    if (corrections.length >= 10) {
      alert('Has alcanzado el límite de correcciones para esta revisión (10). Organiza tus cambios o solicita una revisión adicional.');
      return;
    }
    if (batch.is_locked) {
      alert('Esta revisión está bloqueada. No se pueden añadir más correcciones.');
      return;
    }
    if (!newCorrection.timecode || !newCorrection.description) return;

    setCorrections([...corrections, newCorrection]);
    setNewCorrection({ timecode: '', type: 'Mix', description: '', status: 'Pendiente' });
  };

  const removeCorrection = (index) => {
    if (batch.is_locked) {
      alert('Esta revisión está bloqueada. No se pueden eliminar correcciones.');
      return;
    }
    setCorrections(corrections.filter((_, i) => i !== index));
  };

  const toggleCorrectionStatus = (index) => {
    const updated = [...corrections];
    updated[index].status = updated[index].status === 'Pendiente' ? 'Hecho' : 'Pendiente';
    setCorrections(updated);
  };

  const handleSendFeedback = () => {
    if (batch.status === 'En proceso' || batch.status === 'Finalizado') {
      alert('Esta revisión ya ha sido enviada.');
      return;
    }
    setShowLockWarning(true);
  };

  const confirmSendFeedback = () => {
    updateMutation.mutate({
      ...batch,
      corrections,
      reference_link: referenceLink,
      status: 'En proceso',
      is_locked: true,
      feedback_sent_at: new Date().toISOString()
    });
  };

  const handleSendDelivery = () => {
    if (!deliveryLink) {
      alert('Debes adjuntar un link de entrega válido (Drive/Dropbox/etc.)');
      return;
    }
    updateMutation.mutate({
      ...batch,
      corrections,
      delivery_link: deliveryLink,
      delivery_sent_at: new Date().toISOString()
    });
  };

  const handleFinalize = () => {
    updateMutation.mutate({
      ...batch,
      corrections,
      status: 'Finalizado',
      is_locked: true
    });
  };

  const handleSave = () => {
    updateMutation.mutate({
      ...batch,
      corrections,
      delivery_link: deliveryLink,
      reference_link: referenceLink
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] rounded-2xl border border-white/10 w-full max-w-4xl my-8"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {project?.title} - Revisión #{batch.batch_number}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {batch.is_included ? 'Revisión incluida' : `Revisión extra - €${batch.extra_cost || 0}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Estado y Bloqueo */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              batch.is_locked ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              {batch.is_locked ? <Lock className="w-4 h-4 text-yellow-400" /> : <LockOpen className="w-4 h-4 text-emerald-400" />}
              <span className={batch.is_locked ? 'text-yellow-400 text-sm font-medium' : 'text-emerald-400 text-sm font-medium'}>
                {batch.is_locked ? 'Bloqueada - No se pueden añadir correcciones' : 'Abierta - Puedes añadir correcciones'}
              </span>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
              batch.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-400' :
              batch.status === 'En proceso' ? 'bg-blue-500/10 text-blue-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {batch.status}
            </span>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Link de Entrega (Productor) {batch.status === 'En proceso' && '*'}
              </label>
              <input
                type="url"
                value={deliveryLink}
                onChange={(e) => setDeliveryLink(e.target.value)}
                placeholder="https://drive.google.com/... o Dropbox/WeTransfer..."
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pega aquí el link de la versión corregida con permisos habilitados
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Link de Referencia (Artista)</label>
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://... (opcional)"
                className="w-full px-4 py-3 bg-white rounded-xl text-gray-900 border border-white/20 focus:outline-none focus:border-purple-500"
                disabled={batch.is_locked}
              />
              <p className="text-xs text-gray-500 mt-1">
                Referencia adicional si es necesario (opcional)
              </p>
            </div>
          </div>

          {/* Añadir Corrección */}
          {!batch.is_locked && batch.status !== 'Finalizado' && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Añadir Corrección ({corrections.length}/10)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="MM:SS *"
                  value={newCorrection.timecode}
                  onChange={(e) => setNewCorrection({ ...newCorrection, timecode: e.target.value })}
                  pattern="[0-9]{2}:[0-9]{2}"
                  className="px-4 py-2 bg-white rounded-lg text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newCorrection.type}
                  onChange={(e) => setNewCorrection({ ...newCorrection, type: e.target.value })}
                  className="px-4 py-2 bg-white rounded-lg text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Vocal">Vocal</option>
                  <option value="Beat">Beat</option>
                  <option value="Mix">Mix</option>
                  <option value="Master">Master</option>
                  <option value="Arrangement">Arreglo</option>
                  <option value="FX">FX</option>
                  <option value="General">General</option>
                </select>
              </div>
              <textarea
                placeholder="Descripción de la corrección *"
                value={newCorrection.description}
                onChange={(e) => setNewCorrection({ ...newCorrection, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white rounded-lg text-gray-900 border border-white/20 focus:outline-none focus:border-emerald-500 resize-none mb-3"
              />
              <button
                type="button"
                onClick={addCorrection}
                disabled={corrections.length >= 10}
                className="w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {corrections.length >= 10 ? 'Límite alcanzado (10 correcciones)' : 'Añadir Corrección'}
              </button>
            </div>
          )}

          {/* Lista de Correcciones */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {corrections.map((correction, idx) => (
              <div key={idx} className="p-3 bg-white/5 rounded-lg flex items-start justify-between group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-emerald-400 font-bold">{correction.timecode}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs">
                      {correction.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCorrectionStatus(idx)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        correction.status === 'Hecho' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {correction.status}
                    </button>
                  </div>
                  <p className="text-sm text-gray-300">{correction.description}</p>
                </div>
                {!batch.is_locked && (
                  <button
                    type="button"
                    onClick={() => removeCorrection(idx)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            {batch.status === 'Sin comenzar' && !batch.is_locked && (
              <button
                type="button"
                onClick={handleSendFeedback}
                className="w-full px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Feedback (Bloquea la revisión)
              </button>
            )}

            {batch.status === 'En proceso' && (
              <>
                <button
                  type="button"
                  onClick={handleSendDelivery}
                  className="w-full px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Versión Corregida
                </button>
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="w-full px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium"
                >
                  Finalizar Revisión
                </button>
              </>
            )}

            {batch.status !== 'Finalizado' && (
              <button
                type="button"
                onClick={handleSave}
                className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
              >
                Guardar Cambios
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>

      {/* Warning Modal */}
      {showLockWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113] rounded-2xl border border-yellow-500/20 w-full max-w-md p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-400" />
              <h4 className="text-lg font-bold text-white">Confirmar Envío</h4>
            </div>
            <p className="text-gray-300 mb-6">
              Una vez envíes esta revisión, <strong>no podrás editar ni añadir más correcciones</strong>. 
              La revisión quedará bloqueada automáticamente. 
              Asegúrate de agrupar todo tu feedback antes de enviarlo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLockWarning(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmSendFeedback();
                  setShowLockWarning(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                Entiendo, Enviar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}