import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Youtube, Music2, TrendingUp, Users, Eye, Heart, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SocialMetricsCard({ artist }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [extractingData, setExtractingData] = useState({});
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
      let prompt = '';
      let schema = {};
      
      if (platform === 'spotify') {
        prompt = `Extract Spotify artist metrics from this URL: ${url}. 
        Return data in this exact JSON format:
        {
          "followers": number or null,
          "monthly_listeners": number or null,
          "total_streams": number or null,
          "playlists": number or null
        }`;
        schema = {
          type: "object",
          properties: {
            followers: { type: ["number", "null"] },
            monthly_listeners: { type: ["number", "null"] },
            total_streams: { type: ["number", "null"] },
            playlists: { type: ["number", "null"] }
          }
        };
      } else if (platform === 'youtube') {
        prompt = `Extract YouTube channel metrics from this URL: ${url}. 
        Return data in this exact JSON format:
        {
          "subscribers": number or null,
          "total_views": number or null,
          "videos": number or null
        }`;
        schema = {
          type: "object",
          properties: {
            subscribers: { type: ["number", "null"] },
            total_views: { type: ["number", "null"] },
            videos: { type: ["number", "null"] }
          }
        };
      } else if (platform === 'applemusic') {
        prompt = `Extract Apple Music artist metrics from this URL: ${url}. 
        Return data in this exact JSON format:
        {
          "followers": number or null,
          "monthly_listeners": number or null
        }`;
        schema = {
          type: "object",
          properties: {
            followers: { type: ["number", "null"] },
            monthly_listeners: { type: ["number", "null"] }
          }
        };
      } else {
        prompt = `Extract ${platform} profile metrics from this URL: ${url}. 
        Return data in this exact JSON format:
        {
          "followers": number or null,
          "likes": number or null,
          "posts": number or null,
          "videos": number or null
        }`;
        schema = {
          type: "object",
          properties: {
            followers: { type: ["number", "null"] },
            likes: { type: ["number", "null"] },
            posts: { type: ["number", "null"] },
            videos: { type: ["number", "null"] }
          }
        };
      }
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt + ' If you can\'t extract a metric, set it to null. Be precise and only return the JSON.',
        add_context_from_internet: true,
        response_json_schema: schema
      });

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
    } catch (error) {
      console.error('Error extracting data:', error);
    } finally {
      setExtractingData(prev => ({ ...prev, [platform]: false }));
    }
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

  // Calcular seguidores totales
  const getTotalFollowers = () => {
    let total = 0;
    const metrics = artist.social_metrics || {};
    
    Object.keys(metrics).forEach(platform => {
      const platformData = metrics[platform];
      if (platformData.followers) total += platformData.followers;
      if (platformData.subscribers) total += platformData.subscribers;
    });
    
    return total;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#141414] to-black rounded-lg border border-white/5 overflow-hidden"
    >
      {/* Header Colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">Redes Sociales</h3>
            <p className="text-[10px] text-gray-500">
              {formatNumber(getTotalFollowers())} seguidores totales
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {/* Platforms - Expandible */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/5 overflow-hidden"
          >
            <div className="p-3 space-y-3">
        {socialPlatforms.map((platform) => {
          const currentUrl = artist.social_links?.[platform.id] || '';
          const metrics = artist.social_metrics?.[platform.id] || {};
          const isConnected = !!currentUrl;

          return (
            <div 
              key={platform.id}
              className="bg-white/5 rounded-lg p-2 lg:p-3 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex flex-col gap-2">
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                      <platform.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">{platform.name}</h4>
                      {isConnected && metrics.last_updated && (
                        <p className="text-[9px] text-gray-500">
                          Actualizado {new Date(metrics.last_updated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {isConnected && currentUrl && (
                    <a 
                      href={currentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* URL Input */}
                <div className="flex gap-1.5">
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
                    className="flex-1 px-2 py-1.5 text-[10px] bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => extractSocialData(platform.id, currentUrl)}
                    disabled={!currentUrl || extractingData[platform.id]}
                    className="px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-gray-600 text-white text-[10px] font-medium transition-colors whitespace-nowrap"
                  >
                    {extractingData[platform.id] ? 'Cargando...' : 'Conectar'}
                  </button>
                </div>

                {/* Metrics - Fragmentados por Plataforma */}
                {isConnected && Object.keys(metrics).length > 1 && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    {/* Spotify Metrics */}
                    {platform.id === 'spotify' && (
                      <div className="grid grid-cols-2 gap-2">
                        {metrics.followers && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.followers)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Seguidores</div>
                          </div>
                        )}
                        {metrics.monthly_listeners && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.monthly_listeners)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Oyentes/mes</div>
                          </div>
                        )}
                        {metrics.total_streams && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.total_streams)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Reproducciones</div>
                          </div>
                        )}
                        {metrics.playlists && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.playlists)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Playlists</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* YouTube Metrics */}
                    {platform.id === 'youtube' && (
                      <div className="grid grid-cols-2 gap-2">
                        {metrics.subscribers && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.subscribers)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Suscriptores</div>
                          </div>
                        )}
                        {metrics.total_views && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.total_views)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Reproducciones</div>
                          </div>
                        )}
                        {metrics.videos && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.videos)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Videos</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Apple Music Metrics */}
                    {platform.id === 'applemusic' && (
                      <div className="grid grid-cols-2 gap-2">
                        {metrics.followers && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.followers)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Seguidores</div>
                          </div>
                        )}
                        {metrics.monthly_listeners && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.monthly_listeners)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Oyentes/mes</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Instagram/TikTok Metrics */}
                    {(platform.id === 'instagram' || platform.id === 'tiktok') && (
                      <div className="grid grid-cols-2 gap-2">
                        {metrics.followers && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.followers)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Seguidores</div>
                          </div>
                        )}
                        {metrics.likes && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.likes)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Me gusta</div>
                          </div>
                        )}
                        {metrics.posts && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.posts)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Posts</div>
                          </div>
                        )}
                        {metrics.videos && (
                          <div className="bg-black/40 rounded-lg p-2">
                            <div className="text-xs lg:text-sm font-bold text-white">{formatNumber(metrics.videos)}</div>
                            <div className="text-[10px] lg:text-xs text-gray-500">Videos</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}