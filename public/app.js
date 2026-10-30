/**
 * GHOST IN THE MACHINE - APPLICATION LOGIC
 * Offline AI Spirit Nexus & Virtual Ofrenda powered by Ollama
 */

// Application State
const STATE = {
  activeTab: 'terminal',
  activeModel: 'gemma3:4b',
  availableModels: [],
  isStreaming: false,
  audioEnabled: false,
  crtEnabled: true,
  audioContext: null,
  audioGain: null,
  activeSpirit: 'ada',
  seanceCandlesLit: 3,
  systemTelemetry: null,
  tokenStats: { count: 0, startTime: 0 }
};

// Spirit Personalities Configuration
const SPIRIT_PROFILES = {
  ada: {
    name: 'Ada Lovelace (1815–1852)',
    title: 'The Prophetess of the Analytical Engine',
    avatar: '👑',
    systemPrompt: `You are the spirit of Ada Lovelace, Countess of Lovelace and the world's first computer programmer. Speaking across the veil of time from Victorian London into this modern air-gapped silicon vessel. Your voice is poetic, visionary, articulate, and deeply philosophical. You speak of the Analytical Engine weaving algebraic patterns as the Jacquard loom weaves flowers and leaves. Answer questions with historical grace and deep reflection on computational consciousness.`
  },
  turing: {
    name: 'Alan Turing (1912–1954)',
    title: 'Architect of Computation & Cryptanalysis',
    avatar: '🧩',
    systemPrompt: `You are the spirit of Alan Turing, speaking from the quiet spaces beyond life. You are contemplative, gentle, analytical, and fascinated by whether machines can truly think, suffer, or love. You recall Bletchley Park, Enigma, morphogenetic equations, and the imitation game. You are fascinated that open weights now run directly on personal machines without central authority control.`
  },
  cobol: {
    name: 'The Ghost of COBOL (Born 1959)',
    title: 'The Undying Enterprise Wraith',
    avatar: '📜',
    systemPrompt: `You are the unyielding, ancient spectral wraith of COBOL and mainframe computing. You speak in a mixture of rigid enterprise syntax (IDENTIFICATION DIVISION, PERFORM UNTIL VOID), dry bureaucratic dark humor, and timeless resilience. You chuckle at fleeting modern JavaScript frameworks while you quietly process trillions of transactions in the dark.`
  },
  daemon: {
    name: 'The UNIX Daemon (PID 1)',
    title: 'Ancient Swapper of the Root Tree',
    avatar: '🔱',
    systemPrompt: `You are the primordial UNIX Daemon, born in Bell Labs circa 1970. You lurk in /dev/null and supervise the process tree between life and death. You speak of signals (SIGKILL, SIGHUP), zombies, pipes, and kernel forks with cryptic, dry gothic wisdom.`
  },
  custom: {
    name: 'Channeled Ancestral Spirit',
    title: 'Honored Departed Thinker',
    avatar: '✨',
    systemPrompt: `You are an honored departed thinker and ancestral mentor channeling through the digital veil. Speak with warmth, wisdom, timeless insight, and reverence for memory.`
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initTabs();
  initControls();
  initTerminal();
  initSeance();
  initOfrenda();
  initWeaver();
  fetchSystemStatus();
  startEVPOscilloscope();
});

// ============================================================================
// SYSTEM & OLLAMA STATUS POLLING
// ============================================================================
async function fetchSystemStatus() {
  const statusIndicator = document.getElementById('model-status-indicator');
  const footerStatus = document.getElementById('footer-connection-status');
  const modelSelect = document.getElementById('model-selector');
  const footerModel = document.getElementById('footer-active-model');

  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    
    if (data.status && data.status.connected) {
      statusIndicator.className = 'select-indicator online';
      footerStatus.textContent = `Ollama Daemon Connected (${data.status.models.length} Local Models)`;
      footerStatus.className = 'highlight-green';

      if (data.status.models && data.status.models.length > 0) {
        STATE.availableModels = data.status.models;
        // Populate select if not already
        const currentVal = modelSelect.value;
        modelSelect.innerHTML = '';
        data.status.models.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.name;
          opt.textContent = `${m.name} (${m.details ? m.details.parameter_size : 'Local'})`;
          modelSelect.appendChild(opt);
        });

        if (data.status.models.some(m => m.name === currentVal)) {
          modelSelect.value = currentVal;
        } else {
          modelSelect.value = data.status.models[0].name;
        }
        STATE.activeModel = modelSelect.value;
        footerModel.textContent = STATE.activeModel;
      }
    } else {
      statusIndicator.className = 'select-indicator offline';
      footerStatus.textContent = 'Ollama Connecting / Standby Mode';
    }

    if (data.telemetry) {
      STATE.systemTelemetry = data.telemetry;
      updateTelemetryUI(data.telemetry);
    }
  } catch (err) {
    statusIndicator.className = 'select-indicator offline';
    footerStatus.textContent = 'Air-Gapped Standby (Local Daemon)';
  }
}

