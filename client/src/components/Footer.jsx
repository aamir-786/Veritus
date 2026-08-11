import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080B11] border-t border-slate-800/80 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-lg text-white">VERITUS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Knowledge & Decision Platform built on <em>Deciding in the Dark</em>'s 100 structured risk questions and 7-way taxonomy.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Gating & Access Control Verified</span>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Modules</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/questions" className="hover:text-amber-400 transition-colors">100 Risk Questions Matrix</Link></li>
            <li><Link to="/courses" className="hover:text-amber-400 transition-colors">Executive Masterclasses</Link></li>
            <li><Link to="/templates" className="hover:text-amber-400 transition-colors">Digital Framework Library</Link></li>
            <li><Link to="/dashboard" className="hover:text-amber-400 transition-colors">Member Learning Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Compliance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/legal/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/legal/refunds" className="hover:text-slate-200 transition-colors">Refund & Access Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-white uppercase tracking-wider mb-4">Author's IP Statement</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Published work under author copyright. All 100 question taxonomy metrics, word guidance, and downloadable risk frameworks are proprietary IP.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-400">
            © {new Date().getFullYear()} Veritus Platform. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
