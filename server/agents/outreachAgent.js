require('dotenv').config()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function outreachAgent(company, people, research) {
  const dm          = people?.decision_makers?.[0] || { name: 'Marketing Head', title: 'CMO' }
  const dmName      = dm.name || 'Marketing Head'
  const firstName   = dmName.split(' ')[0] || 'Marketing Head'
  const campaign    = research?.activity?.[0]?.name || 'recent campaign'
  const campaignDesc = research?.activity?.[0]?.description || ''
  const positioning = research?.overview?.positioning || ''
  const watchout    = research?.watchouts?.[0]?.title || ''
  const competitor  = research?.competitors?.[0]?.name || 'competitors'
  const companyProper = company.charAt(0).toUpperCase() + company.slice(1)

  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content: `You are an expert B2B sales copywriter who writes highly personalized and respectful outreach.
Return ONLY valid JSON. No backticks. No explanation outside JSON.
STRICT RULES FOR TONE AND CONTENT:
- Always be respectful and treat the recipient as a senior expert
- Never question their ability to do their own job
- Never say things like "can you handle" or "are you able to" or "mitigate your risks"
- Always position yourself as someone who wants to ADD value and build on their success
- Always reference the specific campaign name provided — never be generic
- Always capitalise company names and person names correctly
- LinkedIn message must be under 280 characters and must end with a question
- Email subject must be under 10 words and be specific and intriguing
- Email body must be 150 words maximum
- Email must start with genuine specific praise for a real campaign they did
- Email must offer one concrete specific value add not a vague offer
- Email must end with a soft single CTA asking for a 15 minute call
- Sign off every email as The StepOne Team
- Never mention their weaknesses or risks directly — always frame everything as an opportunity`
      },
      {
        role: 'user',
        content: `Write highly personalized and professional outreach for this specific senior person:

Person details:
- Full name: ${dm.name}
- First name to address them by: ${firstName}
- Job title: ${dm.title}
- Company: ${companyProper}

Real brand facts you MUST reference in your writing:
- Their most recent campaign name: "${campaign}"
- What that campaign was about: "${campaignDesc}"
- Their brand positioning or tagline: "${positioning}"
- Their main competitor right now: "${competitor}"

Instructions for each piece:

LINKEDIN MESSAGE:
- Start with Hi ${firstName}
- Compliment the ${campaign} campaign specifically with one concrete observation
- Add one sentence on how you can help them go even further with their next campaign
- End with a soft open question like "Worth a quick chat?"
- Must be under 280 characters total

EMAIL SUBJECT:
- Must reference ${campaign} or ${companyProper} specifically
- Must be intriguing and under 10 words
- Must not be generic like "Partnership Opportunity" or "Quick Question"

EMAIL BODY:
- Paragraph 1: Open with one specific genuine observation about the ${campaign} campaign and what it reveals about ${companyProper} brand direction — show you actually studied their work
- Paragraph 2: Introduce one very specific way your team can help them build on this momentum and pull further ahead of ${competitor} — be concrete not vague
- Paragraph 3: One soft CTA asking for a 15 minute call to explore further
- Sign off as: The StepOne Team
- Total must be under 150 words

Return ONLY this JSON with no extra text:
{
  "linkedin_message": "the full linkedin message here under 280 characters",
  "email_subject": "the specific email subject line here",
  "email_body": "the full email body here under 150 words with proper paragraphs"
}`
      }
    ],
    max_tokens: 800,
    temperature: 0.7
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