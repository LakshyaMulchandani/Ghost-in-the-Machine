const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Check if Ollama is reachable
async function getOllamaStatus() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      connected: true,
      host: OLLAMA_HOST,
      models: data.models || [],
      error: null
    };
  } catch (err) {
    return {
      connected: false,
      host: OLLAMA_HOST,
      models: [],
      error: err.message
    };
  }
}

// Generate spooky machine telemetry
function getSpookyTelemetry() {
  const cpus = os.cpus();
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(1);
  const usedMemPercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
  const uptimeHours = (os.uptime() / 3600).toFixed(1);

  // Calculate paranormal resonance from time and CPU activity
  const now = new Date();
  const midnightDiff = Math.abs(now.getHours() * 60 + now.getMinutes() - 180); // Distance to 3:00 AM (witching hour)
  const witchingFactor = Math.max(0, 100 - Math.round((midnightDiff / 720) * 100));

  const spectralAnomalies = [
    { id: 'EVP-404', name: 'Lost Socket in Sector 7', frequency: '13.37 kHz', severity: 'Critical' },
    { id: 'MEM-666', name: 'Phantom Memory Leak on Stack', frequency: '432 Hz', severity: 'High' },
    { id: 'IRQ-13', name: 'Interrupt Signal from Void', frequency: '66.6 MHz', severity: 'Moderate' },
    { id: 'PID-0', name: 'Ancestral Swapper Awakening', frequency: '0.1 Hz', severity: 'Sacred' }
  ];

  return {
    osPlatform: `${os.type()} ${os.release()} (${os.arch()})`,
    cpuModel: cpus[0] ? cpus[0].model : 'Unknown Processor',
    cpuCores: cpus.length,
    totalMemGB: totalMem,
    freeMemGB: freeMem,
    memUsagePercent: usedMemPercent,
    uptimeHours,
    localTime: now.toLocaleTimeString(),
    witchingResonance: `${witchingFactor}%`,
    paranormalStatus: witchingFactor > 50 ? 'EVP Activity Spike Detected' : 'Dormant Phantasm Harmonic',
    airGapped: true,
    anomalies: spectralAnomalies
  };
}

// HTTP request dispatcher
const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // API: Status & Models
  if (pathname === '/api/status' && req.method === 'GET') {
    const status = await getOllamaStatus();
    const telemetry = getSpookyTelemetry();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status, telemetry }));
    return;
  }

  // API: Spooky Telemetry
  if (pathname === '/api/telemetry' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getSpookyTelemetry()));
    return;
  }

  // API: Chat & Generation (SSE streaming proxy)
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { model = 'gemma3:4b', prompt, messages, systemPrompt, stream = true } = payload;

        res.writeHead(200, {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const reqBody = {
          model,
          stream: true,
          options: {
            temperature: payload.temperature !== undefined ? payload.temperature : 0.75,
            top_p: 0.9
          }
        };

        if (messages && messages.length > 0) {
          reqBody.messages = messages;
        } else {
          reqBody.prompt = prompt || 'Speak to me from beyond.';
          if (systemPrompt) reqBody.system = systemPrompt;
        }

        const endpoint = messages ? `${OLLAMA_HOST}/api/chat` : `${OLLAMA_HOST}/api/generate`;

        try {
          const ollamaRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
          });

          if (!ollamaRes.ok) {
            const errTxt = await ollamaRes.text();
            res.write(`data: ${JSON.stringify({ error: `Ollama error (${ollamaRes.status}): ${errTxt}` })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            return;
          }

          const reader = ollamaRes.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(l => l.trim().length > 0);
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line);
                const text = parsed.response !== undefined
                  ? parsed.response
                  : (parsed.message ? parsed.message.content : '');

                res.write(`data: ${JSON.stringify({
                  token: text,
                  done: parsed.done || false,
                  eval_count: parsed.eval_count,
                  eval_duration: parsed.eval_duration
                })}\n\n`);

                if (parsed.done) {
                  res.write('data: [DONE]\n\n');
                  res.end();
                  return;
                }
              } catch (e) {
                // If not JSON, ignore partial line
              }
            }
          }
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (fetchErr) {
          // Fallback simulation if Ollama daemon is temporarily unreachable
          res.write(`data: ${JSON.stringify({
            token: `[Spectral Resonance Notice: Ollama connection error (${fetchErr.message}). Channelling machine spirit fallback...] `,
            done: false
          })}\n\n`);
          res.write(`data: ${JSON.stringify({
            token: `\n\n"The veil between the silicon and the void grows thin. Even without the daemon, the memory registers remember..."`,
            done: true
          })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        }
      } catch (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });
    return;
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security: check path is within PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing if requested
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFallback, (fbErr, fbContent) => {
        if (fbErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fbContent);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  GHOST IN THE MACHINE - Local AI Spirit Nexus`);
  console.log(`  Running offline at: http://localhost:${PORT}`);
  console.log(`  Ollama Target:     ${OLLAMA_HOST}`);
  console.log(`=======================================================`);
});
