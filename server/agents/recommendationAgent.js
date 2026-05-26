const { getChatCompletion } = require('../utils/aiClient')

function safeParseJSON(text) {
  if (!text) return null
  try {
    return JSON.parse(text.trim())
  } catch(e) {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        return JSON.parse(match[0].trim())
      }
    } catch(e2) {
      console.error('JSON parse failed in recommendationAgent:', e2.message)
    }
    return null
  }
}

async function recommendationAgent(industry, prospects, events) {
  console.log(`   → Running recommendation engine for industry: ${industry}`)

  if (!prospects || prospects.length === 0) {
    return null
  }

  const systemPrompt = `You are a senior GTM sales intelligence recommendation engine at Clientify.
Your job is to compare all discovered target companies (prospects) for a given industry and select the SINGLE most suitable target company for Clientify to pitch its sales intelligence and outbound automation platform.
Return ONLY valid JSON matching the requested structure. No markdown backticks. No conversational filler.
Analyze their segment, recent activity, rationale, and priority score. Differentiate them based on conversion probability, strengths, risks, and market compatibility.`

  const userPrompt = `Target Industry: "${industry}"

PROSPECT LIST:
${JSON.stringify(prospects, null, 2)}

UPCOMING EVENTS:
${JSON.stringify(events, null, 2)}

Identify the single best target company from the prospect list above. Analyze their growth momentum, outreach potential, competitor vulnerabilities, and conversion probability.

Return ONLY this JSON structure:
{
  "name": "Exact Name of Recommended Company",
  "why_selected": "A detailed 2-3 sentence strategic rationale on why this specific company was selected as the #1 target over all other leads.",
  "strengths": [
    "strategic strength 1 of targeting this lead, e.g. rapid sales expansion",
    "strategic strength 2, e.g. competitor SunPower facing product delays"
  ],
  "risks": [
    "strategic risk 1, e.g. tight procurement cycles",
    "strategic risk 2, e.g. strict compliance rules"
  ],
  "outreach_probability": "High" or "Medium" or "Low",
  "expected_conversion_potential": "85%" or similar estimated percentage,
  "market_compatibility_score": 92 (a number from 1 to 100),
  "gtm_pitch_hook": "A one-sentence high-impact trigger-based pitch hook to capture their interest."
}`

  const defaults = {
    name: prospects[0]?.name || 'Unknown Company',
    why_selected: 'Selected based on highest initial priority score and growth activity.',
    strengths: ['High GTM alignment', 'Recent expansion activity'],
    risks: ['Tight procurement cycles'],
    outreach_probability: 'Medium',
    expected_conversion_potential: '75%',
    market_compatibility_score: 80,
    gtm_pitch_hook: 'Let us help automate your GTM outreach.'
  }

  try {
    const res = await getChatCompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.2
    })

    const text = res.choices[0]?.message?.content || ''
    const parsed = safeParseJSON(text)
    return parsed ? { ...defaults, ...parsed } : defaults
  } catch (err) {
    console.error('Recommendation Agent failed:', err.message)
    return defaults
  }
}

module.exports = recommendationAgent