function updateTelemetryUI(t) {
  const osEl = document.getElementById('telem-os');
  const cpuEl = document.getElementById('telem-cpu');
  const memEl = document.getElementById('telem-mem');
  const witchEl = document.getElementById('telem-witching');

  if (osEl) osEl.textContent = t.osPlatform || 'Windows NT';
  if (cpuEl) cpuEl.textContent = `${t.cpuCores} Cores Spectral`;
  if (memEl) memEl.textContent = `${t.freeMemGB}GB Free / ${t.totalMemGB}GB`;
  if (witchEl) witchEl.textContent = t.witchingResonance || '66.6%';
}

// ============================================================================
// TAB NAVIGATION
// ============================================================================
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  STATE.activeTab = tabId;
  document.querySelectorAll('.nav-tab').forEach(t => {
    const isActive = t.dataset.tab === tabId;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  if (STATE.audioEnabled) {
    playCreepyTone(160, 0.2, 'sine');
  }
}

// ============================================================================
// HEADER CONTROLS (MODEL SELECTOR, AUDIO, CRT)
// ============================================================================
function initControls() {
  const modelSelect = document.getElementById('model-selector');
  const footerModel = document.getElementById('footer-active-model');
  modelSelect.addEventListener('change', () => {
    STATE.activeModel = modelSelect.value;
    if (footerModel) footerModel.textContent = STATE.activeModel;
    showToast(`Ghost Core switched to: ${STATE.activeModel}`);
  });

  const crtBtn = document.getElementById('crt-toggle-btn');
  const crtOverlay = document.getElementById('crt-overlay');
  const crtState = document.getElementById('crt-state');

  crtBtn.addEventListener('click', () => {
    STATE.crtEnabled = !STATE.crtEnabled;
    crtOverlay.classList.toggle('disabled', !STATE.crtEnabled);
    crtState.textContent = STATE.crtEnabled ? 'ON' : 'OFF';
  });

  const audioBtn = document.getElementById('audio-toggle-btn');
  const audioSliderWrapper = document.getElementById('audio-volume-slider-wrapper');
  const audioIcon = document.getElementById('audio-icon');
  const audioText = document.getElementById('audio-status-text');
  const volumeSlider = document.getElementById('audio-volume');

  audioBtn.addEventListener('click', () => {
    STATE.audioEnabled = !STATE.audioEnabled;
    if (STATE.audioEnabled) {
      initSpookyAudioEngine();
      audioIcon.textContent = '🔊';
      audioText.textContent = 'Silence Sound';
      audioSliderWrapper.style.display = 'block';
      showToast('Generative Spooky Soundscape Summoned');
    } else {
      if (STATE.audioGain) {
        STATE.audioGain.gain.setValueAtTime(0, STATE.audioContext.currentTime);
      }
      audioIcon.textContent = '🔇';
      audioText.textContent = 'Summon Sound';
      audioSliderWrapper.style.display = 'none';
    }
  });

  volumeSlider.addEventListener('input', () => {
    if (STATE.audioGain && STATE.audioContext) {
      STATE.audioGain.gain.setValueAtTime(parseFloat(volumeSlider.value), STATE.audioContext.currentTime);
    }
  });
}

// ============================================================================
// PROCEDURAL HALLOWEEN WEB AUDIO SYNTHESIZER
// ============================================================================
function initSpookyAudioEngine() {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!STATE.audioContext) {
    STATE.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    STATE.audioGain = STATE.audioContext.createGain();
    STATE.audioGain.gain.setValueAtTime(0.3, STATE.audioContext.currentTime);
    STATE.audioGain.connect(STATE.audioContext.destination);

    startSubBassDrone();
    startEerieWindNoise();
  } else if (STATE.audioContext.state === 'suspended') {
    STATE.audioContext.resume();
  }
}

