import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import SocialAccountCard from "@/components/social/SocialAccountCard";
import { Youtube, Instagram, Music, Video } from "lucide-react";

const socialPlatforms = [
  {
    id: "youtube",
    name: "YouTube Studio",
    icon: Youtube,
    description: "Conecta tu cuenta de YouTube para acceder a análisis de YouTube Studio",
    color: "red",
    connected: false,
    stats: null
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    description: "Conecta tu cuenta de Instagram para gestionar contenido y analíticas",
    color: "pink",
    connected: false,
    stats: null
  },
  {
    id: "spotify",
    name: "Spotify for Artists",
    icon: Music,
    description: "Conecta tu cuenta de Spotify for Artists para ver tus estadísticas de streams",
    color: "green",
    connected: false,
    stats: null
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    description: "Conecta tu cuenta de TikTok para analizar el rendimiento de tus videos",
    color: "purple",
    connected: false,
    stats: null
  }
];

export default function SocialAccounts() {
  const [platforms, setPlatforms] = useState(socialPlatforms);
  
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get("artistId");

  const handleConnect = (platformId) => {
    // Simulación de conexión - en producción esto abriría OAuth
    setPlatforms(platforms.map(p => 
      p.id === platformId 
        ? { 
            ...p, 
            connected: !p.connected,
            stats: !p.connected ? {
              followers: Math.floor(Math.random() * 50000) + 10000,
              engagement: (Math.random() * 10 + 2).toFixed(1) + "%",
              posts: Math.floor(Math.random() * 200) + 50
            } : null
          }
        : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav artistId={artistId} />

      <main className="pt-16">
        <div className="p-6 max-w-[1400px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              Redes <span className="text-emerald-400">Sociales</span>
            </h1>
            <p className="text-gray-500">
              Conecta tus cuentas de redes sociales para centralizar todas tus analíticas en un solo lugar.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="text-sm text-gray-500 mb-2">Cuentas Conectadas</div>
              <div className="text-3xl font-bold text-emerald-400">
                {platforms.filter(p => p.connected).length}/{platforms.length}
              </div>
            </div>
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="text-sm text-gray-500 mb-2">Alcance Total</div>
              <div className="text-3xl font-bold text-purple-400">
                {platforms.filter(p => p.connected).reduce((acc, p) => acc + (p.stats?.followers || 0), 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="text-sm text-gray-500 mb-2">Engagement Promedio</div>
              <div className="text-3xl font-bold text-orange-400">
                {platforms.filter(p => p.connected).length > 0
                  ? (platforms.filter(p => p.connected).reduce((acc, p) => acc + parseFloat(p.stats?.engagement || 0), 0) / platforms.filter(p => p.connected).length).toFixed(1)
                  : 0}%
              </div>
            </div>
          </motion.div>

          {/* Social Platform Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {platforms.map((platform, i) => (
              <SocialAccountCard
                key={platform.id}
                platform={platform}
                onConnect={handleConnect}
                delay={i * 0.1}
              />
            ))}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-orange-500/10 rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-lg font-semibold mb-2">¿Por qué conectar tus redes sociales?</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                <span>Centraliza todas tus analíticas en un solo dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5" />
                <span>Obtén insights avanzados sobre tu audiencia y rendimiento</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5" />
                <span>Publica y gestiona contenido desde una sola plataforma</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5" />
                <span>Tus datos están seguros y protegidos con OAuth 2.0</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
}