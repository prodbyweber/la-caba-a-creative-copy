import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Calendar as CalendarIcon, Package } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from "date-fns";

export default function Calendars() {
  const [activeTab, setActiveTab] = useState("sessions");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-start_time')
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => base44.entities.Deliverable.list('-due_date_time')
  });

  const { data: artists = [] } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.list()
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter(session => 
      session.start_time && isSameDay(parseISO(session.start_time), day)
    );
  };

  const getDeliverablesForDay = (day) => {
    return deliverables.filter(deliverable => 
      deliverable.due_date_time && isSameDay(parseISO(deliverable.due_date_time), day)
    );
  };

  return (
    <AdminLayout activePage="Calendars">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendars</h1>
            <p className="text-gray-500">Manage sessions and deliverables</p>
          </div>
          <button
            onClick={() => activeTab === "sessions" ? setShowSessionModal(true) : setShowDeliverableModal(true)}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {activeTab === "sessions" ? "New Session" : "New Deliverable"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === "sessions"
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <CalendarIcon className="w-5 h-5" />
            Sessions Calendar ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab("deliverables")}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              activeTab === "deliverables"
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <Package className="w-5 h-5" />
            Deliverables ({deliverables.length})
          </button>
        </div>

        {/* Calendar Header */}
        <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                →
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, i) => {
              const daySessions = activeTab === "sessions" ? getSessionsForDay(day) : [];
              const dayDeliverables = activeTab === "deliverables" ? getDeliverablesForDay(day) : [];
              const hasItems = daySessions.length > 0 || dayDeliverables.length > 0;
              const isTodayDate = isToday(day);

              return (
                <div
                  key={i}
                  className={`min-h-24 p-2 rounded-lg border transition-all ${
                    isTodayDate
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : hasItems
                      ? 'bg-white/5 border-white/10 hover:border-emerald-500/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'text-emerald-400' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {activeTab === "sessions" && daySessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className="text-xs p-1 rounded bg-blue-500/20 text-blue-400 truncate"
                      >
                        {format(parseISO(session.start_time), 'HH:mm')} {session.title}
                      </div>
                    ))}
                    {activeTab === "deliverables" && dayDeliverables.slice(0, 3).map((deliverable) => (
                      <div
                        key={deliverable.id}
                        className={`text-xs p-1 rounded truncate ${
                          deliverable.status === 'Overdue' 
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {deliverable.title}
                      </div>
                    ))}
                    {((activeTab === "sessions" && daySessions.length > 3) || 
                      (activeTab === "deliverables" && dayDeliverables.length > 3)) && (
                      <div className="text-[10px] text-gray-500">
                        +{(activeTab === "sessions" ? daySessions : dayDeliverables).length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateSessionModal
        isOpen={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        artists={artists}
        projects={projects}
      />

      <CreateDeliverableModal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
        artists={artists}
        projects={projects}
      />
    </AdminLayout>
  );
}

function CreateSessionModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Session",
    artist_id: "",
    project_id: "",
    start_time: "",
    end_time: "",
    location: "Studio",
    description: "",
    status: "Scheduled"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold mb-6">New Session</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <input
            type="text"
            placeholder="Session Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Session">Session</option>
              <option value="Meeting">Meeting</option>
              <option value="StudioWork">Studio Work</option>
            </select>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="Studio">Studio</option>
              <option value="Online">Online</option>
              <option value="External">External</option>
            </select>
          </div>
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <textarea
            placeholder="Description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 resize-none"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600">Create</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function CreateDeliverableModal({ isOpen, onClose, artists, projects }) {
  const [formData, setFormData] = useState({
    artist_id: "",
    project_id: "",
    deliverable_type: "Demo",
    title: "",
    due_date_time: "",
    status: "Pending",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Deliverable.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#141414] rounded-2xl border border-white/10 p-6"
      >
        <h3 className="text-xl font-bold mb-6">New Deliverable</h3>
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
          <input
            type="text"
            placeholder="Deliverable Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
          />
          <select
            value={formData.artist_id}
            onChange={(e) => setFormData({ ...formData, artist_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Artist *</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>{artist.stageName}</option>
            ))}
          </select>
          <select
            value={formData.project_id}
            onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Project *</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select
            value={formData.deliverable_type}
            onChange={(e) => setFormData({ ...formData, deliverable_type: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="Demo">Demo</option>
            <option value="Beat">Beat</option>
            <option value="Recording">Recording</option>
            <option value="Mix">Mix</option>
            <option value="Master">Master</option>
            <option value="Stems">Stems</option>
            <option value="Visual">Visual</option>
            <option value="ContentPack">Content Pack</option>
          </select>
          <input
            type="datetime-local"
            value={formData.due_date_time}
            onChange={(e) => setFormData({ ...formData, due_date_time: e.target.value })}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600">Create</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}