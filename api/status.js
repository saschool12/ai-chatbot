const { getAllSessions, PERSONAS } = require('./_store');

const appStartTime = Date.now();

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const mem = process.memoryUsage ? process.memoryUsage() : { heapUsed: 15 * 1024 * 1024, heapTotal: 30 * 1024 * 1024 };
  const usedMem = Math.round(mem.heapUsed / 1024 / 1024);
  const totalMem = Math.round(mem.heapTotal / 1024 / 1024);
  const uptimeSeconds = Math.round((Date.now() - appStartTime) / 1000);

  return res.status(200).json({
    application: 'NovaAI Chatbot',
    version: '1.0.0',
    javaVersion: 'Vercel Serverless Runtime (Node.js)',
    uptimeSeconds: uptimeSeconds,
    usedMemoryMb: usedMem,
    totalMemoryMb: totalMem,
    activeSessions: getAllSessions().length,
    availablePersonas: PERSONAS.length
  });
};
