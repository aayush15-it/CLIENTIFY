require('dotenv').config()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior business development strategist at StepOne, a brand and experiential marketing agency.
Your job is to evaluate whether a company is worth pitching to right now for experiential marketing, brand activations, campaign amplification, event storytelling, or employer branding.
Return ONLY valid JSON. No backticks. No explanation outside JSON.
Be direct, analytical, and specific. Base your verdict strictly on the data provided.
NEVER fabricate claims. If data is insufficient, say so honestly.`
      },
      {
        role: 'user',
        content: `Evaluate whether our brand agency should pitch to "${company}" right now.

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

STEPONE SERVICES WE CAN PITCH:
- Experiential marketing and immersive brand activations
- Event storytelling and live campaign amplification
- Product launch campaigns
- Employer branding and talent attraction
- Strategic brand positioning and creative direction
- Digital growth and social media strategy
- Localized campaigns for India/APAC

Based on ALL of this real data return ONLY this JSON:
{
  "verdict": "Worth Pitching" or "Proceed With Caution" or "Not Recommended",
  "confidence": "High" or "Medium" or "Low",
  "pitch_score": a number from 1 to 10 representing how strongly we recommend pitching,
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
  "recommended_first_step": "write 1 very specific actionable next step the agency should take to initiate contact",
  "stepone_opportunity_angle": "1 sentence describing the specific StepOne service that best fits this company's current situation"
}`
      }
    ],
    max_tokens: 1000,
    temperature: 0.4
  })

  const defaults = {
    verdict: 'Proceed With Caution',
    confidence: 'Low',
    pitch_score: 5,
    summary: 'Insufficient data to make a strong recommendation.',
    reasons_to_pitch: [],
    reasons_to_be_cautious: [],
    best_opportunity: '',
    best_time_to_pitch: '',
    recommended_first_step: '',
    stepone_opportunity_angle: ''
  };
  const text = res.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(text);
    return { ...defaults, ...parsed };
  } catch(e) {
    const match = text.match(/\{[\s\S]*\}/)
    try {
      const parsed = match ? JSON.parse(match[0]) : null;
      return parsed ? { ...defaults, ...parsed } : defaults;
    } catch(e2) {
      return defaults;
    }
  }
}

module.exports = conclusionAgent