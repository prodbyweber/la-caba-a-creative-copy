import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { 
  Youtube, 
  Instagram, 
  Music2,
  Settings,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Unlink
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const platformsConfig = {
  youtube: {
    name: "YouTube Shorts",
    icon: Youtube,
    color: "red",
    description: "Conecta tu canal de YouTube para publicar Shorts automáticamente",
    setupUrl: "https://console.developers.google.com"
  },
  instagram: {
    name: "Instagram Reels",
    icon: Instagram,
    color: "pink",
    description: "Conecta tu cuenta de Instagram para publicar Reels",
    setupUrl: "https://developers.facebook.com"
  },
  tiktok: {
    name: "TikTok",
    icon: Music2,
    color: "purple",
    description: "Conecta tu cuenta de TikTok para publicar videos",
    setupUrl: "https://developers.tiktok.com"
  }
};

export default function ClipsSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: connectedAccounts = [], isLoading, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => base44.entities.SocialAccount.list(),
  });

  const getAccountStatus = (platform) => {
    const account = connectedAccounts.find(acc => acc.platform === platform);
    if (!account) return { connected: false };
    
    const isExpired = account.expires_at && new Date(account.expires_at) < new Date();
    return {
      connected: true,
      expired: isExpired,
      account
    };
  };

  const handleConnect = (platform) => {
    alert(`La conexión OAuth con ${platformsConfig[platform].name} requiere configuración en el backend. 
    
Por favor configura las credenciales OAuth en la configuración del servidor y las variables de entorno necesarias.

Documentación: ${platformsConfig[platform].setupUrl}`);
  };

  const handleDisconnect = async (accountId) => {
    if (confirm("¿Estás seguro de que quieres desconectar esta cuenta?")) {
      await base44.entities.SocialAccount.delete(accountId);
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1400px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">
              Configuración de <span className="text-purple-400">Clips</span>
            </h1>
            <p className="text-gray-500">
              Gestiona las conexiones a tus cuentas de redes sociales y configuraciones de publicación
            </p>
          </motion.div>

          {/* Connected Accounts Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cuentas Conectadas</div>
                  <div className="text-3xl font-bold text-emerald-400">
                    {connectedAccounts.filter(acc => acc.status === 'connected').length}
                  </div>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            </div>
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Requieren Atención</div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {connectedAccounts.filter(acc => acc.status === 'expired').length}
                  </div>
                </div>
                <AlertCircle className="w-10 h-10 text-yellow-400" />
              </div>
            </div>
            <div className="bg-[#111113] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Plataformas</div>
                  <div className="text-3xl font-bold text-purple-400">3</div>
                </div>
                <Settings className="w-10 h-10 text-purple-400" />
              </div>
            </div>
          </motion.div>

          {/* Platform Connections */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Conexiones de Plataformas</h2>
            
            {Object.entries(platformsConfig).map(([key, platform], i) => {
              const status = getAccountStatus(key);
              const Icon = platform.icon;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-[#111113] rounded-2xl border border-white/5 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-${platform.color}-500/10 flex items-center justify-center`}>
                          <Icon className={`w-7 h-7 text-${platform.color}-400`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{platform.name}</h3>
                          <p className="text-sm text-gray-500 mb-3">{platform.description}</p>
                          
                          {status.connected && (
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {status.expired ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    <span className="text-sm text-yellow-400">Token expirado</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-sm text-emerald-400">Conectado</span>
                                  </>
                                )}
                              </div>
                              {status.account && (
                                <span className="text-sm text-gray-500">
                                  • {status.account.account_name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {status.connected ? (
                          <>
                            {status.expired && (
                              <button
                                onClick={() => handleConnect(key)}
                                className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-medium text-sm hover:bg-yellow-500/20 transition-all flex items-center gap-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Reconectar
                              </button>
                            )}
                            <button
                              onClick={() => handleDisconnect(status.account.id)}
                              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                              <Unlink className="w-4 h-4" />
                              Desconectar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(key)}
                            className="px-4 py-2 rounded-xl bg-purple-500 font-medium text-sm hover:bg-purple-600 transition-all flex items-center gap-2"
                          >
                            <LinkIcon className="w-4 h-4" />
                            Conectar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Setup Instructions (collapsed) */}
                  <details className="border-t border-white/5">
                    <summary className="px-6 py-3 text-sm text-gray-500 hover:text-white cursor-pointer">
                      Ver instrucciones de configuración
                    </summary>
                    <div className="px-6 pb-6 pt-3 text-sm text-gray-400 space-y-2">
                      <p><strong className="text-white">Paso 1:</strong> Crea una aplicación OAuth en {platform.setupUrl}</p>
                      <p><strong className="text-white">Paso 2:</strong> Configura las URLs de callback en tu aplicación</p>
                      <p><strong className="text-white">Paso 3:</strong> Agrega las credencias (Client ID y Secret) a las variables de entorno del servidor</p>
                      <p><strong className="text-white">Paso 4:</strong> Haz clic en "Conectar" arriba para autorizar la cuenta</p>
                    </div>
                  </details>
                </motion.div>
              );
            })}
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Información Importante
            </h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• <strong className="text-white">Seguridad:</strong> Todas las conexiones usan OAuth 2.0 y tus tokens están encriptados</p>
              <p>• <strong className="text-white">Permisos:</strong> Solo solicitamos los permisos mínimos necesarios para publicar</p>
              <p>• <strong className="text-white">Renovación:</strong> Los tokens se renuevan automáticamente cuando es posible</p>
              <p>• <strong className="text-white">Publicación:</strong> Los clips programados se publicarán automáticamente a la hora indicada</p>
              <p>• <strong className="text-white">Backend requerido:</strong> La publicación automática requiere un job scheduler configurado en el backend</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}