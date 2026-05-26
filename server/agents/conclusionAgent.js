const { getChatCompletion } = require('../utils/aiClient')

async function conclusionAgent(company, research, people, outreach) {
  const competitors    = research?.competitors || []
  const watchouts      = research?.watchouts   || []
  const activity       = research?.activity    || []
  const market         = research?.market      || {}
  const overview       = research?.overview    || {}
  const decisionMakers = people?.decision_makers || []

  const highWatchouts = watchouts.filter(w => w.severity === 'high').length
  const medWatchouts  = watchouts.filter(w => w.severity === 'medium').length
  const hasContacts   = decisionMakers.length >= 2
  const hasCampaigns  = activity.length >= 2
  const sentimentGood = market.consumer_sentiment === 'positive'
  const score         = market.perception_score || 5

  const res = await getChatCompletion({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior B2B sales development strategist at Clientify, an AI-powered Go-To-Market (GTM) sales intelligence SaaS.
Your job is to evaluate whether a company is worth pitching Clientify's services to right now for outbound pipeline growth, lead enrichment, GTM strategies, or sales automation.
Return ONLY valid JSON. No backticks. No explanation outside JSON.
Be direct, analytical, and specific. Base your verdict strictly on the data provided.
NEVER fabricate claims. If data is insufficient, say so honestly.`
      },
      {
        role: 'user',
        content: `Evaluate whether Clientify should pitch our GTM sales SaaS to "${company}" right now.

Here is the full intelligence we have gathered:

COMPANY OVERVIEW:
Business model: ${overview.business_model}
Scale: ${overview.scale}
Positioning: ${overview.positioning}
Revenue: ${overview.revenue_scale}

MARKET POSITION:
Brand perception score: ${score} out of 10
Consumer sentiment: ${market.consumer_sentiment}
Market share: ${market.market_share_est}
Recent shifts: ${market.recent_shifts}

COMPETITORS:
${competitors.map(c => `- ${c.name}: strength is ${c.strength}, gap is ${c.gap}`).join('\n')}

BRAND ACTIVITY:
${activity.map(a => `- ${a.name} (${a.period}): ${a.description}`).join('\n')}

STRATEGIC WATCHOUTS:
${watchouts.map(w => `- ${w.title} [${w.severity}]: ${w.description}`).join('\n')}

DECISION MAKERS FOUND: ${decisionMakers.length} people identified
CONTACTS AVAILABLE: ${hasContacts ? 'Yes — we have real contacts' : 'Limited — contacts need verification'}

CLIENTIFY GTM VALUE PROPOSITIONS WE CAN PITCH:
- AI-driven GTM strategy & prospect discovery
- Real-time stakeholder enrichment and tracking
- Competitor weakness analysis and sales triggers capture
- Hyper-personalized email/LinkedIn outreach generation
- GTM workflow automation & sequence management

Based on ALL of this real data return ONLY this JSON structure:
{
  "verdict": "Worth Pitching" or "Proceed With Caution" or "Not Recommended",
  "confidence": "High" or "Medium" or "Low",
  "pitch_score": a number from 1 to 10 representing how strongly we recommend pitching,
  "ai_confidence_score": a number from 1 to 100 representing our strategic calculation accuracy,
  "opportunity_rating": "Excellent" or "Good" or "Moderate" or "Weak",
  "risk_level": "High" or "Medium" or "Low",
  "market_sentiment": "Positive" or "Mixed" or "Negative",
  "recommendation_type": "Strongly Recommend" or "Proceed With Caution" or "Low Priority",
  "summary": "write 2 to 3 sentences giving the overall conclusion on whether to pitch and why — be specific and direct",
  "reasons_to_pitch": [
    "specific reason 1 why this company is a good target right now",
    "specific reason 2 why this company is a good target right now",
    "specific reason 3 why this company is a good target right now"
  ],
  "reasons_to_be_cautious": [
    "specific reason 1 why we should be careful",
    "specific reason 2 why we should be careful"
  ],
  "best_opportunity": "write 1 sentence describing the single best opportunity angle to use when pitching this company",
  "best_time_to_pitch": "write 1 sentence on when is the best time to reach out and why — for example after a campaign launch or before a product launch",
  "recommended_first_step": "write 1 very specific actionable next step the sales team should take to initiate contact",
  "clientify_gtm_strategy": "1 sentence describing the specific Clientify feature/value prop that best fits this company's situation"
}`
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
    temperature: 0.4
  })

  const defaults = {
    verdict: 'Proceed With Caution',
    confidence: 'Low',
    pitch_score: 5,
    ai_confidence_score: 50,
    opportunity_rating: 'Moderate',
    risk_level: 'Medium',
    market_sentiment: 'Mixed',
    recommendation_type: 'Proceed With Caution',
    summary: 'Insufficient data to make a strong recommendation.',
    reasons_to_pitch: [],
    reasons_to_be_cautious: [],
    best_opportunity: '',
    best_time_to_pitch: '',
    recommended_first_step: '',
    clientify_gtm_strategy: ''
  };

  const text = res.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(text);
    const merged = { ...defaults, ...parsed };
    // Maintain backwards compatibility
    merged.stepone_opportunity_angle = merged.clientify_gtm_strategy || merged.stepone_opportunity_angle || '';
    return merged;
  } catch(e) {
    const match = text.match(/\{[\s\S]*\}/)
    try {
      const parsed = match ? JSON.parse(match[0]) : null;
      const merged = parsed ? { ...defaults, ...parsed } : defaults;
      merged.stepone_opportunity_angle = merged.clientify_gtm_strategy || merged.stepone_opportunity_angle || '';
      return merged;
    } catch(e2) {
      return defaults;
    }
  }
}

module.exports = conclusionAgent