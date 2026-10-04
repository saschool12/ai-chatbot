const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// API Handlers
const chatHandler = require('./api/chat');
const personasHandler = require('./api/personas');
const sessionsHandler = require('./api/sessions');
const sessionDetailHandler = require('./api/sessions/[id]');
const clearHandler = require('./api/clear');
const statusHandler = require('./api/status');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function enhanceRes(res) {
  res.status = function(code) {
    res.statusCode = code;
    return res;
  };
  res.json = function(data) {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(data));
    return res;
  };
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  enhanceRes(res);
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // API routing
  if (pathname.startsWith('/api/')) {
    if (req.method === 'POST') {
      req.body = await parseBody(req);
    }

    if (pathname === '/api/chat') {
      return chatHandler(req, res);
    }
    if (pathname === '/api/personas') {
      return personasHandler(req, res);
    }
    if (pathname === '/api/sessions') {
      return sessionsHandler(req, res);
    }
    if (pathname.startsWith('/api/sessions/')) {
      const id = pathname.replace('/api/sessions/', '');
      req.query.id = id;
      return sessionDetailHandler(req, res);
    }
    if (pathname === '/api/clear') {
      return clearHandler(req, res);
    }
    if (pathname === '/api/status') {
      return statusHandler(req, res);
    }

    return res.status(404).json({ error: 'Endpoint not found' });
  }

  // Static file serving
  let relPath = (pathname === '/' || pathname === '') ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.join(PUBLIC_DIR, relPath);

  // Security check: avoid directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return res.status(403).end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🤖 NovaAI Chatbot server running at http://localhost:${PORT}`);
  });
}

module.exports = server;
