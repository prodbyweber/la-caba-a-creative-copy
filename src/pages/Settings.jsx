import React from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";

export default function Settings() {
  return (
    <AdminLayout activePage="Settings">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-500">Configure your admin panel</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-emerald-400" />
              <h3 className="text-lg font-bold">Profile Settings</h3>
            </div>
            <p className="text-gray-400">Manage your profile information and preferences.</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold">Notifications</h3>
            </div>
            <p className="text-gray-400">Configure notification preferences for deliverables and sessions.</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold">Security</h3>
            </div>
            <p className="text-gray-400">Manage access control and security settings.</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-bold">General</h3>
            </div>
            <p className="text-gray-400">General system settings and preferences.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}