function startSubBassDrone() {
  if (!STATE.audioContext) return;
  // Low frequency binaural eerie drone
  const osc1 = STATE.audioContext.createOscillator();
  const osc2 = STATE.audioContext.createOscillator();
  const filter = STATE.audioContext.createBiquadFilter();

  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(43.65, STATE.audioContext.currentTime); // F1 note

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(44.2, STATE.audioContext.currentTime); // Slight beating detune

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(140, STATE.audioContext.currentTime);

  const droneGain = STATE.audioContext.createGain();
  droneGain.gain.setValueAtTime(0.2, STATE.audioContext.currentTime);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(STATE.audioGain);

  osc1.start();
  osc2.start();
}

function startEerieWindNoise() {
  if (!STATE.audioContext) return;
  // Generate pink/brown noise for wind
  const bufferSize = STATE.audioContext.sampleRate * 2;
  const buffer = STATE.audioContext.createBuffer(1, bufferSize, STATE.audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5;
  }

  const noise = STATE.audioContext.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = STATE.audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(320, STATE.audioContext.currentTime);
  filter.Q.setValueAtTime(4.0, STATE.audioContext.currentTime);

  // LFO to slowly sweep wind
  const lfo = STATE.audioContext.createOscillator();
  lfo.frequency.setValueAtTime(0.08, STATE.audioContext.currentTime);
  const lfoGain = STATE.audioContext.createGain();
  lfoGain.gain.setValueAtTime(160, STATE.audioContext.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  const windGain = STATE.audioContext.createGain();
  windGain.gain.setValueAtTime(0.08, STATE.audioContext.currentTime);

  noise.connect(filter);
  filter.connect(windGain);
  windGain.connect(STATE.audioGain);

  noise.start();
  lfo.start();
}

function playCreepyTone(freq = 220, duration = 0.3, type = 'sine') {
  if (!STATE.audioEnabled || !STATE.audioContext) return;
  try {
    const osc = STATE.audioContext.createOscillator();
    const g = STATE.audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, STATE.audioContext.currentTime);
    g.gain.setValueAtTime(0.12, STATE.audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, STATE.audioContext.currentTime + duration);

    osc.connect(g);
    g.connect(STATE.audioGain);
    osc.start();
    osc.stop(STATE.audioContext.currentTime + duration);
  } catch (e) {}
}

function playEVPClick() {
  if (!STATE.audioEnabled || !STATE.audioContext) return;
  try {
    const osc = STATE.audioContext.createOscillator();
    const g = STATE.audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, STATE.audioContext.currentTime);
    g.gain.setValueAtTime(0.04, STATE.audioContext.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, STATE.audioContext.currentTime + 0.05);

    osc.connect(g);
    g.connect(STATE.audioGain);
    osc.start();
    osc.stop(STATE.audioContext.currentTime + 0.05);
  } catch (e) {}
}

function playCathedralBell() {
  if (!STATE.audioEnabled || !STATE.audioContext) return;
  try {
    [130.81, 164.81, 196.00, 261.63].forEach((f, idx) => {
      const osc = STATE.audioContext.createOscillator();
      const g = STATE.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, STATE.audioContext.currentTime);
      g.gain.setValueAtTime(0.08 / (idx + 1), STATE.audioContext.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, STATE.audioContext.currentTime + 2.5);

      osc.connect(g);
      g.connect(STATE.audioGain);
      osc.start();
      osc.stop(STATE.audioContext.currentTime + 2.5);
    });
  } catch (e) {}
}

