import React from 'react';
import { Target, Activity } from 'lucide-react';

export default function PitchCommandCenter({ conclusion, market }) {
  const verdictConfig = {
    'Worth Pitching': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
    'Proceed With Caution': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    'Not Recommended': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  };

  const vConf = conclusion?.verdict ? (verdictConfig[conclusion.verdict] || verdictConfig['Proceed With Caution']) : verdictConfig['Proceed With Caution'];
  const score = parseInt(conclusion?.pitch_score || 0, 10);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4FF] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-pulse"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left: Verdict & Score */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center p-6 bg-[#0A1428]/50 rounded-2xl border border-white/5">
          <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-4">Strategic Verdict</h2>
          <div className={`px-6 py-2 rounded-full border ${vConf.border} ${vConf.bg} ${vConf.color} font-bold text-lg mb-6 text-center`}>
            {conclusion?.verdict || 'Analysis Complete'}
          </div>
          
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="80" cy="80" r="74" fill="none" stroke={vConf.color.replace('text-', '').split('-')[0] === 'amber' ? '#F59E0B' : '#10B981'} strokeWidth="8" 
                strokeDasharray="465" strokeDashoffset={465 - (465 * score) / 10} 
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute text-center">
              <span className="text-5xl font-black text-white">{score}</span>
              <span className="text-xl text-slate-400">/10</span>
            </div>
          </div>
        </div>

        {/* Middle: Summary */}
        <div className="lg:col-span-4 flex flex-col">
          <h3 className="flex items-center gap-2 text-[#00D4FF] font-semibold mb-4 border-b border-white/10 pb-2">
            <Target className="w-5 h-5" /> Executive Summary
          </h3>
          <div className="text-sm text-slate-300 leading-relaxed bg-[#0A1428]/40 p-5 rounded-xl border border-white/5 flex-grow">
            {conclusion?.summary || 'No summary data available.'}
          </div>
        </div>

        {/* Right: Market Perception */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 flex-grow">
            <h4 className="text-xs font-bold tracking-widest text-purple-400 uppercase flex items-center justify-between mb-4">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Market Perception</span>
              <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">{market?.perception_score || 0}/10</span>
            </h4>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{market?.brand_perception || 'N/A'}</p>
          </div>
        </div>

      </div>

      {/* StepOne Opportunity Angle */}
      {conclusion?.stepone_opportunity_angle && (
        <div className="mt-6 relative z-10 bg-gradient-to-r from-[#00D4FF]/10 to-purple-500/10 border border-[#00D4FF]/20 rounded-2xl p-5">
          <h4 className="text-xs font-bold tracking-widest text-[#00D4FF] uppercase mb-2">🎯 StepOne Opportunity Angle</h4>
          <p className="text-sm text-white/90 leading-relaxed font-medium">{conclusion.stepone_opportunity_angle}</p>
        </div>
      )}

      {/* Recommended Actions */}
      <div className="mt-6 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {conclusion?.best_opportunity && (
          <div className="bg-[#0A1428]/50 border border-emerald-500/20 rounded-xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-2">Best Opportunity</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{conclusion.best_opportunity}</p>
          </div>
        )}
        {conclusion?.best_time_to_pitch && (
          <div className="bg-[#0A1428]/50 border border-amber-500/20 rounded-xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-2">Best Time to Pitch</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{conclusion.best_time_to_pitch}</p>
          </div>
        )}
        {conclusion?.recommended_first_step && (
          <div className="bg-[#0A1428]/50 border border-[#00D4FF]/20 rounded-xl p-4">
            <h4 className="text-[10px] font-bold tracking-widest text-[#00D4FF] uppercase mb-2">Recommended First Step</h4>
            <p className="text-xs text-slate-300 leading-relaxed">{conclusion.recommended_first_step}</p>
          </div>
        )}
      </div>

    </section>
  );
}