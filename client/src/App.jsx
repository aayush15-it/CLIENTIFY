import React, { useState, useRef } from 'react'
import { Sparkles, Building2, Search, ShieldAlert, Calendar, ArrowRight, UserCheck, Flame, Compass } from 'lucide-react'
import PitchCommandCenter from './components/PitchCommandCenter'
import MarketOverview from './components/MarketOverview'
import BrandActivity from './components/BrandActivity'
import CompetitorMapping from './components/CompetitorMapping'
import EventsFootprint from './components/EventsFootprint'
import Watchouts from './components/Watchouts'
import DecisionMakers from './components/DecisionMakers'
import PersonalizedOutreach from './components/PersonalizedOutreach'
import OutreachTracking from './components/OutreachTracking'

export default function App() {
  const [industry, setIndustry] = useState('')
  const [loadingIndustry, setLoadingIndustry] = useState(false)
  const [discoveryData, setDiscoveryData] = useState(null)
  const [industryError, setIndustryError] = useState('')

  // Company level states
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [loadingCompany, setLoadingCompany] = useState(false)
  const [companyData, setCompanyData] = useState(null)
  const [companyError, setCompanyError] = useState('')
  const [activeTab, setActiveTab] = useState('pitch')
  const [selectedDMIndex, setSelectedDMIndex] = useState(0)

  const companyResultsRef = useRef(null)

  const handleDiscover = async (e) => {
    e.preventDefault()
    if (!industry.trim()) return

    setLoadingIndustry(true)
    setIndustryError('')
    setDiscoveryData(null)
    setSelectedCompany(null)
    setCompanyData(null)
    setCompanyError('')

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to discover industry prospects. Please try again.')
      }

      setDiscoveryData(result)
    } catch (err) {
      setIndustryError(err.message)
    } finally {
      setLoadingIndustry(false)
    }
  }

  const handleEnrichCompany = async (companyName, companySegment) => {
    setSelectedCompany(companyName)
    setLoadingCompany(true)
    setCompanyError('')
    setCompanyData(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: companyName, category: companySegment || industry }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.reason || result.error || 'Failed to enrich company data.')
      }

      setCompanyData(result)
      setSelectedDMIndex(0)
      setActiveTab('pitch')

      // Smooth scroll to results
      setTimeout(() => {
        companyResultsRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      setCompanyError(err.message)
    } finally {
      setLoadingCompany(false)
    }
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-[#00D4FF]/30 selection:text-white pb-20">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Sticky Header */}
      <header className="border-b border-white/5 bg-[#050b14]/75 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00D4FF] to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white uppercase bg-clip-text">
                Clientify
              </span>
              <span className="hidden sm:inline-block ml-3 px-2 py-0.5 text-[10px] font-bold bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] rounded-full uppercase tracking-widest">
                AI SDR Dashboard
              </span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium hidden md:flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Live Prospecting Agents Active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        
        {/* Industry Discovery Panel */}
        <section className="bg-gradient-to-br from-[#0b172a] to-[#050b14] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-[80px]"></div>
          <div className="max-w-3xl relative z-10">
            <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
              Smarter client acquisition starts here.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
              Enter any industry niche to dynamically discover top active brands and industry conferences. Our multi-agent intelligence platform conducts live web fetching, maps competitors, identifies key contacts, and drafts context-enriched cold outreach.
            </p>
          </div>

          <form onSubmit={handleDiscover} className="grid grid-cols-1 sm:grid-cols-12 gap-4 relative z-10">
            <div className="sm:col-span-9 relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Industry / Niche</label>
              <div className="relative">
                <Compass className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF] transition-all text-sm font-medium"
                  placeholder="e.g. EdTech, Healthcare, Creator Economy, Gaming, Clean Energy"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={loadingIndustry}
                className="w-full bg-gradient-to-r from-[#00D4FF] to-indigo-600 hover:from-[#00D4FF]/90 hover:to-indigo-600/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loadingIndustry ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Discovering...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Industry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Industry Discovery Error */}
        {industryError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in duration-300">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-bold text-sm">Discovery Failed</h4>
              <p className="text-red-300/80 text-xs mt-1 leading-relaxed">{industryError}</p>
            </div>
          </div>
        )}

        {/* Loading Industry Discovery */}
        {loadingIndustry && (
          <div className="space-y-6 animate-pulse">
            <h3 className="h-6 w-48 bg-white/5 rounded"></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-40 bg-white/5 border border-white/5 rounded-2xl"></div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Results */}
        {discoveryData && (
          <div className="space-y-10 animate-in fade-in duration-500">
            
            {/* Prospects Grid */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#00D4FF]" />
                <h2 className="text-2xl font-bold text-white">Discovered Prospects (Min 10 Brands)</h2>
              </div>
              <p className="text-sm text-slate-400">Dynamically queried and validated live public entities. Select a company to enrich contacts and generate custom outreach sequences.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {discoveryData.prospects?.map((company, idx) => (
                  <div 
                    key={idx} 
                    className={`bg-white/5 border rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-500/40 hover:bg-white/10 transition-all ${
                      selectedCompany === company.name ? 'border-[#00D4FF]/80 ring-1 ring-[#00D4FF]' : 'border-white/5'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-white text-lg">{company.name}</h3>
                        <div className="flex items-center gap-2">
                          {company.priority_score && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              company.priority_score >= 8 ? 'bg-emerald-500/20 text-emerald-400' : 
                              company.priority_score >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {company.priority_score}/10
                            </span>
                          )}
                          <span className="text-[10px] bg-indigo-500/20 text-[#00D4FF] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {company.segment || 'Prospect'}
                          </span>
                        </div>
                      </div>
                      {company.hq && (
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">📍 {company.hq}</p>
                      )}
                      {company.recent_activity && (
                        <p className="text-[10px] text-purple-300/80 mb-2 italic">⚡ {company.recent_activity}</p>
                      )}
                      <p className="text-slate-300 text-xs leading-relaxed mb-4">{company.rationale}</p>
                    </div>

                    <button
                      onClick={() => handleEnrichCompany(company.name, company.segment)}
                      disabled={loadingCompany}
                      className="mt-2 self-start flex items-center gap-2 text-xs font-bold text-[#00D4FF] hover:text-[#00D4FF]/80 transition-colors uppercase tracking-wider group cursor-pointer disabled:opacity-50"
                    >
                      {loadingCompany && selectedCompany === company.name ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
                          <span>Enriching Pipeline...</span>
                        </>
                      ) : (
                        <>
                          <span>Enrich &amp; Generate Outreach</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Events Mapping */}
            {discoveryData.events && discoveryData.events.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-fuchsia-400" />
                  <h2 className="text-2xl font-bold text-white">Upcoming Industry Events &amp; Attendees</h2>
                </div>
                <p className="text-sm text-slate-400">Events related to {discoveryData.industry} with attendee predictions mapped from recent sponsorships.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {discoveryData.events.map((event, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-fuchsia-500/20 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-white text-base">{event.name}</h3>
                        <span className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest bg-fuchsia-500/10 px-2 py-0.5 rounded">
                          {event.date}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mb-3 font-semibold uppercase">{event.location}</div>
                      <p className="text-slate-300 text-xs leading-relaxed mb-2">{event.description}</p>
                      {event.why_attend && (
                        <p className="text-[10px] text-[#00D4FF]/80 mb-4 italic">🎯 {event.why_attend}</p>
                      )}
                      {!event.why_attend && <div className="mb-4" />}
                      <div className="mt-auto pt-3 border-t border-white/5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Predicted Attendees:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {event.predicted_attendees?.split(',').map((att, i) => (
                            <span key={i} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-slate-300 border border-white/5 font-medium">
                              {att.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Company Enrichment Results Anchor */}
        <div ref={companyResultsRef} className="pt-2"></div>

        {/* Company Level Loading State */}
        {loadingCompany && (
          <div className="bg-[#0b172a]/70 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="w-10 h-10 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-white font-bold">Assembling Brand Intelligence Pipeline</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-md">Running Validate, Research, Contact Enrichment, Outreach Copywriter, and Sequence Tracking agents dynamically for {selectedCompany}...</p>
            </div>
          </div>
        )}

        {/* Company Enrichment Error */}
        {companyError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in duration-300">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-bold text-sm">Enrichment Failed</h4>
              <p className="text-red-300/80 text-xs mt-1 leading-relaxed">{companyError}</p>
            </div>
          </div>
        )}

        {/* Company Dashboard */}
        {companyData && !loadingCompany && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#050b14] px-4 text-xs font-black text-slate-500 uppercase tracking-widest">Enriched Intelligence Profiles</span>
              </div>
            </div>

            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-white">{companyData.company}</h2>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                    {companyData.category}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-1">Multi-agent deep profiling completed successfully.</p>
              </div>

              {/* Tab navigation */}
              <div className="flex flex-wrap gap-1 bg-[#0A1428]/80 border border-white/5 p-1 rounded-xl self-start">
                <button
                  onClick={() => setActiveTab('pitch')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'pitch'
                      ? 'bg-gradient-to-r from-[#00D4FF] to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Overview &amp; Verdict
                </button>
                <button
                  onClick={() => setActiveTab('market')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'market'
                      ? 'bg-gradient-to-r from-[#00D4FF] to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Activity &amp; Events
                </button>
                <button
                  onClick={() => setActiveTab('competitors')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'competitors'
                      ? 'bg-gradient-to-r from-[#00D4FF] to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Competitors &amp; Risks
                </button>
                <button
                  onClick={() => setActiveTab('outreach')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'outreach'
                      ? 'bg-gradient-to-r from-[#00D4FF] to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Outreach Sequence
                </button>
              </div>
            </div>

            {/* Content Tabs */}
            {activeTab === 'pitch' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                <PitchCommandCenter conclusion={companyData.conclusion} market={companyData.market} />
                <MarketOverview overview={companyData.overview} market={companyData.market} />
              </div>
            )}

            {activeTab === 'market' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                <BrandActivity activity={companyData.activity} />
                <EventsFootprint events={companyData.events} />
              </div>
            )}

            {activeTab === 'competitors' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                <CompetitorMapping competitors={companyData.competitors} />
                <Watchouts watchouts={companyData.watchouts} />
              </div>
            )}

            {activeTab === 'outreach' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                <div className="lg:col-span-4">
                  <DecisionMakers 
                    people={companyData.people} 
                    selectedDMIndex={selectedDMIndex}
                    setSelectedDMIndex={setSelectedDMIndex}
                  />
                </div>
                <div className="lg:col-span-8 space-y-8">
                  <PersonalizedOutreach 
                    outreach={companyData.people?.decision_makers?.[selectedDMIndex]?.outreach} 
                    dmName={companyData.people?.decision_makers?.[selectedDMIndex]?.name}
                    dmTitle={companyData.people?.decision_makers?.[selectedDMIndex]?.title}
                  />
                  <OutreachTracking tracking={companyData.tracking} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}