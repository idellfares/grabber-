import express from 'express';
import fs from 'node:fs';
const app = express();
const LOG = '/tmp/hits.jsonl';
const KEY = process.env.ADMIN_KEY || 'change-me';
app.set('trust proxy', true);

const ip = r => (r.headers['x-forwarded-for']||'').split(',')[0].trim() || r.socket.remoteAddress;
const log = (r, x={}) => fs.appendFile(LOG, JSON.stringify({
  ts: new Date().toISOString(), ip: ip(r), ua: r.headers['user-agent']||'', ...x })+'\n', ()=>{});

app.get('/', (r, q) => {
  log(r, { kind: 'hit' });
  const to = r.query.to || 'https://discord.com';
  q.type('html').send(`<meta charset="utf-8"><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;background:#1e1f22;color:#dbdee1">
  <p>loading…</p><script>setTimeout(()=>location.replace(${JSON.stringify(to)}),1500)</script>`);
});

app.get('/admin', (r, q) => {
  if (r.query.key !== KEY) return q.status(403).send('no');
  if (!fs.existsSync(LOG)) return q.json([]);
  q.json(fs.readFileSync(LOG,'utf8').trim().split('\n').filter(Boolean).map(JSON.parse));
});

app.listen(process.env.PORT || 3000);
