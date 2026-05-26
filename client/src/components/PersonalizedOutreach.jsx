import React, { useState } from 'react';
import { Send, Copy, Check, Mail, MessageSquare, Sparkles, Award } from 'lucide-react';

export default function PersonalizedOutreach({ outreach, dmName, dmTitle, activeTone, onToneChange, loading }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!outreach || Object.keys(outreach).length === 0) return null;

  const fullEmailText = `Subject: ${outreach.email_subject || ''}\n\n${outreach.email_body || ''}`;
  const confidence = parseInt(outreach.outreach_confidence || 85, 10);

  return (
    <div className="bg-gradient-to-r from-emerald-950/20 to-[#0A1428]/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)] flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
      
      {/* Title block with Tone Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Send className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Personalized Outreach</h2>
            {dmName && (
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted at: <span className="text-emerald-400 font-semibold">{dmName}</span> ({dmTitle || 'Executive'})
              </p>
            )}
          </div>
        </div>

        {/* Tone Selector Dropdown */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl self-start">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tone:</span>
          <select
            value={activeTone || 'professional'}
            onChange={(e) => onToneChange(e.target.value)}
            disabled={loading}
            className="bg-transparent border-none text-[#00D4FF] font-bold text-xs focus:outline-none cursor-pointer"
          >
            <option value="professional">👔 Professional</option>
            <option value="startup">🚀 Startup</option>
            <option value="enterprise">🏢 Enterprise</option>
            <option value="aggressive sales">🔥 Aggressive Sales</option>
          </select>
        </div>
      </div>

      {/* GTM Metadata Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/30 border border-white/5 rounded-xl p-4 text-xs">
        <div className="flex items-center justify-between md:flex-col md:items-start gap-1">
          <span className="text-slate-400 font-medium">Confidence Score</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full" style={{ width: `${confidence}%` }}></div>
            </div>
            <span className="text-emerald-400 font-bold">{confidence}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between md:flex-col md:items-start gap-1 border-t border-white/5 pt-2 md:border-t-0 md:pt-0 md:border-l md:pl-4">
          <span className="text-slate-400 font-medium">Outreach Intent</span>
          <span className="text-white font-bold flex items-center gap-1 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00D4FF]" /> {outreach.intent_category || 'Trigger-based Outbound'}
          </span>
        </div>
        <div className="flex items-center justify-between md:flex-col md:items-start gap-1 border-t border-white/5 pt-2 md:border-t-0 md:pt-0 md:border-l md:pl-4">
          <span className="text-slate-400 font-medium">Suggested CTA</span>
          <span className="text-white font-bold flex items-center gap-1 mt-0.5">
            <Award className="w-3.5 h-3.5 text-purple-400" /> {outreach.suggested_cta || '15-minute call'}
          </span>
        </div>
      </div>

      {/* Message Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {loading && (
          <div className="absolute inset-0 bg-[#0A1428]/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-emerald-400 font-bold">Regenerating Tone...</span>
          </div>
        )}

        {/* Email Outreach Block */}
        <div className="bg-black/35 border border-white/5 rounded-xl p-5 relative group flex flex-col justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3">
              <Mail className="w-4 h-4" /> Email Outreach
            </h3>
            
            <div className="mb-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Subject</span>
              <p className="text-sm text-white font-semibold leading-relaxed">
                {outreach.email_subject || 'No subject generated.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Body</span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {outreach.email_body || 'No email body generated.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
            <button 
              onClick={() => handleCopy(fullEmailText, 'email')} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer border border-white/5"
            >
              {copied === 'email' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Email</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LinkedIn Outreach Block */}
        <div className="bg-black/35 border border-white/5 rounded-xl p-5 relative group flex flex-col justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#00D4FF] uppercase mb-3">
              <MessageSquare className="w-4 h-4" /> LinkedIn Outreach
            </h3>
            
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Hook / Message</span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {outreach.linkedin_message || 'No LinkedIn message generated.'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
            <button 
              onClick={() => handleCopy(outreach.linkedin_message, 'linkedin')} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer border border-white/5"
            >
              {copied === 'linkedin' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied Hook</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hook</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}