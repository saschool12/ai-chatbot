const test = require('node:test');
const assert = require('node:assert/strict');

const personasHandler = require('../api/personas');
const sessionsHandler = require('../api/sessions');
const sessionDetailHandler = require('../api/sessions/[id]');
const chatHandler = require('../api/chat');
const statusHandler = require('../api/status');
const clearHandler = require('../api/clear');
const { PERSONAS, getAllSessions, clearAllSessions } = require('../api/_store');

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, val) {
      this.headers[name] = val;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end(data) {
      if (data) this.body = data;
      return this;
    }
  };
  return res;
}

test('API: /api/personas returns all personas', async () => {
  const req = { method: 'GET', headers: {} };
  const res = mockRes();
  personasHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 5);
  const ids = res.body.map(p => p.id);
  assert.ok(ids.includes('general'));
  assert.ok(ids.includes('coder'));
  assert.ok(ids.includes('science'));
  assert.ok(ids.includes('writer'));
  assert.ok(ids.includes('career'));
});

test('API: /api/sessions creates and lists sessions', async () => {
  clearAllSessions();
  const reqPost = { method: 'POST', query: { persona: 'coder' }, headers: {} };
  const resPost = mockRes();
  sessionsHandler(reqPost, resPost);

  assert.equal(resPost.statusCode, 200);
  assert.ok(resPost.body.id);
  assert.equal(resPost.body.persona, 'coder');
  const createdId = resPost.body.id;

  const reqGet = { method: 'GET', headers: {} };
  const resGet = mockRes();
  sessionsHandler(reqGet, resGet);

  assert.equal(resGet.statusCode, 200);
  assert.ok(Array.isArray(resGet.body));
  assert.ok(resGet.body.some(s => s.id === createdId));
});

test('API: /api/sessions/:id gets and deletes session', async () => {
  const reqPost = { method: 'POST', query: { persona: 'science' }, headers: {} };
  const resPost = mockRes();
  sessionsHandler(reqPost, resPost);
  const sessionId = resPost.body.id;

  // GET
  const reqGet = { method: 'GET', query: { id: sessionId }, headers: {} };
  const resGet = mockRes();
  sessionDetailHandler(reqGet, resGet);
  assert.equal(resGet.statusCode, 200);
  assert.equal(resGet.body.id, sessionId);
  assert.equal(resGet.body.persona, 'science');

  // DELETE
  const reqDel = { method: 'DELETE', query: { id: sessionId }, headers: {} };
  const resDel = mockRes();
  sessionDetailHandler(reqDel, resDel);
  assert.equal(resDel.statusCode, 200);
  assert.equal(resDel.body.deleted, true);
});

test('API: /api/chat with built-in engine evaluates math', async () => {
  const req = {
    method: 'POST',
    body: {
      message: 'calculate 25 * 4',
      provider: 'builtin',
      persona: 'general'
    },
    headers: {}
  };
  const res = mockRes();
  await chatHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.reply.includes('100'));
  assert.equal(res.body.provider, 'builtin');
  assert.ok(res.body.tokens > 0);
  assert.ok(typeof res.body.latencyMs === 'number');
});

test('API: /api/chat with coder persona provides Java code', async () => {
  const req = {
    method: 'POST',
    body: {
      message: 'show me quicksort in java',
      provider: 'builtin',
      persona: 'coder'
    },
    headers: {}
  };
  const res = mockRes();
  await chatHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.reply.includes('QuickSort') || res.body.reply.includes('quicksort'));
  assert.equal(res.body.persona, 'coder');
});

test('API: /api/chat provides clean simple Java code example', async () => {
  const req = {
    method: 'POST',
    body: {
      message: 'give me a simple java code example',
      provider: 'builtin',
      persona: 'coder'
    },
    headers: {}
  };
  const res = mockRes();
  await chatHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.reply.includes('SimpleApp'));
  assert.ok(res.body.reply.includes('main'));
});

test('API: /api/chat handles custom tone parameter', async () => {
  const req = {
    method: 'POST',
    body: {
      message: 'explain quantum computing',
      provider: 'builtin',
      persona: 'science',
      tone: 'concise'
    },
    headers: {}
  };
  const res = mockRes();
  await chatHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.ok(res.body.reply);
  assert.equal(res.body.persona, 'science');
});

test('API: /api/status returns diagnostic metadata', async () => {
  const req = { method: 'GET', headers: {} };
  const res = mockRes();
  statusHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.application, 'NovaAI Chatbot');
  assert.ok(res.body.usedMemoryMb >= 0);
  assert.ok(res.body.availablePersonas === 5);
});

test('API: /api/clear flushes all active sessions', async () => {
  const req = { method: 'POST', headers: {} };
  const res = mockRes();
  clearHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'cleared');
  assert.equal(getAllSessions().length, 0);
});
