import React, { useState } from 'react';
import { ExternalLink, Mail, Users, Copy, Check, ShieldCheck, Globe, Star, Zap } from 'lucide-react';

export default function DecisionMakers({ people, selectedDMIndex, setSelectedDMIndex, website }) {
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
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSafeLink = (url, query) => {
    if (!url || url === 'Publicly unavailable') {
      return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    return url;
  };

  if (peopleList.length === 0) return null;

  return (
    <div className="bg-[#0A1428]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#00D4FF]" />
            <h2 className="text-xl font-semibold text-white">Decision Makers</h2>
          </div>
          {website && website !== 'Publicly unavailable' && (
            <a 
              href={website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Visit Website"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Website</span>
            </a>
          )}
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2 custom-scrollbar">
          {peopleList.map((person, i) => (
            <div 
              key={i} 
              onClick={() => setSelectedDMIndex(i)}
              className={`group bg-[#0b172a]/50 border rounded-xl p-4 transition-all cursor-pointer ${
                selectedDMIndex === i ? 'border-[#00D4FF]/80 ring-1 ring-[#00D4FF]/80 shadow-[0_0_15px_rgba(0,212,255,0.05)]' : 'border-white/5 hover:border-white/20'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-br from-[#00D4FF]/20 to-[#0A1428] flex items-center justify-center border border-[#00D4FF]/30 text-[#00D4FF] font-black text-base">
                  {getInitials(person.name || '??')}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-white font-bold text-sm group-hover:text-[#00D4FF] transition-colors">{person.name || 'Unknown Name'}</h3>
                    {person.verified_contact === 'verified' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" title="Verified Contact" />
                    )}
                  </div>
                  <p className="text-xs text-[#00D4FF] font-semibold mt-0.5">{person.title || 'Key Stakeholder'}</p>
                </div>
              </div>

              {/* Rationale Sentence */}
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed border-l-2 border-white/10 pl-2">
                {person.relevance || 'Strategic contact for lead outreach.'}
              </p>

              {/* Lead Scoring Panel */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-black/35 rounded-lg p-2.5 text-[10px] border border-white/5 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Priority</span>
                  <span className="text-white font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> #{person.priority_ranking || 1}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Likelihood</span>
                  <span className={`font-bold uppercase ${person.engagement_likelihood === 'High' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {person.engagement_likelihood || 'Medium'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Influence</span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-[#00D4FF] h-full" style={{ width: `${(person.influence_score || 5) * 10}%` }}></div>
                    </div>
                    <span className="text-white font-bold">{person.influence_score || 5}/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Relevance</span>
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full" style={{ width: `${(person.role_relevance_score || 5) * 10}%` }}></div>
                    </div>
                    <span className="text-white font-bold">{person.role_relevance_score || 5}/10</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions & Links */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDMIndex(i);
                      setActiveMessage(activeMessage.index === i && activeMessage.type === 'email' ? { index: null, type: null } : { index: i, type: 'email' });
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${activeMessage.index === i && activeMessage.type === 'email' ? 'bg-emerald-500/25 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400'}`} 
                    title="View Email Draft"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDMIndex(i);
                      setActiveMessage(activeMessage.index === i && activeMessage.type === 'linkedin' ? { index: null, type: null } : { index: i, type: 'linkedin' });
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border ${activeMessage.index === i && activeMessage.type === 'linkedin' ? 'bg-blue-500/25 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 hover:bg-blue-500/20 hover:text-blue-400 text-slate-400'}`} 
                    title="View LinkedIn Hook"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-1.5">
                  {person.linkedin && person.linkedin !== 'Publicly unavailable' && (
                    <a 
                      href={handleSafeLink(person.linkedin, `${person.name} LinkedIn`)}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-[#0077B5]/10 hover:bg-[#0077B5]/25 border border-[#0077B5]/20 rounded-md text-[#0077B5] transition-all"
                      title="LinkedIn Profile"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                    </a>
                  )}
                </div>
              </div>

              {/* Expandable Message Box */}
              {activeMessage.index === i && (
                <div className="mt-4 p-3 bg-black/45 rounded-lg border border-white/5 relative group/copy animate-in slide-in-from-top-2 text-left">
                  {activeMessage.type === 'email' ? (
                    <div className="text-xs space-y-2 pr-8">
                      <div>
                        <span className="font-bold text-[#00D4FF]">Subject:</span> {person.outreach?.email_subject || 'No subject'}
                      </div>
                      <div className="border-t border-white/5 pt-2 whitespace-pre-line text-slate-300 leading-relaxed font-normal">
                        {person.outreach?.email_body || 'No body generated.'}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 pr-8 whitespace-pre-line leading-relaxed font-normal">
                      {person.outreach?.linkedin_message || "No LinkedIn message generated."}
                    </p>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        activeMessage.type === 'email' 
                          ? `Subject: ${person.outreach?.email_subject}\n\n${person.outreach?.email_body}` 
                          : person.outreach?.linkedin_message
                      );
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors cursor-pointer border border-white/5"
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
    </div>
  );
}