const { getChatCompletion } = require('../utils/aiClient')
const { webSearch } = require('../utils/searchClient')

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
    }
    return null
  }
}

async function discoverAgent(industry) {
  console.log(`   \u2192 Discovering prospects and events for industry: ${industry}`)

  let companyResults = ''
  let eventResults = ''

  try {
    const results = await Promise.all([
      webSearch(`${industry} top active consumer brands product companies 2024 2025`),
      webSearch(`${industry} industry conferences trade shows expos summits 2025 2026`)
    ])
    companyResults = results[0] || ''
    eventResults = results[1] || ''
  } catch(e) {
    console.error('   \u2192 Discovery search error:', e.message)
  }

  const systemPrompt = `You are a production-grade B2B market intelligence engine for Clientify, an AI-powered Go-To-Market (GTM) sales intelligence and outreach SaaS.
Your job is to discover REAL, OPERATIONAL companies and REAL upcoming events for a given industry.
Return ONLY valid JSON. No backticks. No markdown. No text before or after the JSON.

STRICT FILTERING RULES:
- ONLY include actual operational product/service companies and active brands.
- Prioritize: consumer brands, product companies, electronics manufacturers, fast-growing startups, D2C brands, SaaS companies, enterprise companies.
- NEVER include venture capital firms (Sequoia, Accel, A16Z, Tiger Global, etc.).
- NEVER include startup accelerators (Y Combinator, Techstars, etc.).
- NEVER include media platforms, news websites, or influencers.
- NEVER include investment banks or hedge funds.
- Every company MUST be a potential Clientify customer for sales intelligence, GTM optimization, database enrichment, or automated outbound campaigns.

DATA QUALITY RULES:
- NEVER fabricate company names or events.
- NEVER generate generic rationales. Each rationale must reference a specific recent development (product launch, funding, expansion, campaign, hiring, AI adoption, rebrand, event participation).
- If information is uncertain, say so honestly.
- Prefer precision over quantity.`

  const userPrompt = `Analyze the target industry: "${industry}"
Use these search results to extract prospects and upcoming events.

COMPANY SEARCH RESULTS:
${companyResults || 'Use your knowledge about top brands in this industry.'}

EVENT SEARCH RESULTS:
${eventResults || 'Use your knowledge about major events in this industry.'}

STRICT INSTRUCTIONS:
1. Identify a minimum of 10 REAL companies (brands/product companies) active in this industry.
2. Each company MUST include:
   - name: exact company name
   - segment: their specific sub-category or niche
   - hq: headquarters location (city, country)
   - recent_activity: ONE specific recent development (product launch, funding, expansion, campaign, hiring surge, AI initiative, partnership)
   - rationale: 2 sentences explaining why Clientify should target them NOW (e.g., they are expanding sales teams, launching a new product, or entering a new market, making them prime targets for Clientify's GTM sales tools), tied to the recent_activity
   - priority_score: strategic priority from 1 to 10
3. DO NOT include VCs, accelerators, media outlets, or influencers.
4. Find REAL upcoming events with exact dates and locations.
5. For events, predict which discovered companies are likely to attend based on their recent activity.

Return ONLY this JSON structure:
{
  "prospects": [
    {
      "name": "Company Name",
      "segment": "Sub-category or niche",
      "hq": "City, Country",
      "recent_activity": "One specific recent development",
      "rationale": "Why Clientify should target them now (2 sentences tied to recent activity)",
      "priority_score": 8
    }
  ],
  "events": [
    {
      "name": "Event Name",
      "date": "Exact dates or Month Year",
      "location": "City, Country or Virtual",
      "description": "Official positioning of the event in 1 sentence",
      "why_attend": "Why Clientify should attend this event to source leads or partner (1 sentence)",
      "predicted_attendees": "Company A, Company B, Company C"
    }
  ]
}`

  try {
    const res = await getChatCompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3500,
      temperature: 0.25
    })

    const text = res.choices[0]?.message?.content || ''
    const parsed = safeParseJSON(text)

    const defaults = { prospects: [], events: [] }
    if (parsed) {
      return { ...defaults, ...parsed }
    }
    return defaults
  } catch(err) {
    console.error('   \u2192 Discovery AI failed:', err.message)
    return { prospects: [], events: [] }
  }
}

module.exports = discoverAgent
