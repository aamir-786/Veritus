import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, BookOpen, ExternalLink, Compass, FileText, LayoutDashboard, Sparkles, Layers } from 'lucide-react';
import EffectiveVeritusLogo from './EffectiveVeritusLogo';

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-slate-800 overflow-hidden">
      
      {/* Background Architectural Cityscape / Glass Tower Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-luminosity"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80')` }}
      />

      {/* Subtle Dot Matrix Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Platform Intro with Light Logo Variant */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="block group w-fit">
              <EffectiveVeritusLogo variant="light" subtitle={true} />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-normal pt-1">
              Executive Knowledge & Decision Platform built on <em>Deciding in the Dark</em>'s 100 structured risk questions and 7-way taxonomy.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60 w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>Strict Gating & Access Control Verified</span>
            </div>
          </div>

          {/* Platform Modules */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/questions" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" /> 100 Risk Questions Matrix
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Executive Masterclasses
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Digital Framework Library
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-300 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" /> Member Learning Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Legal & Governance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/refunds" className="hover:text-white transition-colors">
                  Refund & Access Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/ecosystem" className="hover:text-white transition-colors">
                  Ecosystem Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Effective RM Ecosystem */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Effective RM Ecosystem
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Aligned with the Effective RM family of products:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <Link to="/legal/ecosystem" className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700 hover:bg-slate-700">EffectiveRM</Link>
              <Link to="/legal/ecosystem" className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700 hover:bg-slate-700">Wahid AI</Link>
              <Link to="/legal/ecosystem" className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700">RiskBridge</Link>
              <Link to="/legal/ecosystem" className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 hover:bg-slate-700">MaturityOne</Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Veritus Platform. All rights reserved. Built on <em>Deciding in the Dark</em> author IP.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/legal/terms" className="hover:text-slate-300">Terms</Link>
            <span>•</span>
            <Link to="/legal/privacy" className="hover:text-slate-300">Privacy</Link>
            <span>•</span>
            <Link to="/legal/refunds" className="hover:text-slate-300">Refunds</Link>
            <span>•</span>
            <Link to="/legal/ecosystem" className="hover:text-slate-300">Ecosystem</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
