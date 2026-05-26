import React, { useState } from 'react';
import { Send, Copy, Check, Mail, MessageSquare } from 'lucide-react';

export default function PersonalizedOutreach({ outreach, dmName, dmTitle }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!outreach || Object.keys(outreach).length === 0) return null;

  const fullEmailText = `Subject: ${outreach.email_subject || ''}\n\n${outreach.email_body || ''}`;

  return (
    <div className="bg-gradient-to-r from-emerald-900/40 to-[#0A1428] border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
      <div className="flex items-center justify-between mb-6 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Send className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Personalized Outreach</h2>
            {dmName && (
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted at: <span className="text-emerald-400 font-semibold">{dmName}</span> ({dmTitle || 'Key Executive'})
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Outreach Block */}
        <div className="bg-black/35 border border-white/5 rounded-xl p-5 relative group flex flex-col justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3">
              <Mail className="w-4 h-4" /> Email Outreach
            </h3>
            
            <div className="mb-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Subject</span>
              <p className="text-sm text-white font-semibold">
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