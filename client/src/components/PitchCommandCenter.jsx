import React from 'react';
import { Target, ShieldAlert, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PitchCommandCenter({ conclusion, market }) {
  const verdictConfig = {
    'Strongly Recommend': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    'Proceed With Caution': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    'Low Priority': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    'Worth Pitching': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    'Not Recommended': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' }
  };

  const recType = conclusion?.recommendation_type || conclusion?.verdict || 'Proceed With Caution';
  const vConf = verdictConfig[recType] || verdictConfig['Proceed With Caution'];
  const score = parseInt(conclusion?.pitch_score || 0, 10);
  const confidenceScore = parseInt(conclusion?.ai_confidence_score || 75, 10);
  const compScore = parseInt((market?.perception_score || 5) * 10, 10);

  const chartData = [
    { name: 'GTM Score', value: score * 10, fill: 'url(#gtmGrad)' },
    { name: 'AI Confidence', value: confidenceScore, fill: 'url(#confGrad)' },
    { name: 'Compatibility', value: compScore, fill: 'url(#compGrad)' }
  ];

  return (
    <section className="relative overflow-hidden bg-[#0A1428]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF]/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch relative z-10">
        
        {/* Left: Verdict and Weighted Scoring */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 bg-[#0b172a]/70 rounded-2xl border border-white/5">
          <div>
            <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#00D4FF]" /> Strategic Verdict
            </h2>
            <div className={`w-full py-2.5 px-4 rounded-xl border ${vConf.border} ${vConf.bg} ${vConf.color} font-black text-center text-sm uppercase tracking-wider mb-5`}>
              {recType}
            </div>
          </div>
          
          <div className="space-y-3.5 my-auto">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-slate-400 font-medium">Opportunity Rating</span>
              <span className="text-white font-bold">{conclusion?.opportunity_rating || 'Good'}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-slate-400 font-medium">Risk Level</span>
              <span className={`font-bold ${conclusion?.risk_level === 'High' ? 'text-red-400' : conclusion?.risk_level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {conclusion?.risk_level || 'Medium'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-slate-400 font-medium">Market Sentiment</span>
              <span className={`font-bold ${conclusion?.market_sentiment === 'Positive' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {conclusion?.market_sentiment || 'Positive'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">AI Confidence Score</span>
              <span className="text-white font-bold">{confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* Middle: Recharts GTM Analytics */}
        <div className="lg:col-span-4 flex flex-col p-5 bg-[#0b172a]/70 rounded-2xl border border-white/5 min-h-[220px]">
          <h3 className="text-xs font-bold tracking-widest text-[#00D4FF] uppercase mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00D4FF]" /> GTM Scoring Matrix
          </h3>
          <div className="flex-grow w-full h-full min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gtmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00D4FF" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#005C80" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4C1D95" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#064E3B" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1428', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Executive Summary & Perception */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-[#0b172a]/70 border border-white/5 rounded-2xl p-5 flex-grow">
            <h3 className="flex items-center gap-2 text-[#00D4FF] text-xs font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-2">
              <Target className="w-4 h-4" /> Executive Rationale
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {conclusion?.summary || 'No summary data available.'}
            </p>
          </div>
        </div>

      </div>

      {/* Clientify GTM Strategy */}
      {(conclusion?.clientify_gtm_strategy || conclusion?.stepone_opportunity_angle) && (
        <div className="mt-5 relative z-10 bg-gradient-to-r from-[#00D4FF]/10 to-purple-500/10 border border-[#00D4FF]/20 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#00D4FF] uppercase mb-1">🎯 Clientify GTM Strategy</h4>
            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              {conclusion.clientify_gtm_strategy || conclusion.stepone_opportunity_angle}
            </p>
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="mt-4 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {conclusion?.best_opportunity && (
          <div className="bg-[#0A1428]/60 border border-emerald-500/20 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-1">Best Opportunity</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{conclusion.best_opportunity}</p>
          </div>
        )}
        {conclusion?.best_time_to_pitch && (
          <div className="bg-[#0A1428]/60 border border-amber-500/20 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-1">Best Time to Pitch</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{conclusion.best_time_to_pitch}</p>
          </div>
        )}
        {conclusion?.recommended_first_step && (
          <div className="bg-[#0A1428]/60 border border-[#00D4FF]/20 rounded-2xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-[#00D4FF] uppercase mb-1">Recommended First Step</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{conclusion.recommended_first_step}</p>
          </div>
        )}
      </div>

    </section>
  );
}