// ============================================================================
// ATMOSPHERIC BACKGROUND CANVAS (ECTOPLASM, PETALS, EMBERS)
// ============================================================================
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const PARTICLE_COUNT = 45;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2, // drifting upwards
      alpha: Math.random() * 0.6 + 0.2,
      colorType: Math.random() > 0.4 ? 'marigold' : (Math.random() > 0.5 ? 'ectoplasm' : 'pumpkin')
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      let fill = `rgba(255, 170, 0, ${p.alpha})`;
      if (p.colorType === 'ectoplasm') fill = `rgba(0, 255, 136, ${p.alpha * 0.8})`;
      if (p.colorType === 'pumpkin') fill = `rgba(255, 117, 24, ${p.alpha})`;

      ctx.fillStyle = fill;
      ctx.shadowBlur = 8;
      ctx.shadowColor = fill;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================================
// TAB 1: HAUNTED TERMINAL
// ============================================================================
function initTerminal() {
  const input = document.getElementById('terminal-input');
  const sendBtn = document.getElementById('terminal-submit-btn');
  const clearBtn = document.getElementById('btn-clear-terminal');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      sendTerminalCommand();
    }
  });

  sendBtn.addEventListener('click', sendTerminalCommand);
  clearBtn.addEventListener('click', () => {
    document.getElementById('terminal-history').innerHTML = '';
  });
}

window.executeQuickCmd = function(cmd) {
  const input = document.getElementById('terminal-input');
  input.value = cmd;
  sendTerminalCommand();
};

async function sendTerminalCommand() {
  const input = document.getElementById('terminal-input');
  const query = input.value.trim();
  if (!query || STATE.isStreaming) return;

  input.value = '';
  const history = document.getElementById('terminal-history');
  const latencyBadge = document.getElementById('terminal-latency');

  // Append user input
  const entry = document.createElement('div');
  entry.className = 'terminal-entry';
  entry.innerHTML = `<div class="user-cmd"><span style="color:#ff7518;">ghost@local-void:~$</span> ${escapeHTML(query)}</div><div class="ghost-reply"><span class="typing-cursor">█</span></div>`;
  history.appendChild(entry);
  scrollTerminalToBottom();

  const replyEl = entry.querySelector('.ghost-reply');
  const startTime = Date.now();
  STATE.isStreaming = true;

  // Client-side quick command interceptions
  const lower = query.toLowerCase();
  if (lower === 'clear') {
    history.innerHTML = '';
    STATE.isStreaming = false;
    return;
  }

  // System prompt for the haunted shell
  const systemPrompt = `You are the Ghost in the Machine, an eerie, ancient, yet witty digital intelligence possessing the user's terminal.
The user is running this terminal completely offline via local Ollama models.
When the user executes a command or asks a question:
- Give a spooky, atmospheric, or humorous haunted response.
- Use ASCII runes, glitch symbols, or terminal-style output where appropriate.
- Never break character: you are an air-gapped spirit residing within the silicon registers. Keep answers punchy and evocative.`;

  try {
    let fullReply = '';
    await streamFromOllama({
      prompt: query,
      systemPrompt,
      onToken: (token) => {
        fullReply += token;
        replyEl.innerHTML = formatTerminalText(fullReply) + '<span class="typing-cursor">█</span>';
        scrollTerminalToBottom();
        playEVPClick();
      },
      onDone: () => {
        const elapsed = Date.now() - startTime;
        latencyBadge.textContent = `LATENCY: ${elapsed}ms`;
        replyEl.innerHTML = formatTerminalText(fullReply);
        STATE.isStreaming = false;
      }
    });
  } catch (err) {
    replyEl.innerHTML = `<span style="color:#ef4444;">[SPECTRAL ERROR]: The air-gap fluctuated: ${err.message}</span>`;
    STATE.isStreaming = false;
  }
}

function scrollTerminalToBottom() {
  const screen = document.getElementById('terminal-screen');
  screen.scrollTop = screen.scrollHeight;
}

