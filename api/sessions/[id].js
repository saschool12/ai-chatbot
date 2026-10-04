const { getSession, deleteSession, getOrCreateSession } = require('../_store');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: 'Missing session ID' });
  }

  if (req.method === 'DELETE') {
    const deleted = deleteSession(id);
    return res.status(200).json({ deleted: Boolean(deleted) });
  }

  // GET
  let session = getSession(id);
  if (!session) {
    session = getOrCreateSession(id, 'general');
  }
  return res.status(200).json(session);
};
