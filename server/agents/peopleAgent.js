require('dotenv').config()
const Groq = require('groq-sdk')
const { webSearch } = require('../utils/searchClient')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function peopleAgent(company, category, searchContext) {
  console.log('   \u2192 Searching for real decision makers...')

  const [leaderSearch, linkedinSearch] = await Promise.all([
    webSearch(`${searchContext} CMO "chief marketing officer" OR "VP marketing" OR "head of marketing" OR "brand director" 2024 2025`),
    webSearch(`${company} marketing head brand manager LinkedIn site:linkedin.com 2024 2025`)
  ])

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a production-grade B2B contact intelligence agent for StepOne.
Return ONLY valid JSON. No backticks. No explanation outside JSON.

STRICT CONTACT INTELLIGENCE RULES:
- ONLY include people who are CONFIRMED in the search results provided.
- Use the EXACT job titles found in search results.
- NEVER invent or guess people who are not mentioned in the search results.
- Focus ONLY on marketing, brand, growth, and communications roles.
- DO NOT include operations, finance, engineering, or unrelated executives.

LINKEDIN URL RULES:
- Always format as: https://linkedin.com/in/firstname-lastname
- The URL must be based on the real person's name found in search results.
- If LinkedIn URL cannot be verified, set to "Publicly unavailable".

EMAIL RULES:
- Generate pattern-based email: firstname.lastname@companydomain.com
- Use the most likely corporate domain for the company.
- Mark email_confidence as "pattern-based" (not verified).
- If company domain is unknown, set email to "Publicly unavailable".

PHONE RULES:
- Only include phone if found in public search results.
- If not found, set to "Publicly unavailable".
- NEVER fabricate phone numbers.

DATA QUALITY:
- If fewer than 3 people are found in search results, return only those found.
- NEVER pad the list with invented contacts.
- Precision over quantity.`
      },
      {
        role: 'user',
        content: `Find up to 3 current senior decision makers at "${company}" (${category}) that a brand and experiential marketing agency should contact.

Only look for people in these roles:
- Chief Marketing Officer or CMO
- VP of Marketing or Vice President Marketing
- Head of Marketing or Head of Brand
- Brand Director or Marketing Director
- Chief Growth Officer
- Head of Digital Marketing
- Head of Communications or PR
- India/APAC Marketing Lead (if applicable)

REAL SEARCH RESULTS ABOUT THEIR LEADERSHIP:
${leaderSearch}

LINKEDIN SEARCH RESULTS:
${linkedinSearch}

Use ONLY names that appear in the search results above.
For the company email domain, use the most likely domain for ${company}.

Return ONLY this JSON with no extra text:
{
  "decision_makers": [
    {
      "name": "real full name exactly as found in search results",
      "title": "their exact current job title from search results",
      "relevance": "one specific sentence explaining why a brand/experiential marketing agency should contact this person and what brand decisions they control",
      "linkedin": "https://linkedin.com/in/firstname-lastname",
      "email": "firstname.lastname@companydomain.com",
      "email_confidence": "pattern-based",
      "phone": "Publicly unavailable"
    }
  ]
}`
      }
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
    temperature: 0.15
  })

  const text = res.choices[0]?.message?.content || ''
  let parsed;
  try {
    parsed = JSON.parse(text)
  } catch(e) {
    const match = text.match(/\{[\s\S]*\}/)
    try {
      parsed = match ? JSON.parse(match[0]) : null
    } catch(e2) {
      parsed = null
    }
  }
  return {
    decision_makers: parsed && Array.isArray(parsed.decision_makers) ? parsed.decision_makers : []
  }
}

module.exports = peopleAgent