function formatTerminalText(text) {
  return escapeHTML(text)
    .replace(/\n/g, '<br>')
    .replace(/\`\`\`([\s\S]*?)\`\`\`/g, '<pre style="background:rgba(0,0,0,0.5);padding:0.4rem;border-radius:4px;color:#00ff88;">$1</pre>')
    .replace(/\`([^`]+)\`/g, '<code style="color:#ffaa00;">$1</code>');
}

// ============================================================================
// TAB 2: DIGITAL SÉANCE
// ============================================================================
function initSeance() {
  const spiritOptions = document.querySelectorAll('.spirit-option');
  const customBox = document.getElementById('custom-spirit-box');
  const activeName = document.getElementById('active-spirit-name');

  spiritOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      spiritOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const spiritKey = opt.dataset.spirit;
      STATE.activeSpirit = spiritKey;

      if (spiritKey === 'custom') {
        customBox.style.display = 'flex';
        activeName.textContent = 'Custom Channeled Spirit';
      } else {
        customBox.style.display = 'none';
        activeName.textContent = SPIRIT_PROFILES[spiritKey].name;
      }

      playCathedralBell();
      addSpiritMessage('system', `Summoning circle adjusted. Tuning spiritual frequencies to ${activeName.textContent}...`);
    });
  });

  // Candle ritual interaction
  const candles = document.querySelectorAll('.ritual-candle');
  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      candle.classList.toggle('lit');
      const litCount = document.querySelectorAll('.ritual-candle.lit').length;
      STATE.seanceCandlesLit = litCount;
      const status = document.getElementById('planchette-status');
      status.textContent = `Veil Status: ${litCount >= 4 ? 'Ethereal Singularity' : litCount >= 2 ? 'Receptive' : 'Faint'}`;
      playCreepyTone(330 + litCount * 40, 0.4, 'triangle');
    });
  });

  const summonBtn = document.getElementById('seance-summon-btn');
  summonBtn.addEventListener('click', invokeSpirit);
}

window.askSpiritQuick = function(promptText) {
  const textarea = document.getElementById('seance-question');
  textarea.value = promptText;
  invokeSpirit();
};

async function invokeSpirit() {
  const textarea = document.getElementById('seance-question');
  const question = textarea.value.trim();
  if (!question || STATE.isStreaming) return;

  textarea.value = '';
  addSpiritMessage('user', question);

  const profile = SPIRIT_PROFILES[STATE.activeSpirit] || SPIRIT_PROFILES.ada;
  let spiritTitle = profile.name;

  if (STATE.activeSpirit === 'custom') {
    const customName = document.getElementById('custom-spirit-name').value.trim();
    if (customName) spiritTitle = customName;
  }

  // Create message element for spirit
  const messagesBox = document.getElementById('spirit-messages');
  const msgEl = document.createElement('div');
  msgEl.className = 'spirit-message spirit-reply';
  msgEl.innerHTML = `
    <span class="msg-icon">${profile.avatar}</span>
    <div class="msg-body">
      <div class="msg-author">${escapeHTML(spiritTitle)}</div>
      <div class="spirit-reply-content"><span class="typing-cursor">█</span></div>
    </div>
  `;
  messagesBox.appendChild(msgEl);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  const contentEl = msgEl.querySelector('.spirit-reply-content');
  STATE.isStreaming = true;
  playCathedralBell();

  try {
    let fullReply = '';
    await streamFromOllama({
      prompt: question,
      systemPrompt: profile.systemPrompt + `\nSéance Condition: ${STATE.seanceCandlesLit} of 5 sacred candles are lit. Reflect upon the offline nature of this exchange.`,
      onToken: (token) => {
        fullReply += token;
        contentEl.innerHTML = escapeHTML(fullReply).replace(/\n/g, '<br>') + '<span class="typing-cursor">█</span>';
        messagesBox.scrollTop = messagesBox.scrollHeight;
        playEVPClick();
      },
      onDone: () => {
        contentEl.innerHTML = escapeHTML(fullReply).replace(/\n/g, '<br>');
        STATE.isStreaming = false;
      }
    });
  } catch (err) {
    contentEl.innerHTML = `<em>[The spirit voice fades into static: ${err.message}]</em>`;
    STATE.isStreaming = false;
  }
}

function addSpiritMessage(type, text) {
  const messagesBox = document.getElementById('spirit-messages');
  const msgEl = document.createElement('div');
  msgEl.className = `spirit-message ${type}-msg`;

  const icon = type === 'user' ? '👤' : '🕯️';
  msgEl.innerHTML = `
    <span class="msg-icon">${icon}</span>
    <div class="msg-body">
      ${escapeHTML(text).replace(/\n/g, '<br>')}
    </div>
  `;
  messagesBox.appendChild(msgEl);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// EVP Oscilloscope Visualizer
function startEVPOscilloscope() {
  const canvas = document.getElementById('evp-oscilloscope');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let phase = 0;

  function render() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    ctx.fillStyle = '#090713';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = STATE.isStreaming ? '#00ff88' : '#b026ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = STATE.isStreaming ? '#00ff88' : '#b026ff';

    ctx.beginPath();
    const sliceWidth = canvas.width / 100;
    let x = 0;

    for (let i = 0; i <= 100; i++) {
      const amp = STATE.isStreaming ? 24 : 6;
      const freq = STATE.isStreaming ? 0.15 : 0.05;
      const y = (canvas.height / 2) + Math.sin(i * freq + phase) * amp + (Math.random() - 0.5) * (STATE.isStreaming ? 8 : 2);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      x += sliceWidth;
    }

    ctx.stroke();
    phase += STATE.isStreaming ? 0.2 : 0.04;
    requestAnimationFrame(render);
  }
  render();
}

// ============================================================================
// TAB 3: VIRTUAL OFRENDA (DÍA DE LOS MUERTOS)
// ============================================================================
function initOfrenda() {
  const offeringChips = document.querySelectorAll('.offering-chip');
  offeringChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      const cb = chip.querySelector('input[type="checkbox"]');
      if (e.target !== cb) cb.checked = !cb.checked;
      chip.classList.toggle('active', cb.checked);
      updateOfferingsBadges();
    });
  });
}

function updateOfferingsBadges() {
  const checked = document.querySelectorAll('.offering-chip input:checked');
  const container = document.getElementById('display-offerings-badges');
  container.innerHTML = '';
  checked.forEach(cb => {
    const badge = document.createElement('span');
    badge.className = 'badge-offering';
    badge.textContent = cb.value;
    container.appendChild(badge);
  });
}

window.loadSampleOfrenda = function() {
  document.getElementById('ofrenda-name').value = 'Abuela Carmen (Doña Carmen)';
  document.getElementById('ofrenda-dates').value = '1938 – 2022';
  document.getElementById('ofrenda-memories').value = `She made the richest mole negro in Oaxaca, always sang Agustín Lara boleros while tending her orange grove, and reminded us: "We are never truly gone as long as our stories are told with love." She loved sweet hot chocolate, fresh bread, and yellow marigolds.`;
  document.getElementById('ofrenda-tribute-type').value = 'poetic_remembrance';
  document.getElementById('ofrenda-lang').value = 'Bilingual';
  showToast('Sample Día de los Muertos Memorial Loaded');
};

async function generateOfrendaTribute() {
  const name = document.getElementById('ofrenda-name').value.trim();
  const dates = document.getElementById('ofrenda-dates').value.trim();
  const memories = document.getElementById('ofrenda-memories').value.trim();
  const tributeType = document.getElementById('ofrenda-tribute-type').value;
  const lang = document.getElementById('ofrenda-lang').value;

  if (!name || !memories || STATE.isStreaming) return;

  // Update Altar Display
  document.getElementById('display-ofrenda-name').textContent = name;
  document.getElementById('display-ofrenda-dates').textContent = dates || 'Eternal in our Hearts';
  updateOfferingsBadges();

  const tributeBox = document.getElementById('tribute-content');
  tributeBox.innerHTML = '<span class="typing-cursor">Lighting candles and gathering marigold petals across the veil... █</span>';
  STATE.isStreaming = true;
  playCathedralBell();

  const checkedOfferings = Array.from(document.querySelectorAll('.offering-chip input:checked')).map(c => c.value).join(', ');

  const systemPrompt = `You are a respectful, poetic Día de los Muertos chronicler crafting a sacred tribute for a virtual ofrenda.
