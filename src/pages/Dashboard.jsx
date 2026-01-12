import React, { useState } from "react";
import { motion } from "framer-motion";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ArtistProfileCard from "@/components/dashboard/ArtistProfileCard";
import PerformanceOverview from "@/components/dashboard/PerformanceOverview";
import GrowthChart from "@/components/dashboard/GrowthChart";
import ClipActivityFeed from "@/components/dashboard/ClipActivityFeed";
import WalletCard from "@/components/dashboard/WalletCard";
import UpcomingSessionsCard from "@/components/dashboard/UpcomingSessionsCard";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DashboardNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:pl-64 pt-16">
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Bienvenido de nuevo, <span className="text-emerald-400">Jay</span></h1>
            <p className="text-gray-500">Esto es lo que está pasando con tu música hoy.</p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <PerformanceOverview />
              <GrowthChart />
              <ClipActivityFeed />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ArtistProfileCard />
              <WalletCard />
              <UpcomingSessionsCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}