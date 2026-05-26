async function trackingAgent(company) {
  const slug = company.toLowerCase().replace(/\s/g, '_')
  return {
    pixel_url: `https://track.clientify.ai/open?cid=${slug}&uid={recipient_id}`,
    sequence: [
      { day: 0,  action: 'Send LinkedIn message + email simultaneously' },
      { day: 3,  action: 'If email opened but no reply — send a value-add follow up' },
      { day: 7,  action: 'If no response — try a different angle (competitor or event hook)' },
      { day: 14, action: 'Final closing note — keep it short and human' }
    ],
    metrics: [
      { name: 'Open rate',    target: '>40%',  formula: 'opens / sent × 100' },
      { name: 'Reply rate',   target: '>15%',  formula: 'replies / opens × 100' },
      { name: 'Meeting rate', target: '>5%',   formula: 'meetings / replies × 100' },
      { name: 'Score',        target: '>50',   formula: 'opens×1 + replies×3 + meetings×10' }
    ]
  }
}

module.exports = trackingAgent