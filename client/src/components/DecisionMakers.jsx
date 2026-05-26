import React, { useState } from 'react';
import { ExternalLink, Mail, Phone, Users, Copy, Check } from 'lucide-react';

export default function DecisionMakers({ people, outreach }) {
  const [activeMessage, setActiveMessage] = useState({ index: null, type: null });
  const [copied, setCopied] = useState(false);

  let peopleList = [];
  if (Array.isArray(people)) {
    peopleList = people;
  } else if (people && Array.isArray(people.decision_makers)) {
    peopleList = people.decision_makers;
  } else if (typeof people === 'object' && people !== null) {
    peopleList = Object.values(people);
  }

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (peopleList.length === 0) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <Users className="w-6 h-6 text-[#00D4FF]" />
        <h2 className="text-xl font-semibold text-white">Decision Makers</h2>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
        {peopleList.map((person, i) => (
          <div key={i} className="group bg-[#0A1428]/50 border border-white/5 rounded-xl p-4 transition-all">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-[#00D4FF]/20 to-[#0A1428] flex items-center justify-center border border-[#00D4FF]/30 text-[#00D4FF] font-bold text-lg">
                {getInitials(person.name || person.fullName || person.title || '??')}
              </div>
              <div>
                <h3 className="text-white font-semibold">{person.name || person.fullName || 'Unknown Name'}</h3>
                <p className="text-xs text-[#00D4FF] font-medium">{person.title || person.role || 'Key Executive'}</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
              <button 
                onClick={() => setActiveMessage(activeMessage.index === i && activeMessage.type === 'email' ? { index: null, type: null } : { index: i, type: 'email' })}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${activeMessage.index === i && activeMessage.type === 'email' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400'}`} 
                title="View Email Draft"
              >
                <Mail className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setActiveMessage(activeMessage.index === i && activeMessage.type === 'linkedin' ? { index: null, type: null } : { index: i, type: 'linkedin' })}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${activeMessage.index === i && activeMessage.type === 'linkedin' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400'}`} 
                title="View LinkedIn Hook"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Expandable Message Box */}
            {activeMessage.index === i && (
              <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5 relative group/copy animate-in slide-in-from-top-2 text-left">
                {activeMessage.type === 'email' ? (
                  <div className="text-xs space-y-2 pr-8">
                    <div>
                      <span className="font-bold text-[#00D4FF]">Subject:</span> {outreach.email_subject || 'No subject'}
                    </div>
                    <div className="border-t border-white/5 pt-2 whitespace-pre-line text-slate-300 leading-relaxed font-normal">
                      {outreach.email_body || 'No body generated.'}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300 pr-8 whitespace-pre-line leading-relaxed font-normal">
                    {outreach.linkedin_message || "No LinkedIn message generated."}
                  </p>
                )}
                <button 
                  onClick={() => handleCopy(
                    activeMessage.type === 'email' 
                      ? `Subject: ${outreach.email_subject}\n\n${outreach.email_body}` 
                      : outreach.linkedin_message
                  )}
                  className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}