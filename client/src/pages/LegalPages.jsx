import React from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, FileText, AlertCircle } from 'lucide-react';

export default function LegalPages() {
  const { docType } = useParams();

  const getDoc = () => {
    switch (docType) {
      case 'privacy':
        return {
          title: "Privacy & Customer Data Policy",
          summary: "Drafted for client review before publishing. We collect minimum required practitioner data.",
          content: `### 1. Data Collection & Handling\nWe collect practitioner names, business email addresses, and purchase transaction records required to deliver masterclass access and downloadable risk templates.\n\n### 2. Payment Data Non-Storage\nWe NEVER store credit or debit card numbers on our servers. All transaction details are processed via hosted 256-bit encrypted checkout providers.`
        };
      case 'refunds':
        return {
          title: "Refund & Entitlement Access Policy",
          summary: "Drafted for client review. Digital products and template access rules.",
          content: `### 1. 14-Day Guarantee\nIf an executive masterclass or digital template framework does not provide clear actionable guidance for your organization within 14 days, you are eligible for a full refund.\n\n### 2. Immediate Access Revocation\nUpon refund completion, account access to gated video playback and template files will fail closed.`
        };
      default:
        return {
          title: "Terms of Service",
          summary: "Drafted for client review. Operational standards for Veritus platform.",
          content: `### 1. Author Intellectual Property\nDeciding in the Dark content, the 100 risk questions dataset, and 7-way taxonomy metrics are published proprietary work. Users receive non-exclusive licenses for internal corporate use.`
        };
    }
  };

  const doc = getDoc();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-300">
          <strong>Drafted for Client Review:</strong> Legal terms are presented in draft state for stakeholder sign-off and domain deployment.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-slate-800 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">{doc.title}</h1>
          <p className="text-xs text-slate-400 mt-1">{doc.summary}</p>
        </div>

        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-6">
          {doc.content}
        </div>
      </div>
    </div>
  );
}
