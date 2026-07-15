import React from "react";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import AdminTopNav from "@/components/admin/AdminTopNav";

export default function AdminLayout({ children, activePage }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <AdminTopNav activePage={activePage} />

      {/* Main Content */}
      <main className="pt-14 pb-[calc(65px+env(safe-area-inset-bottom,0px)+16px)] lg:pb-8">
        {children}
      </main>

      {/* Admin Bottom Nav — mobile only */}
      <AdminBottomNav />
    </div>
  );
}