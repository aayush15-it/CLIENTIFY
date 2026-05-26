require('dotenv').config()
const Groq = require('groq-sdk')
const { webSearch, getNews } = require('../utils/searchClient')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function safeParseJSON(text) {
  try {
    const cleaned = text
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\t/g, ' ')
      .trim()
    return JSON.parse(cleaned)
  } catch(e) {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const cleaned = match[0]
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\t/g, ' ')
        return JSON.parse(cleaned)
      }
    } catch(e2) {
      console.error('JSON parse failed:', e2.message)
      console.error('Raw text was:', text.slice(0, 200))
    }
    return null
  }
}

async function askGroq(system, user) {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   }
      ],
      max_tokens: 2000,
      temperature: 0.25
    })
    const text = res.choices[0]?.message?.content || ''
    console.log('   \u2192 Raw response preview:', text.slice(0, 100))
    const parsed = safeParseJSON(text)
    if (!parsed) {
      console.error('   \u2192 Parse failed for response')
      return {}
    }
    return parsed
  } catch(err) {
    console.error('   \u2192 Groq call failed:', err.message)
    return {}
  }
}

async function researchAgent(company, category, searchContext) {
  console.log('   \u2192 Searching web for real data about', company)

  let generalData  = ''
  let revenueData  = ''
  let campaignData = ''
  let competitorData = ''
  let eventsData   = ''
  let newsData     = ''

  try {
    const results = await Promise.all([
      webSearch(`${company} company overview 2024 2025`),
      webSearch(`${company} revenue annual report 2024`),
      webSearch(`${company} marketing campaign launch 2024 2025`),
      webSearch(`${company} ${category} competitors 2024 2025`),
      webSearch(`${company} events sponsorship activation conference 2024 2025`),
      getNews(company)
    ])
    generalData    = results[0] || ''
    revenueData    = results[1] || ''
    campaignData   = results[2] || ''
    competitorData = results[3] || ''
    eventsData     = results[4] || ''
    newsData       = results[5] || ''
  } catch(e) {
    console.error('   \u2192 Search error:', e.message)
  }

  console.log('   \u2192 Search done. General data length:', generalData.length)

  // Overview and market
  console.log('   \u2192 Building overview...')
  const part1 = await askGroq(
    `You are a production-grade brand intelligence analyst for StepOne.
Return ONLY valid JSON. No backticks. No markdown. No text before or after JSON.

STRICT DATA QUALITY RULES:
- Use facts from search results. For well-known companies, supplement with verified knowledge.
- If a data point is not available in search results or your knowledge, write "Publicly unavailable" for that field.
- NEVER fabricate revenue figures, user counts, or market share numbers.
- NEVER leave any field as an empty string — write "Publicly unavailable" instead.
- Be specific and analytical. Avoid generic statements.`,

    `Analyze the company "${company}" which operates in "${category}".

Search results:
${generalData || 'Limited search data available'}

Revenue data:
${revenueData || 'Limited revenue data available'}

Recent news:
${newsData || 'No recent news available'}

Return ONLY this JSON. Use real information. Write "Publicly unavailable" for any data you cannot verify:
{
  "overview": {
    "business_model": "explain specifically how ${company} generates revenue",
    "scale": "number of users/customers, employees, or countries of operation",
    "positioning": "their real tagline, mission statement, or brand positioning",
    "founded": "year founded",
    "hq": "headquarters city and country",
    "revenue_scale": "annual revenue estimate with year, or Publicly unavailable"
  },
  "market": {
    "brand_perception": "2 specific sentences on how the market and public perceive ${company}",
    "perception_score": 7,
    "recent_shifts": "2 specific recent strategic shifts or developments",
    "market_share_est": "percentage or rank in market, or Publicly unavailable",
    "consumer_sentiment": "positive or mixed or negative"
  }
}`
  )

  // Competitors
  console.log('   \u2192 Building competitors...')
  const part2 = await askGroq(
    `You are a competitive intelligence analyst.
Return ONLY valid JSON. No backticks. No text before or after JSON.
Only list currently active, operational companies as competitors.
Every field must contain specific, useful information. Write "Publicly unavailable" if you cannot verify a data point.`,

    `List 4 real active competitors of "${company}" in the "${category}" space.

Competitor data:
${competitorData || 'Use your knowledge about this industry'}

For each competitor provide specific, differentiated information:
{
  "competitors": [
    {
      "name": "exact competitor name",
      "positioning": "how they specifically position themselves differently from ${company}",
      "recent_activity": "one specific thing they did in 2024 or 2025 (launch, campaign, expansion, funding)",
      "strength": "one specific competitive advantage over ${company}",
      "gap": "one specific weakness or vulnerability vs ${company}"
    }
  ]
}`
  )

  // Campaigns and events
  console.log('   \u2192 Building activity and events...')
  const part3 = await askGroq(
    `You are a brand activity researcher.
Return ONLY valid JSON. No backticks. No text before or after JSON.
Only include REAL campaigns and events from the last 12-24 months.
NEVER write "not publicly reported" \u2014 describe what actually happened or write "Publicly unavailable".
Each activity must be a real, verifiable initiative.`,

    `List real campaigns, launches, and events by "${company}" in the last 12-24 months.

Campaign data:
${campaignData || 'Use your knowledge about this brand'}

Events data:
${eventsData || 'Use your knowledge about this brand'}

Recent news:
${newsData || 'No news available'}

Return ONLY this JSON with real specific information:
{
  "activity": [
    {
      "name": "specific campaign or initiative name",
      "period": "Month Year",
      "description": "what this campaign/initiative was specifically about",
      "impact": "what it achieved or its significance"
    }
  ],
  "events": [
    {
      "name": "specific event name",
      "type": "conference, trade show, activation, sponsorship, etc.",
      "scale": "local or national or global",
      "outcome": "what happened or what was announced"
    }
  ]
}`
  )

  // Watchouts
  console.log('   \u2192 Building watchouts...')
  const part4 = await askGroq(
    `You are a senior strategic brand consultant.
Return ONLY valid JSON. No backticks. No text before or after JSON.
Write specific, realistic strategic risks for this exact company.
NEVER write generic risks that could apply to any company.
Each risk must be tied to ${company}'s specific market position, competitive landscape, or recent developments.`,

    `Identify 3 specific strategic risks for "${company}" (${category}).

Company context:
${generalData.slice(0, 500) || 'Use your knowledge about this company'}

Competitive context:
${competitorData.slice(0, 300) || 'Use your knowledge about competitors'}

Return ONLY this JSON:
{
  "watchouts": [
    {
      "title": "specific risk name tied to ${company}",
      "description": "2 sentences explaining this specific risk and why it matters for ${company} right now",
      "severity": "high"
    },
    {
      "title": "second specific risk",
      "description": "2 sentences",
      "severity": "medium"
    },
    {
      "title": "third specific risk",
      "description": "2 sentences",
      "severity": "low"
    }
  ]
}`
  )

  // Log what we got
  console.log('   \u2192 Overview keys:', Object.keys(part1.overview || {}))
  console.log('   \u2192 Competitors count:', (part2.competitors || []).length)
  console.log('   \u2192 Activity count:', (part3.activity || []).length)
  console.log('   \u2192 Watchouts count:', (part4.watchouts || []).length)

  return {
    overview:    part1.overview    || {},
    market:      part1.market      || {},
    competitors: part2.competitors || [],
    activity:    part3.activity    || [],
    events:      part3.events      || [],
    watchouts:   part4.watchouts   || []
  }
}

module.exports = researchAgent