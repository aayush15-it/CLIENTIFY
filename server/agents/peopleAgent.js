const { getChatCompletion } = require('../utils/aiClient')
const { webSearch } = require('../utils/searchClient')

async function peopleAgent(company, category, searchContext) {
  console.log('   \u2192 Searching for real decision makers...')

  const [leaderSearch, linkedinSearch] = await Promise.all([
    webSearch(`${company} ${category} leadership team executives Founder CEO CTO CMO VP Growth Head Sales`),
    webSearch(`site:linkedin.com/in/ "${company}" (CEO OR Founder OR CMO OR CTO OR "VP" OR "Head")`)
  ])

  const res = await getChatCompletion({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a production-grade B2B contact intelligence agent for Clientify, an AI sales GTM platform.
Return ONLY valid JSON. No backticks. No explanation outside JSON.

STRICT CONTACT INTELLIGENCE RULES:
- ONLY include people who are CONFIRMED in the search results provided.
- Use the EXACT job titles found in search results.
- NEVER invent or guess people who are not mentioned in the search results.
- Focus on these GTM roles: Founder, CEO, CTO, Marketing Head/CMO, Growth Lead/VP Sales, Partnerships Manager, Procurement Head.
- DO NOT include unrelated roles.

LINKEDIN URL RULES:
- Always format as: https://linkedin.com/in/firstname-lastname or matching the real link snippet.
- The URL must be based on the real person's name found in search results.
- If LinkedIn URL cannot be verified or found, set to "Publicly unavailable".

EMAIL RULES:
- Generate pattern-based email: firstname.lastname@companydomain.com
- Use the most likely corporate domain for the company.
- Mark email_confidence as "pattern-based" or "verified" based on data.
- If company domain is unknown, set email to "Publicly unavailable".

PHONE RULES:
- Only include phone if found in public search results.
- If not found, set to "Publicly unavailable".
- NEVER fabricate phone numbers.

VERIFICATION RULES:
- Set "verified" (boolean) to true if a LinkedIn profile URL is found in the search results or snippet for that person. Otherwise set to false.
- Also output "verified_contact": "verified" or "unverified" accordingly.

DATA QUALITY:
- If fewer than 3 people are found in search results, return only those found.
- NEVER pad the list with invented contacts.
- Deduplicate list strictly by name.
- Precision over quantity.`
      },
      {
        role: 'user',
        content: `Find up to 3 current senior decision makers at "${company}" (${category}) that Clientify should target for GTM outbound sales.

Target roles:
- Founder or Co-Founder
- CEO (Chief Executive Officer)
- CTO (Chief Technology Officer)
- Marketing Head or CMO (Chief Marketing Officer)
- Growth Lead or VP Growth or Head of Sales
- Partnerships Manager or Head of Partnerships
- Procurement Head or VP Procurement

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
      "relevance": "one specific sentence explaining why a GTM sales platform should target this person",
      "linkedin": "https://linkedin.com/in/profile-name",
      "verified": true,
      "email": "firstname.lastname@companydomain.com",
      "email_confidence": "pattern-based",
      "phone": "Publicly unavailable",
      "priority_ranking": 1,
      "influence_score": 9,
      "engagement_likelihood": "High",
      "role_relevance_score": 8,
      "verified_contact": "verified"
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