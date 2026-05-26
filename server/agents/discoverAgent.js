require('dotenv').config()
const Groq = require('groq-sdk')
const { webSearch } = require('../utils/searchClient')

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
    }
    return null
  }
}

async function discoverAgent(industry) {
  console.log(`   → Discovering prospects and events for industry: ${industry}`)

  let companyResults = ''
  let eventResults = ''

  try {
    const results = await Promise.all([
      webSearch(`${industry} top active companies brands startup 2024 2025`),
      webSearch(`${industry} industry conferences exhibitions summits events 2024 2025 2026`)
    ])
    companyResults = results[0] || ''
    eventResults = results[1] || ''
  } catch(e) {
    console.error('   → Discovery search error:', e.message)
  }

  const systemPrompt = `You are a B2B growth strategist and business development AI.
Your job is to analyze web search results and discover prospects and upcoming events for a given industry.
Return ONLY valid JSON. No backticks. No markdown. No text before or after the JSON.`

  const userPrompt = `Analyze the target industry: "${industry}"
Use these search results to extract prospects and upcoming events.

COMPANY SEARCH RESULTS:
${companyResults || 'Use your knowledge about top brands in this industry.'}

EVENT SEARCH RESULTS:
${eventResults || 'Use your knowledge about major events in this industry.'}

STRICT INSTRUCTIONS:
1. Identify a minimum of 10 real companies (brands) active in this industry.
2. For each company, provide a brief rationale explaining why StepOne (a brand and marketing agency) should target them and why now is a good opportunity (e.g. rebranding, Gen Z expansion, launch, marketing spend increase).
3. Find upcoming real events in this industry and predict which of the discovered companies will likely attend or sponsor them.
4. Do not invent fake companies or events. If search results are limited, use well-known established entities.

Return ONLY this JSON structure:
{
  "prospects": [
    {
      "name": "Company Name",
      "segment": "Sub-category or niche",
      "rationale": "Why we should target them and why now is a good opportunity (2 sentences)"
    }
    // List at least 10 prospects
  ],
  "events": [
    {
      "name": "Event Name",
      "date": "Month Year or Exact Date",
      "location": "City, Country or Virtual",
      "description": "1 sentence description of what the event is",
      "predicted_attendees": "Comma-separated list of predicted companies attending (e.g., Company A, Company B)"
    }
  ]
}`

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.3
    })

    const text = res.choices[0]?.message?.content || ''
    const parsed = safeParseJSON(text)

    const defaults = { prospects: [], events: [] }
    if (parsed) {
      return { ...defaults, ...parsed }
    }
    return defaults
  } catch(err) {
    console.error('   → Discovery AI failed:', err.message)
    return { prospects: [], events: [] }
  }
}

module.exports = discoverAgent