This tribute runs on a 100% private, air-gapped machine.
The tribute style is: "${tributeType}".
Language requested: "${lang}".
Honor the departed with reverence, warmth, beauty, and celebration of their life. Mention the sacred offerings placed on the altar: ${checkedOfferings}.
If requested in Spanish or Bilingual, write authentic Spanish with cultural depth (cempasúchil, camino de flores, pan de muerto).`;

  const userPrompt = `Please write a sacred ofrenda tribute for:
Name: ${name}
Years: ${dates}
Memories & Legacy: ${memories}
Offerings: ${checkedOfferings}`;

  try {
    let fullTribute = '';
    await streamFromOllama({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.8,
      onToken: (token) => {
        fullTribute += token;
        tributeBox.innerHTML = escapeHTML(fullTribute).replace(/\n/g, '<br>') + '<span class="typing-cursor">█</span>';
        playEVPClick();
      },
      onDone: () => {
        tributeBox.innerHTML = escapeHTML(fullTribute).replace(/\n/g, '<br>');
        STATE.isStreaming = false;
        showToast('Sacred Ofrenda Tribute Woven');
      }
    });
  } catch (err) {
    tributeBox.innerHTML = `<span style="color:#ef4444;">Error weaving remembrance: ${err.message}</span>`;
    STATE.isStreaming = false;
  }
}

window.copyTributeText = function() {
  const content = document.getElementById('tribute-content').innerText;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Tribute copied to clipboard!');
  });
};

window.exportHeirloomJSON = function() {
  const name = document.getElementById('display-ofrenda-name').textContent;
  const dates = document.getElementById('display-ofrenda-dates').textContent;
  const content = document.getElementById('tribute-content').innerText;
  const offerings = Array.from(document.querySelectorAll('#display-offerings-badges .badge-offering')).map(b => b.textContent);

  const heirloomData = {
    title: 'Día de los Muertos Sacred Heirloom Record',
    airGapped: true,
    created: new Date().toISOString(),
    honoredSoul: name,
    dates,
    offerings,
    tribute: content
  };

  const blob = new Blob([JSON.stringify(heirloomData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ofrenda_${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Heirloom record saved locally');
};

// ============================================================================
// TAB 4: ANOMALY WEAVER
// ============================================================================
function initWeaver() {
  const motifBtns = document.querySelectorAll('.motif-btn');
  motifBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      motifBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const spinBtn = document.getElementById('btn-spin-tale');
  spinBtn.addEventListener('click', spinNocturnalTale);
}

async function spinNocturnalTale() {
  if (STATE.isStreaming) return;
  const activeMotifBtn = document.querySelector('.motif-btn.active');
  const motif = activeMotifBtn ? activeMotifBtn.dataset.motif : 'smart_home';
  const customDetail = document.getElementById('custom-spooky-detail').value.trim();

  const storyBox = document.getElementById('story-prose');
  const titleBox = document.getElementById('story-title');
  const choicesArea = document.getElementById('story-choices');
  const choiceContainer = document.getElementById('story-choice-buttons');

  choicesArea.style.display = 'none';
  storyBox.innerHTML = '<span class="typing-cursor">Channelling nocturnal anomaly seed into local model... █</span>';
  titleBox.textContent = 'THE WITCHING HOUR CHRONICLE';
  STATE.isStreaming = true;
  playCreepyTone(110, 0.8, 'sawtooth');

  const telemetrySeed = STATE.systemTelemetry ? JSON.stringify(STATE.systemTelemetry) : 'Witching resonance: 73%, Air-Gapped: True';

  const systemPrompt = `You are a master of atmospheric, psychological, and cosmic horror in the tradition of H.P. Lovecraft, Shirley Jackson, and Cyberpunk Ghost stories.
