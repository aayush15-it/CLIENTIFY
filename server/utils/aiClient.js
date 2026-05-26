const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getChatCompletion(params) {
  const primaryModel = params.model;
  
  // List of fallback models on Groq
  const fallbacks = [
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];

  try {
    return await groq.chat.completions.create(params);
  } catch (err) {
    const isRateLimit = err.status === 429 || 
                        err.status === '429' ||
                        err.statusCode === 429 ||
                        err.statusCode === '429' ||
                        (err.message && (err.message.toLowerCase().includes('rate limit') || err.message.includes('429'))) ||
                        (err.code && err.code === 'rate_limit_exceeded');

    if (isRateLimit) {
      console.warn(`\n⚠️  [AI CLIENT] Rate limit hit for model "${primaryModel}". Trying fallback models...\n`);
      
      for (const fallbackModel of fallbacks) {
        if (fallbackModel === primaryModel) continue;
        
        try {
          console.warn(`   → Attempting fallback model: "${fallbackModel}"`);
          const fallbackParams = {
            ...params,
            model: fallbackModel
          };
          const response = await groq.chat.completions.create(fallbackParams);
          console.warn(`   ✓ [AI CLIENT] Success! Recovered using model "${fallbackModel}".\n`);
          return response;
        } catch (fallbackErr) {
          console.error(`   ✗ [AI CLIENT] Fallback model "${fallbackModel}" failed:`, fallbackErr.message);
        }
      }
    }
    
    // If no fallback works or it is a different error, throw the original error
    throw err;
  }
}

module.exports = { getChatCompletion };
