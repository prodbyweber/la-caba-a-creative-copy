import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0b]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">LC</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">
                La Cabaña <span className="text-emerald-400">Creative</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              The creative operating system for serious artists. Production, distribution, monetization — all in one place.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</a></li>
              <li><Link to={createPageUrl("Dashboard")} className="text-sm text-gray-500 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} La Cabaña Creative. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}