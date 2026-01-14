import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, User, Mail, Phone, MapPin, Tag, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ArtistProfilePanel({ artist, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: projects = [] } = useQuery({
    queryKey: ['artist-projects', artist.id],
    queryFn: () => base44.entities.Project.filter({ artist_id: artist.id })
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-red-700/20 overflow-hidden border-2 border-red-500/30">
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Projects</h3>
              {projects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <h4 className="font-semibold text-white mb-2">{project.title}</h4>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          project.status === 'Recording' ? 'bg-blue-500/10 text-blue-400' :
                          project.status === 'Mixing' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400">
                          {project.type}
                        </span>
                      </div>
                    </div>
                  ))}
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
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Revisions</h3>
              {revisions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No revisions yet</p>
              ) : (
                <div className="space-y-3">
                  {revisions.map((revision) => (
                    <div key={revision.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-emerald-400 text-sm">{revision.timecode}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          revision.status === 'Open' ? 'bg-red-500/10 text-red-400' :
                          revision.status === 'Fixed' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {revision.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{revision.request_text}</p>
                    </div>
                  ))}
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