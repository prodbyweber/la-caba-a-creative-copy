import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, X, ExternalLink, Eye, BarChart3 } from "lucide-react";

function CampaignPopup({ campaign, onClose, shown }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000); // Auto-close after 8s
    return () => clearTimeout(timer);
  }, [onClose]);

  // Track impression
  useEffect(() => {
    if (shown) {
      base44.entities.BrandCampaign.update(campaign.id, {
        impressions: (campaign.impressions || 0) + 1
      }).catch(() => {});
    }
  }, [shown, campaign]);

  const handleClick = () => {
    base44.entities.BrandCampaign.update(campaign.id, {
      clicks: (campaign.clicks || 0) + 1
    }).catch(() => {});
    
    if (campaign.link) {
      window.open(campaign.link, "_blank", "noopener");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-[400] max-w-sm"
    >
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#111]" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Image */}
        {campaign.image_url && (
          <div className="relative w-full h-32 overflow-hidden">
            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex-1 pr-2">{campaign.title}</h3>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {campaign.description && (
            <p className="text-xs text-white/60 mb-3 line-clamp-2">{campaign.description}</p>
          )}
          {campaign.link && (
            <button
              onClick={handleClick}
              className="w-full py-2 px-3 rounded-lg bg-white text-black text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-white/90 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {campaign.type === "external" ? "Ver producto" : "Ver más"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function BrandCampaignsSection({ userProfileId }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["brand-campaigns", userProfileId],
    queryFn: () => base44.entities.BrandCampaign.filter({ user_profile_id: userProfileId, is_active: true }),
    enabled: !!userProfileId,
  });

  // Show random popup from active campaigns with enabled popups
  const activeCampaignsWithPopups = campaigns.filter(c => c.popup_enabled);

  useEffect(() => {
    if (activeCampaignsWithPopups.length === 0) return;
    
    const intervals = {
      rare: 120000, // 2 minutes
      moderate: 60000, // 1 minute
      frequent: 30000, // 30 seconds
    };

    const campaign = activeCampaignsWithPopups[popupIndex % activeCampaignsWithPopups.length];
    const interval = intervals[campaign.popup_frequency || "moderate"];

    const timer = setInterval(() => {
      setPopupIndex(i => (i + 1) % activeCampaignsWithPopups.length);
    }, interval);

    return () => clearInterval(timer);
  }, [activeCampaignsWithPopups, popupIndex]);

  const currentPopup = activeCampaignsWithPopups[popupIndex % activeCampaignsWithPopups.length];
  const [showCurrentPopup, setShowCurrentPopup] = useState(!!currentPopup);

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Campañas Activas</h3>
            <p className="text-xs text-white/40 mt-0.5">Gestiona tu contenido y promociones</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva
          </button>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-white/40 text-sm">Sin campañas activas</p>
            <p className="text-white/20 text-xs mt-1">Crea una campaña para impulsar tu contenido</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {campaigns.map(campaign => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
              >
                {campaign.image_url && (
                  <div className="relative w-full h-40 overflow-hidden bg-black/30">
                    <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-white text-sm">{campaign.title}</h4>
                  {campaign.description && (
                    <p className="text-xs text-white/50 line-clamp-2">{campaign.description}</p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-3 pt-2 text-[10px] text-white/30">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {campaign.impressions || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {campaign.clicks || 0}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="flex gap-2 pt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                      {campaign.type === "external" ? "Producto externo" : "Contenido propio"}
                    </span>
                    {!campaign.popup_enabled && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                        Sin popup
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Popup — se muestra automáticamente */}
      <AnimatePresence>
        {currentPopup && showCurrentPopup && (
          <CampaignPopup
            campaign={currentPopup}
            onClose={() => setShowCurrentPopup(false)}
            shown={true}
          />
        )}
      </AnimatePresence>
    </>
  );
}