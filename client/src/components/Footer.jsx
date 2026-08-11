import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, BookOpen, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-lg text-white">VERITUS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Executive Knowledge & Decision Platform built on <em>Deciding in the Dark</em>'s 100 structured risk questions and 7-way taxonomy.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium pt-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Strict Gating & Access Control Verified</span>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-3">Platform Modules</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/questions" className="hover:text-white transition-colors">100 Risk Questions Matrix</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">Executive Masterclasses</Link></li>
            <li><Link to="/templates" className="hover:text-white transition-colors">Digital Framework Library</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Member Learning Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-3">Legal & Governance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy & Data Policy</Link></li>
            <li><Link to="/legal/refunds" className="hover:text-white transition-colors">Refund & Access Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider mb-3">Effective RM Ecosystem</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aligned with the Effective RM family of products: EffectiveRM, Wahid AI, RiskBridge, and Maturity1.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            © {new Date().getFullYear()} Veritus Platform. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}
