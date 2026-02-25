import React, { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Instagram, Music, Video, Link as LinkIcon, Plus } from "lucide-react";

const socialPlatforms = [
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-500/20 to-red-600/20", borderColor: "border-red-500/30", textColor: "text-red-400" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500/20 to-purple-600/20", borderColor: "border-pink-500/30", textColor: "text-pink-400" },
  { id: "spotify", name: "Spotify", icon: Music, color: "from-green-500/20 to-green-600/20", borderColor: "border-green-500/30", textColor: "text-green-400" },
  { id: "tiktok", name: "TikTok", icon: Video, color: "from-purple-500/20 to-purple-600/20", borderColor: "border-purple-500/30", textColor: "text-purple-400" }
];

export default function SocialLinksCard() {
  const [platforms, setPlatforms] = useState(
    socialPlatforms.map(p => ({ ...p, connected: false, url: "" }))
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [inputUrl, setInputUrl] = useState("");

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    const existingPlatform = platforms.find(p => p.id === platform.id);
    setInputUrl(existingPlatform?.url || "");
    setShowModal(true);
  };

  const handleSave = () => {
    setPlatforms(platforms.map(p =>
      p.id === selectedPlatform.id
        ? { ...p, connected: !!inputUrl, url: inputUrl }
        : p
    ));
    setShowModal(false);
    setInputUrl("");
    setSelectedPlatform(null);
  };

  const handleDisconnect = (platformId) => {
    setPlatforms(platforms.map(p =>
      p.id === platformId ? { ...p, connected: false, url: "" } : p
    ));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#111113] rounded-xl border border-white/5 p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold">Redes Sociales</h3>
          </div>
          <span className="text-xs text-gray-500">
            {platforms.filter(p => p.connected).length}/{platforms.length}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => platform.connected ? window.open(platform.url, '_blank') : handleConnect(platform)}
                className={`group relative p-2.5 rounded-lg border transition-all bg-gradient-to-br ${
                  platform.connected
                    ? `${platform.color} ${platform.borderColor} hover:scale-[1.02]`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${platform.connected ? platform.textColor : 'text-gray-500'}`} />
                  <span className={`text-xs font-medium ${platform.connected ? 'text-white' : 'text-gray-500'}`}>
                    {platform.name}
                  </span>
                </div>
                {!platform.connected && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                )}
                {platform.connected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDisconnect(platform.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-[#141414] rounded-xl border border-white/10 p-6"
          >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              {selectedPlatform && <selectedPlatform.icon className={`w-5 h-5 ${selectedPlatform.textColor}`} />}
              Conectar {selectedPlatform?.name}
            </h3>
            <input
              type="url"
              placeholder={`URL de tu perfil de ${selectedPlatform?.name}`}
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!inputUrl}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}