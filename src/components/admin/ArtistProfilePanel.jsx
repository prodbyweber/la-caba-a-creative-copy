import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Tag, ExternalLink, Music2, Play, Pause, FileText, Plus, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ArtistProfilePanel({ artist, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState({});
  const audioRefs = useRef({});
  const queryClient = useQueryClient();

  const { data: projects = [] } = useQuery({
    queryKey: ['artist-projects', artist.id],
    queryFn: () => base44.entities.Project.filter({ artist_id: artist.id })
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ['all-tracks'],
    queryFn: () => base44.entities.Track.list('-created_date')
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['artist-sessions', artist.id],
    queryFn: () => base44.entities.Session.filter({ artist_id: artist.id })
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['artist-deliverables', artist.id],
    queryFn: () => base44.entities.Deliverable.filter({ artist_id: artist.id })
  });

  const { data: revisions = [] } = useQuery({
    queryKey: ['artist-revisions', artist.id],
    queryFn: () => base44.entities.Revision.filter({ artist_id: artist.id })
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['artist-notes', artist.id],
    queryFn: () => base44.entities.Note.filter({ artist_id: artist.id })
  });

  const createRevisionMutation = useMutation({
    mutationFn: (data) => base44.entities.Revision.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-revisions', artist.id] });
      setRevisionNotes({});
    }
  });

  const updateRevisionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Revision.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-revisions', artist.id] });
    }
  });

  const togglePlay = async (trackId) => {
    const audio = audioRefs.current[trackId];
    if (!audio) return;

    try {
      if (playingTrackId === trackId) {
        audio.pause();
        setPlayingTrackId(null);
      } else {
        if (playingTrackId && audioRefs.current[playingTrackId]) {
          audioRefs.current[playingTrackId].pause();
        }
        setPlayingTrackId(trackId);
        await audio.play();
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setPlayingTrackId(null);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: `Projects (${projects.length})` },
    { id: "calendar", label: `Calendar (${sessions.length})` },
    { id: "deliverables", label: `Deliverables (${deliverables.length})` },
    { id: "revisions", label: `Revisions (${revisions.length})` },
    { id: "notes", label: `Notes (${notes.length})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="relative w-full max-w-2xl bg-[#0a0a0b] border-l border-white/5 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0b]/95 backdrop-blur-xl z-10 border-b border-white/5">
          <div className="p-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 overflow-hidden">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt={artist.stageName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white/40" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">{artist.stageName}</h2>
                {artist.legalName && (
                  <p className="text-gray-500 text-sm">{artist.legalName}</p>
                )}
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  artist.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                  artist.status === 'Lead' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {artist.status}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {artist.email && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <a href={`mailto:${artist.email}`} className="hover:text-emerald-400">
                        {artist.email}
                      </a>
                    </div>
                  )}
                  {artist.phone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <a href={`tel:${artist.phone}`} className="hover:text-emerald-400">
                        {artist.phone}
                      </a>
                    </div>
                  )}
                  {artist.location && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{artist.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Genre & Tags */}
              <div>
                <h3 className="text-lg font-bold mb-4">Genre & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.genre && (
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
                      {artist.genre}
                    </span>
                  )}
                  {artist.tags && artist.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Social Media</h3>
                  <div className="space-y-2">
                    {Object.entries(artist.social_links).map(([platform, url]) => url && (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-300 hover:text-emerald-400"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {artist.notes && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Internal Notes</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{artist.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold">Projects & Tracks</h3>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-6">
                  {projects.map((project) => {
                    const projectTracks = allTracks.filter(t => t.project_id === project.id);
                    return (
                      <div key={project.id} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                        {/* Project Header */}
                        <div className="p-4 border-b border-white/5">
                          <h4 className="font-semibold text-white mb-2">{project.title}</h4>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              project.status === 'Recording' ? 'bg-blue-500/10 text-blue-400' :
                              project.status === 'Mixing' ? 'bg-purple-500/10 text-purple-400' :
                              project.status === 'Mastering' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {project.status}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400">
                              {project.type}
                            </span>
                          </div>
                        </div>

                        {/* Tracks */}
                        {projectTracks.length > 0 && (
                          <div className="p-3 space-y-2">
                            {projectTracks.map((track) => (
                              <div key={track.id} className="bg-black/20 rounded-lg p-3 flex items-center gap-3">
                                {/* Audio Element */}
                                {track.audio_file_url && (
                                  <audio
                                    ref={(el) => { if (el) audioRefs.current[track.id] = el; }}
                                    src={track.audio_file_url}
                                    preload="metadata"
                                    playsInline
                                    onEnded={() => setPlayingTrackId(null)}
                                    onPause={() => { if (playingTrackId === track.id) setPlayingTrackId(null); }}
                                    onPlay={() => setPlayingTrackId(track.id)}
                                  />
                                )}

                                {/* Play Button */}
                                {track.audio_file_url && (
                                  <button
                                    type="button"
                                    onClick={() => togglePlay(track.id)}
                                    className="w-10 h-10 flex-shrink-0 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                                  >
                                    {playingTrackId === track.id ? (
                                      <Pause className="w-4 h-4 text-emerald-400" fill="currentColor" />
                                    ) : (
                                      <Play className="w-4 h-4 text-emerald-400 ml-0.5" fill="currentColor" />
                                    )}
                                  </button>
                                )}

                                {/* Cover */}
                                <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
                                  {track.cover_url ? (
                                    <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Music2 className="w-5 h-5 text-white/40" />
                                    </div>
                                  )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-semibold text-white truncate">{track.title}</h5>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {track.composers && track.composers.length > 0 && (
                                      <span className="text-xs text-gray-500">
                                        {track.composers.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                  {(track.producers && track.producers.length > 0) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Prod: {track.producers.join(', ')}
                                    </div>
                                  )}
                                  {track.mix_engineer && (
                                    <div className="text-xs text-gray-500">
                                      Mix: {track.mix_engineer}
                                    </div>
                                  )}
                                </div>

                                {/* Status Badge */}
                                <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                                  track.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  track.status === 'mixing' ? 'bg-purple-500/10 text-purple-400' :
                                  track.status === 'mastering' ? 'bg-orange-500/10 text-orange-400' :
                                  'bg-gray-500/10 text-gray-400'
                                }`}>
                                  {track.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Sessions & Meetings</h3>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions scheduled</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="font-semibold text-white mb-2">{session.title}</h4>
                      <p className="text-sm text-gray-400">{session.type} - {session.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "deliverables" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Deliverables</h3>
              {deliverables.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No deliverables yet</p>
              ) : (
                <div className="space-y-3">
                  {deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="font-semibold text-white mb-2">{deliverable.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        deliverable.status === 'Pending' ? 'bg-blue-500/10 text-blue-400' :
                        deliverable.status === 'Sent' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {deliverable.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "revisions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Revisiones del Artista</h3>
                <span className="text-xs text-gray-500">
                  Total: {revisions.length}
                </span>
              </div>

              {/* Nueva Revisión */}
              <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Revisión
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={revisionNotes.project_id || ''}
                      onChange={(e) => setRevisionNotes({ ...revisionNotes, project_id: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">Seleccionar proyecto</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Timecode (ej: 01:32)"
                      value={revisionNotes.timecode || ''}
                      onChange={(e) => setRevisionNotes({ ...revisionNotes, timecode: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={revisionNotes.revision_type || 'Mix'}
                      onChange={(e) => setRevisionNotes({ ...revisionNotes, revision_type: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="Vocal">Vocal</option>
                      <option value="Beat">Beat</option>
                      <option value="Mix">Mix</option>
                      <option value="Master">Master</option>
                      <option value="Arrangement">Arrangement</option>
                      <option value="FX">FX</option>
                      <option value="Lyrics">Lyrics</option>
                    </select>
                    <select
                      value={revisionNotes.severity || 'Medium'}
                      onChange={(e) => setRevisionNotes({ ...revisionNotes, severity: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Apuntes antes de la revisión..."
                    value={revisionNotes.request_text || ''}
                    onChange={(e) => setRevisionNotes({ ...revisionNotes, request_text: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 resize-none"
                  />
                  <button
                    onClick={() => {
                      if (revisionNotes.project_id && revisionNotes.timecode && revisionNotes.request_text) {
                        createRevisionMutation.mutate({
                          artist_id: artist.id,
                          project_id: revisionNotes.project_id,
                          timecode: revisionNotes.timecode,
                          revision_type: revisionNotes.revision_type || 'Mix',
                          severity: revisionNotes.severity || 'Medium',
                          request_text: revisionNotes.request_text,
                          status: 'Open',
                          assigned_to: 'Me'
                        });
                      }
                    }}
                    disabled={!revisionNotes.project_id || !revisionNotes.timecode || !revisionNotes.request_text}
                    className="w-full px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar Revisión
                  </button>
                </div>
              </div>

              {/* Lista de Revisiones */}
              {revisions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">Sin revisiones aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revisions.map((revision, idx) => {
                    const project = projects.find(p => p.id === revision.project_id);
                    return (
                      <div key={revision.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400 font-mono">
                              Revisión #{idx + 1}
                            </span>
                            <span className="font-mono text-emerald-400 text-sm">{revision.timecode}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              revision.severity === 'Critical' ? 'bg-red-500/10 text-red-400' :
                              revision.severity === 'Medium' ? 'bg-orange-500/10 text-orange-400' :
                              'bg-blue-500/10 text-blue-400'
                            }`}>
                              {revision.severity}
                            </span>
                          </div>
                          <select
                            value={revision.status}
                            onChange={(e) => updateRevisionMutation.mutate({
                              id: revision.id,
                              data: { status: e.target.value }
                            })}
                            className={`px-2 py-1 rounded text-xs font-medium focus:outline-none ${
                              revision.status === 'Open' ? 'bg-red-500/10 text-red-400' :
                              revision.status === 'Fixed' ? 'bg-emerald-500/10 text-emerald-400' :
                              revision.status === 'InProgress' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            <option value="Open">Open</option>
                            <option value="InProgress">En Progreso</option>
                            <option value="Fixed">Fixed</option>
                            <option value="NeedsReview">Necesita Revisión</option>
                            <option value="Closed">Cerrada</option>
                          </select>
                        </div>
                        {project && (
                          <p className="text-xs text-gray-500 mb-2">Proyecto: {project.title}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">
                            {revision.revision_type}
                          </span>
                          <span className="text-xs text-gray-500">
                            Asignado a: {revision.assigned_to}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{revision.request_text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Notes</h3>
              {notes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400">
                          {note.category}
                        </span>
                        {note.timecode && (
                          <span className="font-mono text-emerald-400 text-xs">{note.timecode}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}