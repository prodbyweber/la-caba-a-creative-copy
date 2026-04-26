import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Users, Music2, Building2, Search, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function UserProfiles() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["user-profiles"],
    queryFn: () => base44.entities.UserProfile.list("-created_date", 200),
  });

  const filtered = profiles.filter(p => {
    const matchSearch = !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      p.nationality?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.account_type === filter;
    return matchSearch && matchFilter;
  });

  const artistCount = profiles.filter(p => p.account_type === "artist").length;
  const brandCount = profiles.filter(p => p.account_type === "brand").length;

  return (
    <AdminLayout activePage="UserProfiles">
      <div className="px-4 sm:px-8 lg:px-14 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Perfiles de Usuario</h1>
          <p className="text-sm text-white/30">Datos recopilados durante el onboarding</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total", value: profiles.length, icon: Users },
            { label: "Artistas", value: artistCount, icon: Music2, color: "text-emerald-400" },
            { label: "Marcas", value: brandCount, icon: Building2, color: "text-blue-400" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#111113] border border-white/[0.06] rounded-xl p-4">
              <kpi.icon className={`w-4 h-4 mb-3 ${kpi.color || "text-white/30"}`} />
              <div className="text-2xl font-black text-white">{kpi.value}</div>
              <div className="text-[10px] text-white/25 font-medium mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5">
            <Search className="w-4 h-4 text-white/25 flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, país..."
              className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {["all", "artist", "brand"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-white text-black"
                    : "bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white"
                }`}
              >
                {f === "all" ? "Todos" : f === "artist" ? "Artistas" : "Marcas"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No hay perfiles aún</p>
          </div>
        ) : (
          <div className="bg-[#111113] border border-white/[0.06] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-semibold text-white/25 uppercase tracking-widest" style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr 1fr 1fr" }}>
              <span>Usuario</span>
              <span>Nombre artístico</span>
              <span>Teléfono</span>
              <span>Nacionalidad</span>
              <span>Tipo</span>
              <span>Fecha</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors items-center"
                  style={{ gridTemplateColumns: "3fr 2fr 2fr 2fr 1fr 1fr" }}
                >
                  {/* Usuario */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-white/5">
                      {profile.profile_photo_url ? (
                        <img src={profile.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/30">
                          {profile.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{profile.full_name || "—"}</p>
                      <p className="text-[11px] text-white/30 truncate">{profile.user_email || "—"}</p>
                    </div>
                  </div>

                  {/* Nombre artístico */}
                  <span className="text-sm text-white/60 truncate">{profile.artist_name || <span className="text-white/20">—</span>}</span>

                  {/* Teléfono */}
                  <span className="text-sm text-white/60">
                    {profile.phone ? `${profile.phone_country_code || ""} ${profile.phone}` : <span className="text-white/20">—</span>}
                  </span>

                  {/* Nacionalidad */}
                  <span className="text-sm text-white/60 truncate">{profile.nationality || <span className="text-white/20">—</span>}</span>

                  {/* Tipo */}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full w-fit ${
                    profile.account_type === "artist"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {profile.account_type === "artist" ? "Artista" : "Marca"}
                  </span>

                  {/* Fecha */}
                  <span className="text-[11px] text-white/25">
                    {profile.created_date ? format(new Date(profile.created_date), "dd MMM") : "—"}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}