const path    = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');

const validateAgent   = require('./agents/validateAgent');
const researchAgent   = require('./agents/researchAgent');
const peopleAgent     = require('./agents/peopleAgent');
const outreachAgent   = require('./agents/outreachAgent');
const trackingAgent   = require('./agents/trackingAgent');
const conclusionAgent = require('./agents/conclusionAgent');
const discoverAgent   = require('./agents/discoverAgent');

const app = express();

// ? ONLY ONE CORS
app.use(cors({
  origin: "*",
}));

app.use(express.json());

app.post('/api/discover', async (req, res) => {
  const { industry } = req.body
  console.log('Received Industry Discovery:', industry)

  if (!industry) {
    return res.status(400).json({
      success: false,
      error: 'Please enter an industry'
    })
  }

  if (industry.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid industry name'
    })
  }

  try {
    const result = await discoverAgent(industry)
    res.json({
      success: true,
      industry,
      prospects: result.prospects || [],
      events: result.events || []
    })
  } catch(err) {
    console.error('Discovery endpoint error:', err.message)
    res.status(500).json({
      success: false,
      error: 'Something went wrong during discovery. Please try again.'
    })
  }
})

app.post('/api/analyze', async (req, res) => {
  const { company, category } = req.body
  console.log('Received:', company, category)

  // Basic checks
  if (!company || !category) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both a company name and category'
    })
  }

  if (company.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid company name'
    })
  }

  // Block obvious non-company inputs immediately
  // without even calling the AI
  const blockedPatterns = [
    /^[a-z\s]+$/i,   // only simple words with no numbers
  ]

  // Check if input is just a person's name (first + last name pattern)
  const wordCount = company.trim().split(' ').length
  const isLikelyPersonName = wordCount <= 2 &&
    /^[A-Za-z\s]+$/.test(company) &&
    company.length < 20

  const searchContext = `${company} ${category} 2024`

  try {
    // STEP 0 — Validate first
    // STEP 0 — Validate first
    console.log('Step 0: Validating...')
    const validation = await validateAgent(company, category)
    console.log('Validation result:', JSON.stringify(validation))

    if (!validation || !validation.is_real) {
      // FIX: We changed 'is_invalid_company' to 'is_real: false'
      return res.status(400).json({
        success: false,
        is_real: false, 
        reason: validation?.reason || 'No business presence found'
      })
    }

    console.log('Step 1: Research...')
    const research = await researchAgent(company, category, searchContext)

    console.log('Step 2: People...')
    const people = await peopleAgent(company, category, searchContext)

    console.log('Step 3: Outreach...')
    const outreach = await outreachAgent(company, people, research)

    console.log('Step 4: Tracking...')
    const tracking = await trackingAgent(company)

    console.log('Step 5: Conclusion...')
    const conclusion = await conclusionAgent(company, research, people, outreach)

    console.log('All done!')

    res.json({
      success:     true,
      company,
      category,
      overview:    research.overview    || {},
      market:      research.market      || {},
      competitors: research.competitors || [],
      activity:    research.activity    || [],
      events:      research.events      || [],
      watchouts:   research.watchouts   || [],
      people:      people               || { decision_makers: [] },
      outreach:    outreach             || {},
      tracking:    tracking             || {},
      conclusion:  conclusion           || {}
    })

  } catch(err) {
    console.error('Pipeline error:', err.message)
    res.status(500).json({
      success: false,
      error:   'Something went wrong. Please try again.'
    })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
