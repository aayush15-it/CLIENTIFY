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
      console.error('JSON parse failed in outreachAgent:', e2.message)
    }
    return null
  }
}

async function generateSingleOutreach(company, dm, research, tone = 'professional') {
  const dmName      = dm.name || 'GTM Lead'
  const firstName   = dmName.split(' ')[0] || 'there'
  const campaign    = research?.activity?.[0]?.name || 'recent expansion'
  const campaignDesc = research?.activity?.[0]?.description || ''
  const positioning = research?.overview?.positioning || ''
  const competitor  = research?.competitors?.[0]?.name || 'competitors'
  const marketShift = research?.market?.recent_shifts || ''
  const companyProper = company.charAt(0).toUpperCase() + company.slice(1)

  const systemPrompt = `You are a senior GTM sales intelligence copywriter for Clientify, an AI-powered Go-To-Market (GTM) sales intelligence, database enrichment, and personalized outreach platform.
Your job is to write a highly contextual, personalized cold email and LinkedIn message targeting a specific executive to pitch Clientify.
You must return ONLY valid JSON matching the requested structure. No markdown backticks. No conversational filler.

CLIENTIFY VALUE PROPOSITIONS TO REFERENCE:
- AI-driven automated GTM strategy & prospect discovery
- Real-time stakeholder enrichment and tracking
- Competitor weakness analysis and sales triggers capture
- Hyper-personalized email/LinkedIn outreach generation
- Live market activity monitors and pipeline growth automation

STRICT OUTREACH QUALITY RULES:
- NEVER write generic praise like "Congratulations on your success" or "We would love to work with you."
- NEVER use robotic buzzword-heavy language.
- ALWAYS reference the SPECIFIC company news/campaign: "${campaign}".
- ALWAYS connect Clientify GTM tools to a SPECIFIC sales trigger or opportunity for their brand.
- The outreach must sound like a real human growth strategist wrote it after studying the company.
- LinkedIn message must be under 280 characters and end with a question.
- Email subject must be under 10 words, specific, and intriguing.
- Email body must be under 150 words with 3 paragraphs.
- Sign off as: The Clientify Team

TONE INSTRUCTIONS:
Use the requested tone: "${tone}"
- "professional": Corporate, authoritative, strategic, consultative, peer-level.
- "startup": Friendly, innovative, casual, enthusiastic, conversational.
- "enterprise": Formal, risk-conscious, value-driven, structured, ROI-focused.
- "aggressive sales": Direct, high-impact, problem-solving, urgent, performance-oriented.`

  const userPrompt = `Write highly personalized GTM outreach for this specific stakeholder:

Person details:
- Full name: ${dmName}
- First name: ${firstName}
- Job title: ${dm.title}
- Company: ${companyProper}

Real brand intelligence you MUST reference:
- Their most recent activity/trigger: "${campaign}"
- What that trigger was about: "${campaignDesc}"
- Their brand positioning: "${positioning}"
- Their main competitor: "${competitor}"
- Recent market shifts: "${marketShift}"

Return ONLY this JSON structure:
{
  "linkedin_message": "the full linkedin message under 280 characters matching the tone",
  "email_subject": "the specific email subject line matching the tone",
  "email_body": "the full email body under 150 words with proper paragraphs matching the tone",
  "outreach_confidence": 92,
  "intent_category": "Trigger-based Outbound" or "Competitor Weakness Capture" or "Product Launch GTM",
  "suggested_cta": "suggested short call to action, e.g., '15-min GTM review'",
  "tone": "${tone}"
}`

  const defaults = {
    linkedin_message: '',
    email_subject: '',
    email_body: '',
    outreach_confidence: 85,
    intent_category: 'Trigger-based Outbound',
    suggested_cta: '15-minute call',
    tone: tone
  }

  try {
    const res = await getChatCompletion({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.5
    })

    const text = res.choices[0]?.message?.content || ''
    const parsed = safeParseJSON(text)
    return parsed ? { ...defaults, ...parsed } : defaults
  } catch (err) {
    console.error(`Error generating outreach for ${dmName}:`, err.message)
    return defaults
  }
}

async function outreachAgent(company, people, research, tone = 'professional') {
  console.log(`   → Generating personalized outreach for all decision makers with tone: ${tone}...`)
  
  const dms = people?.decision_makers && people.decision_makers.length > 0
    ? people.decision_makers
    : [{ name: 'GTM Lead', title: 'CMO', relevance: 'Sales decision maker' }]

  // Generate outreach for each decision maker in parallel
  const outreachPromises = dms.map(async (dm) => {
    const outreach = await generateSingleOutreach(company, dm, research, tone)
    return {
      ...dm,
      outreach
    }
  })

  const enrichedDMs = await Promise.all(outreachPromises)

  return {
    ...people,
    decision_makers: enrichedDMs
  }
}

module.exports = outreachAgent