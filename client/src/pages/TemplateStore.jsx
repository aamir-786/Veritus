import React, { useState, useEffect } from 'react';
import { FileText, Download, Lock, Search, CheckCircle2, ShoppingCart } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function TemplateStore() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.getTemplates({ category, search });
      if (res.success) {
        setTemplates(res.templates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category, search]);

  const handleDownload = (tpl) => {
    if (!tpl.can_download) {
      addToCart({ ...tpl, type: 'Template' });
      return;
    }
    // Direct file download stream trigger
    window.open(`${API_BASE}/templates/download/${tpl.id}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-slate-900 bg-[#F8FAFC]">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase">
          <FileText className="w-3.5 h-3.5 text-emerald-700" /> Digital Risk Framework Library
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Paid Templates & Free Lead Magnets
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mt-4">
          Battle-tested spreadsheets, presentation decks, and audit checklists used by Fortune 500 risk leaders.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates by title or category..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-blue-900 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Frameworks & Spreadsheets', 'Board Reporting', 'Regulatory Templates'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === cat ? 'bg-blue-900 text-white shadow-2xs' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">Loading digital library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(tpl => (
            <div key={tpl.id} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {tpl.category}
                  </span>
                  {tpl.is_free ? (
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Free Entry-Point</span>
                  ) : (
                    <span className="text-xs font-extrabold text-emerald-800">${tpl.price} USD</span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 leading-snug">{tpl.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{tpl.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  {tpl.downloads_count} Downloads
                </div>

                <button
                  onClick={() => handleDownload(tpl)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    tpl.can_download 
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs' 
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-xs'
                  }`}
                >
                  {tpl.can_download ? (
                    <>
                      <Download className="w-3.5 h-3.5" /> Download File
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart — ${tpl.price}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal Removed in favor of CartDrawer */}
    </div>
  );
}
