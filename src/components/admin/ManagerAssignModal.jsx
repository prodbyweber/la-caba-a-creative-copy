import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check, UserCog, Link2, Unlink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// Modal para asignar (o quitar) el rol de MANAGER a un usuario.
// El manager ve únicamente el dashboard del artista asignado, en modo solo-lectura
// (escuchar y ver el material del catálogo). No tiene catálogo propio.
export default function ManagerAssignModal({ user, onClose }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  // Perfil actual del usuario objetivo (para saber si ya es manager y de quién)
  const { data: profile } = useQuery({
    queryKey: ["manager-profile", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.userId });
      return profiles[0] || null;
    },
    enabled: !!user?.userId,
  });

  // Lista de artistas disponibles para asignar
  const { data: artists = [], isLoading } = useQuery({
    queryKey: ["artists-for-manager"],
    queryFn: () => base44.entities.Artist.list("-created_date", 200),
  });

  const currentArtistId = profile?.manager_of_artist_id || null;
  const currentArtist = useMemo(
    () => artists.find((a) => a.id === currentArtistId) || null,
    [artists, currentArtistId]
  );

  const filtered = useMemo(() => {
    if (!search) return artists;
    const q = search.toLowerCase();
    return artists.filter((a) =>
      (a.stageName || "").toLowerCase().includes(q) ||
      (a.email || "").toLowerCase().includes(q)
    );
  }, [artists, search]);

  const assign = async (artistId) => {
    if (!user?.userId) return;
    setSaving(true);
    try {
      if (profile?.id) {
        await base44.entities.UserProfile.update(profile.id, { manager_of_artist_id: artistId });
      } else {
        await base44.entities.UserProfile.create({
          user_id: user.userId,
          user_email: user.email || "",
          manager_of_artist_id: artistId,
        });
      }
      qc.invalidateQueries({ queryKey: ["manager-profile", user.userId] });
      qc.invalidateQueries({ queryKey: ["all-user-profiles"] });
      setDone(true);
      setTimeout(onClose, 700);
    } catch (e) {
      alert("No se pudo asignar el rol: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  const unassign = async () => {
    if (!profile?.id) { onClose(); return; }
    setSaving(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { manager_of_artist_id: null });
      qc.invalidateQueries({ queryKey: ["manager-profile", user.userId] });
      qc.invalidateQueries({ queryKey: ["all-user-profiles"] });
      setDone(true);
      setTimeout(onClose, 700);
    } catch (e) {
      alert("No se pudo quitar el rol: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
          style={{ background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "88vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,88,51,0.12)" }}>
                <UserCog className="w-4 h-4 text-[#ff8866]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Asignar manager</h3>
                <p className="text-[11px] text-white/30">{user.displayName}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div>

          {/* Estado actual */}
          <div className="px-5 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-0.5">Rol actual</p>
              {currentArtist ? (
                <p className="text-xs text-white/70">Manager de <span className="font-bold text-white">{currentArtist.stageName}</span></p>
              ) : (
                <p className="text-xs text-white/40">Sin asignar</p>
              )}
            </div>
            {currentArtist && (
              <button
                onClick={unassign}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 transition-colors"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <Unlink className="w-3 h-3" /> Quitar rol
              </button>
            )}
          </div>

          {/* Buscador */}
          <div className="px-5 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar artista..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
              />
            </div>
          </div>

          {/* Lista de artistas */}
          <div className="overflow-y-auto flex-1 px-3 py-2">
            {isLoading ? (
              <div className="space-y-2 p-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-white/[0.04] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-white/25 text-sm">No hay artistas para esta búsqueda</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((a) => {
                  const selected = a.id === currentArtistId;
                  return (
                    <button
                      key={a.id}
                      onClick={() => assign(a.id)}
                      disabled={saving || selected}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{
                        background: selected ? "rgba(255,88,51,0.1)" : "rgba(255,255,255,0.03)",
                        border: selected ? "1px solid rgba(255,88,51,0.3)" : "1px solid rgba(255,255,255,0.05)",
                        cursor: (saving || selected) ? "default" : "pointer",
                      }}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                        {a.avatar_url ? (
                          <img src={a.avatar_url} alt="" className="w-full h-full object-cover" style={{ objectPosition: a.photo_position || "center" }} />
                        ) : (
                          <span className="text-xs font-black text-white/25">{(a.stageName || "?")[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{a.stageName || "—"}</p>
                        {a.email && <p className="text-[10px] text-white/35 truncate">{a.email}</p>}
                      </div>
                      {selected ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#ff8866]">
                          <Check className="w-3.5 h-3.5" /> Asignado
                        </span>
                      ) : (
                        <Link2 className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between flex-shrink-0">
            <p className="text-[10px] text-white/30 leading-tight max-w-[70%]">
              El manager verá solo el catálogo de este artista (escuchar y ver), sin catálogo propio.
            </p>
            {done && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Guardado
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}