import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, BookOpen, ExternalLink, Compass, FileText, LayoutDashboard, Sparkles, Layers } from 'lucide-react';
import EffectiveVeritusLogo from './EffectiveVeritusLogo';

export default function Footer() {
  return (
    <footer 
      className="relative text-slate-200 border-t border-slate-800/80 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 19, 43, 0.86), rgba(15, 23, 42, 0.94)), url('/images/footer_vibrant_bg.png')`
      }}
    >
      
      {/* Subtle Dot Matrix Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#3874CB_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Platform Intro with Light Logo Variant */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="block group w-fit">
              <EffectiveVeritusLogo variant="light" subtitle={true} />
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed font-normal pt-1">
              Executive Knowledge & Decision Platform built on <em>Deciding in the Dark</em>'s 100 structured risk questions and 7-way taxonomy.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-700/50 w-fit shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Strict Gating & Access Control Verified</span>
            </div>
          </div>

          {/* Platform Modules */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/questions" className="hover:text-blue-300 transition-colors flex items-center gap-2 group">
                  <Compass className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" /> 100 Risk Questions Matrix
                </Link>
              </li>
              <li>
                <Link to="/courses" className="hover:text-blue-300 transition-colors flex items-center gap-2 group">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" /> Executive Masterclasses
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-blue-300 transition-colors flex items-center gap-2 group">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" /> Digital Framework Library
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-300 transition-colors flex items-center gap-2 group">
                  <LayoutDashboard className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" /> Member Learning Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Legal & Governance
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
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
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Aligned with the Effective RM family of products:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <a href="https://effectiverm.com/" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-blue-300 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-xs flex items-center gap-1">
                EffectiveRM <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
              <a href="https://wahidai.com/" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-emerald-300 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-xs flex items-center gap-1">
                Wahid AI <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
              <a href="https://riskbridge.com.au/" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-amber-300 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-xs flex items-center gap-1">
                RiskBridge <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
              <a href="https://maturityone.com/" target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-slate-900/80 text-indigo-300 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-xs flex items-center gap-1">
                MaturityOne <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Veritus Platform. All rights reserved. Built on <em>Deciding in the Dark</em> author IP.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/legal/refunds" className="hover:text-white transition-colors">Refunds</Link>
            <span>•</span>
            <Link to="/legal/ecosystem" className="hover:text-white transition-colors">Ecosystem</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
