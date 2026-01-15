import React, { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Music2, TrendingUp, Users, Eye, Heart, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SocialMetricsCard({ artist }) {
  const [extractingData, setExtractingData] = useState({});
  const [showConnectModal, setShowConnectModal] = useState(false);
  const queryClient = useQueryClient();

  const updateArtistMutation = useMutation({
    mutationFn: (data) => base44.entities.Artist.update(artist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist', artist.id] });
    }
  });

  const extractSocialData = async (platform, url) => {
    if (!url) return;
    
    setExtractingData(prev => ({ ...prev, [platform]: true }));
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract detailed social media metrics from this ${platform} profile URL: ${url}. 
        Search the internet for this profile and extract all available public metrics.
        Return data in this exact JSON format:
        {
          "followers": number (total followers/subscribers),
          "posts": number (total posts/videos published),
          "videos": number (total videos if applicable),
          "views": number (total views/plays/streams),
          "engagement": number (engagement rate percentage if available),
          "likes": number (total likes if available),
          "monthly_listeners": number (for music platforms)
        }
        If you can't extract a metric, set it to null. Be precise and only return the JSON with real data from the internet.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            followers: { type: ["number", "null"] },
            posts: { type: ["number", "null"] },
            videos: { type: ["number", "null"] },
            views: { type: ["number", "null"] },
            engagement: { type: ["number", "null"] },
            likes: { type: ["number", "null"] },
            monthly_listeners: { type: ["number", "null"] }
          }
        }
      });

      // Actualizar las métricas del artista
      const currentMetrics = artist.social_metrics || {};
      updateArtistMutation.mutate({
        social_metrics: {
          ...currentMetrics,
          [platform]: {
            url,
            ...result,
            last_updated: new Date().toISOString()
          }
        }
      });
      
      setShowConnectModal(false);
    } catch (error) {
      console.error('Error extracting data:', error);
    } finally {
      setExtractingData(prev => ({ ...prev, [platform]: false }));
    }
  };

  const getTotalFollowers = () => {
    const metrics = artist.social_metrics || {};
    let total = 0;
    Object.values(metrics).forEach(platform => {
      if (platform.followers) total += platform.followers;
    });
    return total;
  };

  const getTotalViews = () => {
    const metrics = artist.social_metrics || {};
    let total = 0;
    Object.values(metrics).forEach(platform => {
      if (platform.views) total += platform.views;
    });
    return total;
  };

  const getTotalLikes = () => {
    const metrics = artist.social_metrics || {};
    let total = 0;
    Object.values(metrics).forEach(platform => {
      if (platform.likes) total += platform.likes;
    });
    return total;
  };

  const socialPlatforms = [
    { 
      id: 'instagram', 
      name: 'Instagram', 
      icon: Instagram, 
      color: 'from-pink-500 to-purple-500',
      placeholder: 'https://instagram.com/username'
    },
    { 
      id: 'youtube', 
      name: 'YouTube', 
      icon: Youtube, 
      color: 'from-red-500 to-red-600',
      placeholder: 'https://youtube.com/@username'
    },
    { 
      id: 'tiktok', 
      name: 'TikTok', 
      icon: Music2, 
      color: 'from-black to-gray-900',
      placeholder: 'https://tiktok.com/@username'
    },
    { 
      id: 'spotify', 
      name: 'Spotify', 
      icon: Music2, 
      color: 'from-green-500 to-green-600',
      placeholder: 'https://open.spotify.com/artist/...'
    },
    { 
      id: 'applemusic', 
      name: 'Apple Music', 
      icon: Music2, 
      color: 'from-red-400 to-pink-500',
      placeholder: 'https://music.apple.com/artist/...'
    }
  ];

  const formatNumber = (num) => {
    if (!num) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-bold text-white">Analíticas de Redes Sociales</h3>
                <p className="text-xs text-gray-500">Métricas en tiempo real</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              Conectar Plataformas
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="p-4 lg:p-6 border-b border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-400">Total Seguidores</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{formatNumber(getTotalFollowers())}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-400">Total Reproducciones</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{formatNumber(getTotalViews())}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl p-4 border border-red-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-xs text-gray-400">Total Likes</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{formatNumber(getTotalLikes())}</div>
            </div>
          </div>
        </div>

        {/* Platforms Grid */}
        <div className="p-4 lg:p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPlatforms.map((platform) => {
              const metrics = artist.social_metrics?.[platform.id] || {};
              const isConnected = !!artist.social_links?.[platform.id] && Object.keys(metrics).length > 1;

              return (
                <div 
                  key={platform.id}
                  className="bg-gradient-to-br from-white/5 to-white/0 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{platform.name}</h4>
                        {isConnected ? (
                          <p className="text-xs text-emerald-400">Conectado</p>
                        ) : (
                          <p className="text-xs text-gray-500">Sin conectar</p>
                        )}
                      </div>
                    </div>
                    {artist.social_links?.[platform.id] && (
                      <a 
                        href={artist.social_links[platform.id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {isConnected ? (
                    <div className="space-y-3">
                      {metrics.followers && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>Seguidores</span>
                          </div>
                          <span className="text-sm font-bold text-white">{formatNumber(metrics.followers)}</span>
                        </div>
                      )}
                      {metrics.views && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span>Reproducciones</span>
                          </div>
                          <span className="text-sm font-bold text-white">{formatNumber(metrics.views)}</span>
                        </div>
                      )}
                      {metrics.likes && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Heart className="w-4 h-4" />
                            <span>Likes</span>
                          </div>
                          <span className="text-sm font-bold text-white">{formatNumber(metrics.likes)}</span>
                        </div>
                      )}
                      {metrics.monthly_listeners && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Music2 className="w-4 h-4" />
                            <span>Oyentes/mes</span>
                          </div>
                          <span className="text-sm font-bold text-white">{formatNumber(metrics.monthly_listeners)}</span>
                        </div>
                      )}
                      {metrics.videos && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Music2 className="w-4 h-4" />
                            <span>Videos</span>
                          </div>
                          <span className="text-sm font-bold text-white">{formatNumber(metrics.videos)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-xs">
                      Conecta para ver métricas
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#141414] rounded-2xl border border-white/10 overflow-hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
              <div>
                <h3 className="text-lg font-bold text-white">Conectar Plataformas</h3>
                <p className="text-sm text-gray-500">Pega los enlaces de tus perfiles</p>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {socialPlatforms.map((platform) => {
                const currentUrl = artist.social_links?.[platform.id] || '';

                return (
                  <div 
                    key={platform.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{platform.name}</h4>
                        <p className="text-xs text-gray-500">{platform.placeholder}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentUrl}
                        onChange={(e) => {
                          updateArtistMutation.mutate({
                            social_links: {
                              ...artist.social_links,
                              [platform.id]: e.target.value
                            }
                          });
                        }}
                        placeholder={platform.placeholder}
                        className="flex-1 px-4 py-2 text-sm bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={() => extractSocialData(platform.id, currentUrl)}
                        disabled={!currentUrl || extractingData[platform.id]}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-gray-600 text-white text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        {extractingData[platform.id] ? 'Extrayendo...' : 'Conectar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}