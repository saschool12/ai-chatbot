const { getAllSessions, getOrCreateSession } = require('./_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const persona = req.query.persona || (req.body && req.body.persona) || 'general';
    const session = getOrCreateSession(null, persona);
    return res.status(200).json(session);
  }

  // GET
  const sessions = getAllSessions();
  return res.status(200).json(sessions);
};
