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
const recommendationAgent = require('./agents/recommendationAgent');

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// In-memory cache layer to optimize API token usage and speed up UI demo
const cache = {
  discovery: {}, // key: industry
  analyze: {},   // key: company_category
  outreach: {}   // key: company_tone
};

app.post('/api/discover', async (req, res) => {
  const { industry } = req.body;
  console.log('Received Industry Discovery:', industry);

  if (!industry) {
    return res.status(400).json({
      success: false,
      error: 'Please enter an industry'
    });
  }

  const normalizedIndustry = industry.trim().toLowerCase();
  if (normalizedIndustry.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid industry name'
    });
  }

  // Check Cache
  if (cache.discovery[normalizedIndustry]) {
    console.log('   → Returning cached discovery for industry:', industry);
    return res.json(cache.discovery[normalizedIndustry]);
  }

  try {
    const result = await discoverAgent(industry);
    const prospects = result.prospects || [];
    const events = result.events || [];

    // Run Recommendation Agent
    const recommendation = await recommendationAgent(industry, prospects, events);

    const responsePayload = {
      success: true,
      industry,
      prospects,
      events,
      recommendation
    };

    // Store in cache
    cache.discovery[normalizedIndustry] = responsePayload;
    res.json(responsePayload);
  } catch(err) {
    console.error('Discovery endpoint error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Something went wrong during discovery. Please try again.'
    });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { company, category } = req.body;
  console.log('Received:', company, category);

  if (!company || !category) {
    return res.status(400).json({
      success: false,
      error: 'Please enter both a company name and category'
    });
  }

  const normalizedCompany = company.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();
  const cacheKey = `${normalizedCompany}_${normalizedCategory}`;

  // Check Cache
  if (cache.analyze[cacheKey]) {
    console.log('   → Returning cached analysis for:', company);
    return res.json(cache.analyze[cacheKey]);
  }

  try {
    // Validate
    console.log('Step 0: Validating...');
    const validation = await validateAgent(company, category);
    console.log('Validation result:', JSON.stringify(validation));

    if (!validation || !validation.is_real) {
      return res.status(400).json({
        success: false,
        is_real: false, 
        reason: validation?.reason || 'No business presence found'
      });
    }

    console.log('Step 1: Research...');
    const research = await researchAgent(company, category, `${company} ${category} 2024`);

    console.log('Step 2: People...');
    const people = await peopleAgent(company, category, `${company} ${category} 2024`);

    console.log('Step 3: Outreach...');
    const enrichedPeople = await outreachAgent(company, people, research, 'professional');
    const primaryOutreach = enrichedPeople.decision_makers?.[0]?.outreach || {};

    console.log('Step 4: Tracking...');
    const tracking = await trackingAgent(company);

    console.log('Step 5: Conclusion...');
    const conclusion = await conclusionAgent(company, research, enrichedPeople, primaryOutreach);

    console.log('All done!');

    const responsePayload = {
      success:     true,
      company,
      category,
      overview:    research.overview    || {},
      market:      research.market      || {},
      competitors: research.competitors || [],
      activity:    research.activity    || [],
      events:      research.events      || [],
      watchouts:   research.watchouts   || [],
      people:      enrichedPeople       || { decision_makers: [] },
      outreach:    primaryOutreach,
      tracking:    tracking             || {},
      conclusion:  conclusion           || {}
    };

    // Store in cache
    cache.analyze[cacheKey] = responsePayload;
    res.json(responsePayload);

  } catch(err) {
    console.error('Pipeline error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.'
    });
  }
});

// Endpoint to regenerate outreach on-the-fly for all decision makers with a specific tone
app.post('/api/regenerate-outreach', async (req, res) => {
  const { company, people, research, tone } = req.body;
  console.log(`Outreach Regeneration Request for ${company} [Tone: ${tone}]`);

  if (!company || !people || !research || !tone) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters for regeneration'
    });
  }

  const cacheKey = `${company.trim().toLowerCase()}_${tone.trim().toLowerCase()}`;

  // Check Cache
  if (cache.outreach[cacheKey]) {
    console.log('   → Returning cached outreach for:', company, tone);
    return res.json(cache.outreach[cacheKey]);
  }

  try {
    // Strip old outreach objects to ensure a fresh generation
    const cleanPeople = {
      ...people,
      decision_makers: (people.decision_makers || []).map(dm => {
        const { outreach, ...rest } = dm;
        return rest;
      })
    };

    const enrichedPeople = await outreachAgent(company, cleanPeople, research, tone);
    const primaryOutreach = enrichedPeople.decision_makers?.[0]?.outreach || {};

    const responsePayload = {
      success: true,
      people: enrichedPeople,
      outreach: primaryOutreach
    };

    // Store in cache
    cache.outreach[cacheKey] = responsePayload;
    res.json(responsePayload);
  } catch (err) {
    console.error('Outreach regeneration error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate outreach templates.'
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
