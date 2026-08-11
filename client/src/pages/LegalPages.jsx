import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, FileText, AlertCircle, Layers, Lock, ArrowRight, ExternalLink } from 'lucide-react';

export default function LegalPages() {
  const { docType } = useParams();

  const getDoc = () => {
    switch (docType) {
      case 'privacy':
        return {
          title: "Privacy & Data Protection Policy",
          summary: "Drafted for client review before publishing. We collect minimum required practitioner data.",
          bgImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80",
          sections: [
            {
              heading: "1. Data Collection & Handling",
              body: "We collect practitioner full names, corporate email addresses, and purchase transaction records necessary to deliver masterclass access, signed video streaming tokens, and downloadable risk templates."
            },
            {
              heading: "2. Card Data Non-Storage Non-Negotiable",
              body: "We NEVER handle or store credit or debit card numbers on our servers. All financial transactions are processed via 256-bit encrypted hosted checkouts (Stripe)."
            },
            {
              heading: "3. Enterprise Data Protection",
              body: "Practitioner data and AI Risk Copilot inputs are strictly isolated and never shared with third-party advertising networks or model trainers."
            }
          ]
        };
      case 'refunds':
        return {
          title: "Refund & Entitlement Access Policy",
          summary: "Drafted for client review. Digital products and masterclass access rules.",
          bgImage: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80",
          sections: [
            {
              heading: "1. 14-Day Executive Guarantee",
              body: "If an executive masterclass or digital template framework does not provide clear actionable quick-wins for your organization within 14 days, you are eligible for a full refund."
            },
            {
              heading: "2. Immediate Access Revocation",
              body: "Upon refund completion, account entitlements to gated video playback, closed captions, and downloadable template files will automatically fail closed."
            }
          ]
        };
      case 'ecosystem':
        return {
          title: "Effective RM Ecosystem Governance",
          summary: "Veritus is aligned with the Effective RM family of executive risk products.",
          bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
          isEcosystem: true,
          sections: []
        };
      default:
        return {
          title: "Terms of Service & Licensing",
          summary: "Drafted for client review. Operational standards for Veritus platform.",
          bgImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80",
          sections: [
            {
              heading: "1. Author Intellectual Property",
              body: "Deciding in the Dark content, the 100 risk questions dataset, 20,000+ words guidance, and 7-way taxonomy metrics are published proprietary work under author copyright. Users receive non-exclusive licenses for internal corporate decision-making."
            },
            {
              heading: "2. Account Security & Role Protection",
              body: "Users are responsible for maintaining the confidentiality of their login credentials. Admin accounts maintain studio access for content management."
            }
          ]
        };
    }
  };

  const doc = getDoc();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-16 space-y-8">
      
      {/* Visual Header Banner with Background Image */}
      <div className="relative pt-12 pb-16 bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('${doc.bgImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold uppercase">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Platform Governance & Legal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white">{doc.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">{doc.summary}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Client Review Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-900 shadow-2xs font-medium">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <p>
            <strong>Drafted for Client Review:</strong> Legal pages and ecosystem terms are presented in draft state for stakeholder sign-off before official domain deployment.
          </p>
        </div>

        {/* Ecosystem Specific Display */}
        {doc.isEcosystem ? (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-slate-200 space-y-3 bg-white shadow-xs">
              <h2 className="font-display text-xl font-bold text-slate-900">The Effective RM Product Suite</h2>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Veritus connects directly into the Effective RM ecosystem to provide unified risk governance, AI decision support, and maturity benchmarking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Product 1: EffectiveRM */}
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    EffectiveRM
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">Effective RM Core Platform</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enterprise risk management methodologies, key risk indicators (KRIs), and board oversight frameworks.
                </p>
                <div className="pt-2 text-xs font-bold text-blue-900 flex items-center gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Product 2: Wahid AI */}
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Wahid AI
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">Wahid AI Assistant</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Contextual AI risk decision model designed specifically for CROs, compliance leaders, and risk committees.
                </p>
                <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Product 3: RiskBridge */}
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    RiskBridge
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">RiskBridge Integration</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bridging third-party technology vendor assessment with real-time operational risk telemetry.
                </p>
                <div className="pt-2 text-xs font-bold text-amber-800 flex items-center gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Product 4: MaturityOne */}
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                    MaturityOne
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900">MaturityOne Benchmarking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Benchmarking risk maturity scores across peer industry sectors and regulatory jurisdictions.
                </p>
                <div className="pt-2 text-xs font-bold text-indigo-800 flex items-center gap-1">
                  Learn More <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Standard Legal Document Sections */
          <div className="glass-card rounded-2xl p-8 border border-slate-200 bg-white space-y-6 shadow-xs">
            {doc.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-display text-lg font-bold text-slate-900">{sec.heading}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