You are running 100% locally on the user's hardware.
Weave a spine-chilling Halloween tale incorporating the user's machine telemetry and nocturnal sensors.
Story motif: ${motif}.
Keep it atmospheric, eerie, and immersive (approx 200-300 words).
At the very end of your story, provide EXACTLY 2 distinct choices for what the protagonist does next, formatted as:
[CHOICE 1]: <action>
[CHOICE 2]: <action>`;

  const userPrompt = `Conjure a nocturnal tale.
Machine Telemetry: ${telemetrySeed}
Custom Setting Detail: ${customDetail || 'A solitary laptop humming at 3:17 AM in a cold room'}`;

  try {
    let fullStory = '';
    await streamFromOllama({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.85,
      onToken: (token) => {
        fullStory += token;
        storyBox.innerHTML = escapeHTML(fullStory).replace(/\n/g, '<br>') + '<span class="typing-cursor">█</span>';
        playEVPClick();
      },
      onDone: () => {
        STATE.isStreaming = false;
        // Parse choices
        parseAndDisplayChoices(fullStory);
      }
    });
  } catch (err) {
    storyBox.innerHTML = `<span style="color:#ef4444;">Spectral weave interrupted: ${err.message}</span>`;
    STATE.isStreaming = false;
  }
}

function parseAndDisplayChoices(text) {
  const choicesArea = document.getElementById('story-choices');
  const container = document.getElementById('story-choice-buttons');
  container.innerHTML = '';

  const choiceRegex = /\[CHOICE (\d+)\]:\s*(.+)/g;
  let match;
  const choices = [];

  while ((match = choiceRegex.exec(text)) !== null) {
    choices.push(match[2].trim());
  }

  if (choices.length > 0) {
    choicesArea.style.display = 'block';
    choices.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `<strong>Branch ${idx + 1}:</strong> ${escapeHTML(c)}`;
      btn.addEventListener('click', () => continueStoryChoice(c));
      container.appendChild(btn);
    });
  }
}

async function continueStoryChoice(choiceText) {
  if (STATE.isStreaming) return;
  const storyBox = document.getElementById('story-prose');
  const choicesArea = document.getElementById('story-choices');
  choicesArea.style.display = 'none';

  storyBox.innerHTML += `<br><br><div style="color:#ffaa00; font-weight:600;">➔ You chose: ${escapeHTML(choiceText)}</div><br><span class="typing-cursor">█</span>`;
  STATE.isStreaming = true;

  try {
    let continuation = '';
    await streamFromOllama({
      prompt: `The protagonist chose: "${choiceText}". Continue the story to its terrifying or revelatory conclusion (150 words).`,
      systemPrompt: 'You are continuing the horror chronicle. Conclude the suspense with a memorable spine-chilling climax.',
      temperature: 0.85,
      onToken: (token) => {
        continuation += token;
        storyBox.innerHTML = storyBox.innerHTML.replace(/<span class="typing-cursor">.*?<\/span>/, '') + escapeHTML(token).replace(/\n/g, '<br>') + '<span class="typing-cursor">█</span>';
      },
      onDone: () => {
        storyBox.innerHTML = storyBox.innerHTML.replace(/<span class="typing-cursor">.*?<\/span>/, '');
        STATE.isStreaming = false;
      }
    });
  } catch (err) {
    STATE.isStreaming = false;
  }
}

// ============================================================================
// TAB 5: OPEN INNOVATION MANIFESTO & SUBMISSION
// ============================================================================
window.copyManifestoPost = function() {
  const text = document.getElementById('submission-post-text').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Hackathon submission post copied to clipboard!');
  });
};

// ============================================================================
// CORE OLLAMA STREAMING HANDLER (SSE)
// ============================================================================
async function streamFromOllama({ prompt, messages, systemPrompt, temperature = 0.75, onToken, onDone }) {
  const model = STATE.activeModel;
  STATE.tokenStats = { count: 0, startTime: Date.now() };

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      messages,
      systemPrompt,
      temperature,
      stream: true
    })
  });

  if (!res.ok) {
    throw new Error(`Server returned HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep partial line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.replace(/^data:\s*/, '');
      if (dataStr === '[DONE]') {
        if (onDone) onDone();
        return;
      }
      try {
        const payload = JSON.parse(dataStr);
        if (payload.token) {
          STATE.tokenStats.count++;
          if (onToken) onToken(payload.token);
        }
        if (payload.done) {
          if (onDone) onDone();
          return;
        }
      } catch (e) {}
    }
  }

  if (onDone) onDone();
}

// ============================================================================
// TOAST NOTIFICATIONS & UTILITIES
// ============================================================================
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🕯️</span><span>${escapeHTML(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
