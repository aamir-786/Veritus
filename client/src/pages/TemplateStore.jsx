import React, { useState, useEffect } from 'react';
import { FileText, Download, Lock, Search, CheckCircle2, ShoppingCart, Star } from 'lucide-react';
import { api, API_BASE } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import ReviewModal from '../components/ReviewModal';

export default function TemplateStore() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);

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

  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (tpl) => {
    if (!tpl.can_download) {
      addToCart({ ...tpl, type: 'Template' });
      return;
    }
    
    try {
      setDownloadingId(tpl.id);
      const { blob, filename } = await api.downloadTemplateFile(tpl.id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert(err.message || 'Failed to download template. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900 bg-[#F8FAFC] min-h-screen">
      <Helmet>
        <title>Digital Templates | Veritus</title>
        <meta name="description" content="Download premium risk management frameworks, policies, and checklists." />
      </Helmet>
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs font-bold uppercase">
          <FileText className="w-3.5 h-3.5 text-emerald-700" /> Digital Risk Framework Library
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Paid Templates & Free Lead Magnets
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
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
          {['All', 'Frameworks & Spreadsheets', 'Board Reporting', 'Regulatory Templates', 'Banking & Fintech', 'Healthcare & SaaS'].map(cat => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(tpl => (
            <div key={tpl.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs h-full">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {tpl.category}
                  </span>
                  {tpl.is_free ? (
                    <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Free Entry</span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-emerald-800">${tpl.price} USD</span>
                  )}
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 leading-snug">{tpl.title}</h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-normal line-clamp-3">{tpl.description}</p>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 mt-auto">
                <div className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
                  {tpl.downloads_count} Downloads
                </div>

                <div className="flex gap-2 w-full xl:w-auto">
                  {user && tpl.can_download && (
                    <button
                      onClick={() => {
                        setReviewProduct(tpl);
                        setIsReviewOpen(true);
                      }}
                      className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      title="Leave a Review"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(tpl)}
                    disabled={downloadingId === tpl.id}
                    className={`px-3 py-1.5 w-full xl:w-auto rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      downloadingId === tpl.id 
                        ? 'bg-slate-100 text-slate-400 cursor-wait' 
                        : tpl.can_download 
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-xs' 
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-xs'
                    }`}
                  >
                    {downloadingId === tpl.id ? (
                      <span className="flex items-center gap-2 animate-pulse">
                        Downloading...
                      </span>
                    ) : tpl.can_download ? (
                      <>
                        <Download className="w-3 h-3" /> Download File
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3" /> Add — ${tpl.price}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setTimeout(() => setReviewProduct(null), 300); // clear after animation
        }}
        productType="template"
        productId={reviewProduct?.id}
        productName={reviewProduct?.title}
      />
    </div>
  );
}
