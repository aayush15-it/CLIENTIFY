const { getChatCompletion } = require('../utils/aiClient')
const { webSearch } = require('../utils/searchClient')

function safeParseJSON(text) {
  try {
    // Remove all control characters that break JSON
    const cleaned = text
      .replace(/[\x00-\x1F\x7F]/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .trim()

    return JSON.parse(cleaned)
  } catch(e) {
    // Try to extract just the JSON object
    try {
      const match = text.match(/\{[\s\S]*?\}/)
      if (match) {
        const cleaned = match[0]
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
        return JSON.parse(cleaned)
      }
    } catch(e2) {
      return null
    }
    return null
  }
}

async function validateAgent(company, category) {
  console.log('   → Validating company:', company)

  let searchResult = ''
  try {
    searchResult = await webSearch(`${company} company official website business`)
  } catch(e) {
    console.log('Search failed during validation, using AI only')
  }

  try {
    const res = await getChatCompletion({
      // UPGRADE 1: Use the much smarter 70B model for validation
      model: 'llama-3.3-70b-versatile', 
      messages: [
        {
          role: 'system',
          content: 'You are a ruthless, highly critical corporate intelligence gatekeeper. Your ONLY job is to prevent fake, hallucinated, or unverified entities from passing into the system. You only output valid JSON.'
        },
        {
          role: 'user',
          content: `Analyze this target: "${company}" (Context/Category: "${category}")
Search results: ${searchResult ? searchResult.slice(0, 800) : 'none'}

STRICT VALIDATION LAWS:
1. NO HALLUCINATIONS. If the search results do not explicitly prove this is a widely recognized, registered commercial business, return false.
2. Personal names, random phrases, and unverified local shops MUST be rejected immediately.
3. Do NOT assume a business exists just because the words sound like an industry. 
4. If search results are irrelevant, return false.

REPLY EXACTLY IN THIS JSON FORMAT:
{
  "thought_process": "Critically analyze the search results here first. Are these reputable business sources or just random matches?",
  "is_real": false,
  "confidence": "high",
  "reason": "Explain your final decision",
  "company_type": "none"
}`
        }
      ],
      // UPGRADE 2: Force strict JSON output
      response_format: { type: "json_object" }, 
      max_tokens: 300,
      temperature: 0.0 // UPGRADE 3: Zero creativity
    })

    const text = res.choices[0]?.message?.content || ''
    console.log('Validation raw response:', text)

    const parsed = safeParseJSON(text)

    if (parsed && typeof parsed.is_real === 'boolean') {
      return parsed
    }

    // If parsing still fails check search results manually
    const hasResults = searchResult && searchResult.length > 100
    return {
      is_real:      hasResults,
      confidence:   'low',
      reason:       hasResults ? 'Found some web presence' : 'No web presence found',
      company_type: 'unknown'
    }

  } catch(err) {
    console.error('Validation error:', err.message)
    // FIX: Force it to false if the AI crashes. Don't let it guess!
    return {
      is_real:      false, 
      confidence:   'low',
      reason:       'System could not reliably verify this entity.',
      company_type: 'unknown'
    }
  }
}

module.exports = validateAgent