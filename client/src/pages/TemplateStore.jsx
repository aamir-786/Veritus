import React, { useState, useEffect } from 'react';
import { FileText, Download, Lock, Search, Filter, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

export default function TemplateStore() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutItem, setCheckoutItem] = useState(null);

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
      setCheckoutItem(tpl);
      return;
    }
    // Direct file download stream trigger
    window.open(`/api/v1/templates/download/${tpl.id}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <FileText className="w-4 h-4" /> Digital Risk Framework Library
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
          Paid Templates & Free Lead Magnets
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Battle-tested spreadsheets, presentation decks, and audit checklists used by Fortune 500 risk practitioners.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates by title or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Frameworks & Spreadsheets', 'Board Reporting', 'Regulatory Templates'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                category === cat ? 'bg-amber-500 text-black font-semibold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading digital library...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    {tpl.category}
                  </span>
                  {tpl.is_free ? (
                    <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Free Entry-Point</span>
                  ) : (
                    <span className="text-xs font-extrabold text-white">${tpl.price} USD</span>
                  )}
                </div>

                <h3 className="font-display font-bold text-lg text-white leading-snug">{tpl.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  {tpl.downloads_count} Downloads
                </div>

                <button
                  onClick={() => handleDownload(tpl)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    tpl.can_download 
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20' 
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                  }`}
                >
                  {tpl.can_download ? (
                    <>
                      <Download className="w-4 h-4" /> Download File
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Unlock — ${tpl.price}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkout Modal for Templates */}
      {checkoutItem && (
        <CheckoutModal
          item={checkoutItem}
          itemType="template"
          onClose={() => setCheckoutItem(null)}
          onSuccess={() => {
            setCheckoutItem(null);
            fetchTemplates();
          }}
        />
      )}

    </div>
  );
}
