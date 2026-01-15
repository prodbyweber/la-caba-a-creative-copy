import React, { useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Music2, TrendingUp, Users, Eye, Heart, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SocialMetricsCard({ artist }) {
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
      className="bg-gradient-to-br from-[#141414] to-black rounded-2xl border border-white/5 overflow-hidden"
    >
      {/* Header con Total de Seguidores */}
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-white">Redes Sociales</h3>
              <p className="text-xs text-gray-500">Conecta y trackea tus perfiles</p>
            </div>
          </div>
          
          {/* Total Followers Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
            <div className="text-xs text-gray-400">Total Seguidores</div>
            <div className="text-xl lg:text-2xl font-bold text-emerald-400">
              {formatNumber(getTotalFollowers())}
            </div>
          </div>
        </div>
      </div>

      {/* Platforms */}
      <div className="p-4 lg:p-6 space-y-4">
        {socialPlatforms.map((platform) => {
          const currentUrl = artist.social_links?.[platform.id] || '';
          const metrics = artist.social_metrics?.[platform.id] || {};
          const isConnected = !!currentUrl;

          return (
            <div 
              key={platform.id}
              className="bg-white/5 rounded-xl p-3 lg:p-4 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex flex-col gap-3">
                {/* Platform Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                      <platform.icon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm lg:text-base text-white">{platform.name}</h4>
                      {isConnected && metrics.last_updated && (
                        <p className="text-[10px] lg:text-xs text-gray-500">
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
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* URL Input */}
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
                    className="flex-1 px-3 py-2 text-xs lg:text-sm bg-black/40 border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => extractSocialData(platform.id, currentUrl)}
                    disabled={!currentUrl || extractingData[platform.id]}
                    className="px-3 lg:px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 disabled:text-gray-600 text-white text-xs lg:text-sm font-medium transition-colors whitespace-nowrap"
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
  );
}