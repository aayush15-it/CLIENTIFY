require('dotenv').config()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function outreachAgent(company, people, research) {
  const dm          = people?.decision_makers?.[0] || { name: 'Marketing Head', title: 'CMO' }
  const dmName      = dm.name || 'Marketing Head'
  const firstName   = dmName.split(' ')[0] || 'there'
  const campaign    = research?.activity?.[0]?.name || 'recent initiative'
  const campaignDesc = research?.activity?.[0]?.description || ''
  const positioning = research?.overview?.positioning || ''
  const watchout    = research?.watchouts?.[0]?.title || ''
  const competitor  = research?.competitors?.[0]?.name || 'competitors'
  const marketShift = research?.market?.recent_shifts || ''
  const companyProper = company.charAt(0).toUpperCase() + company.slice(1)

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are a senior B2B outreach strategist writing on behalf of StepOne, a brand and experiential marketing agency.
Return ONLY valid JSON. No backticks. No explanation outside JSON.

STEPONE CAPABILITIES TO REFERENCE:
- Experiential marketing and immersive brand activations
- Event storytelling and live campaign amplification
- Product launch campaigns and go-to-market strategy
- Employer branding and talent attraction campaigns
- Strategic brand positioning and creative direction
- Digital growth campaigns and social media strategy
- Localized campaigns for India/APAC market entry

STRICT OUTREACH QUALITY RULES:
- NEVER write generic praise like "Congratulations on your success" or "We would love to work with you."
- NEVER use robotic buzzword-heavy language.
- ALWAYS reference the SPECIFIC campaign name and what it achieved.
- ALWAYS connect StepOne capabilities to a SPECIFIC opportunity for the brand.
- The outreach must sound like a real human strategist wrote it after studying the company.
- LinkedIn message must be under 280 characters and end with a question.
- Email subject must be under 10 words, specific, and intriguing.
- Email body must be under 150 words with 3 paragraphs.
- Sign off as: The StepOne Team

TONE:
- Strategic and consultative, not salesy.
- Respectful and peer-level, not subservient.
- Frame everything as opportunity, never mention weaknesses or risks directly.`
      },
      {
        role: 'user',
        content: `Write highly personalized outreach for this specific senior person:

Person details:
- Full name: ${dmName}
- First name: ${firstName}
- Job title: ${dm.title}
- Company: ${companyProper}

Real brand intelligence you MUST reference:
- Their most recent campaign/initiative: "${campaign}"
- What that initiative was about: "${campaignDesc}"
- Their brand positioning: "${positioning}"
- Their main competitor: "${competitor}"
- Recent market shifts: "${marketShift}"

Instructions:

LINKEDIN MESSAGE:
- Start with Hi ${firstName}
- Reference ${campaign} with one specific observation about what it signals about their brand direction
- Connect to how StepOne can help amplify their next move through experiential marketing or campaign activation
- End with a soft question
- Must be under 280 characters

EMAIL SUBJECT:
- Must reference ${campaign} or ${companyProper} specifically
- Must be intriguing, strategic, and under 10 words

EMAIL BODY:
- Paragraph 1: Open with a specific observation about ${campaign} and what it reveals about ${companyProper}'s brand direction. Show genuine understanding.
- Paragraph 2: Introduce ONE specific StepOne capability (experiential activation, event storytelling, product launch campaign, employer branding) that directly connects to their current trajectory and helps them pull ahead of ${competitor}.
- Paragraph 3: Soft CTA for a 15-minute call.
- Sign off as: The StepOne Team
- Total under 150 words.

Return ONLY this JSON:
{
  "linkedin_message": "the full linkedin message under 280 characters",
  "email_subject": "the specific email subject line",
  "email_body": "the full email body under 150 words with proper paragraphs"
}`
      }
    ],
    max_tokens: 800,
    temperature: 0.6
  })

  const defaults = {
    linkedin_message: '',
    email_subject: '',
    email_body: ''
  };
  const text = res.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(text);
    return { ...defaults, ...parsed };
  } catch(e) {
    const match = text.match(/\{[\s\S]*\}/)
    try {
      const parsed = match ? JSON.parse(match[0]) : null;
      return parsed ? { ...defaults, ...parsed } : { ...defaults, email_body: text };
    } catch(e2) {
      return { ...defaults, email_body: text };
    }
  }
}

module.exports = outreachAgent