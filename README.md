# 🎃 Ghost in the Machine: Offline Spirit Nexus & Virtual Ofrenda 🏵️

> **Theme:** Ghost in the Machine — Open Source AI at its Core  
> **Occasion:** Halloween (Oct 31) & Día de los Muertos (Nov 1–2)  
> **Engine:** 100% Offline, Air-Gapped Local Inference via **Ollama** (`gemma3:4b`, `llama3.1:latest`, `qwen2.5-coder:7b`)  
> **UI Aesthetic:** Dark Gothic Cyberpunk + Traditional Mexican Día de los Muertos Candlelit Warmth  

---

## 🌟 What We Built

**Ghost in the Machine** is an immersive, multi-sensory web application that merges eerie Halloween cyber-lore with the sacred Mexican tradition of **Día de los Muertos** (Day of the Dead), powered completely offline by open-weight AI models.

### Core Features:

1. **📟 The Haunted Terminal ("Possessed Shell")**:
   - An interactive CRT phosphor terminal where a resident digital phantasm possesses the system shell.
   - Run spooky commands (`whoami`, `ls /graveyard`, `cat /dev/soul`, `ps aux --paranormal`, `fortune --ominous`) or whisper any freeform question.
   - The local model responds in real-time streaming tokens with eerie, gothic wit and ASCII glitch runes.
   
2. **🔮 The Digital Séance ("Spirits of Computing Past")**:
   - Channel the digital echoes of computing legends across the veil of time:
     - **Ada Lovelace** (1815–1852) — *The First Programmer & Prophetess of Analytical Engines*
     - **Alan Turing** (1912–1954) — *Architect of Computation & Cryptanalysis*
     - **The Ghost of COBOL** (Born 1959) — *The Ancient Mainframe Wraith of Enterprise Silicon*
     - **The UNIX Daemon (PID 1)** — *Primordial Swapper of the Bell Labs Root Tree*
     - **Custom Ancestral Spirits** — *Invoke any historic mentor, coder, or family thinker*
   - Interactive séance candles that adjust spiritual sensitivity, coupled with a real-time **EVP frequency oscilloscope**.

3. **🏵️ The Virtual Ofrenda ("Altar de Recuerdos")**:
   - A glowing, sacred candlelit altar adorned with *cempasúchil* (marigolds), *papel picado*, *pan de muerto*, *calaveras de azúcar* (sugar skulls), and veladoras.
   - Users write tributes and memories for their loved ones and departed mentors.
   - The local AI crafts heartfelt, sacred tributes:
     - **Sacred Poetic Remembrances** (warm, reverent eulogies)
     - **Calaveritas Literarias** (traditional Mexican satirical / festive verse)
     - **Oral History Chronicles** (preserving stories so they're never lost)
   - Features one-click sample loading, heirloom JSON export, and print/PDF preservation cards.

4. **📜 The Nocturnal Anomaly Weaver**:
   - Feeds real machine hardware telemetry (CPU resonance, uptime, witching hour clock, spectral anomalies like `EVP-404`) into Ollama.
   - Spins bespoke nocturnal horror stories ("What happened on this laptop at 3:17 AM?") with interactive Choose-Your-Own-Path branching.

5. **🎵 Procedural Halloween Web Audio Synthesizer**:
   - Generates authentic sub-bass binaural drones, eerie wind oscillations, EVP keystroke chirps, and cathedral bell tolls natively using the HTML5 Web Audio API.
   - Zero external audio files or dependencies required — operates completely air-gapped!

---

## ⚖️ Why Open Innovation Matters for This Project

> *"Día de los Muertos brings us together to honor our ancestors; Halloween reminds us of the mysteries lurking in the dark. Open AI ensures that the line between human memory and computational legacy remains in our own hands."*

### 1. Air-Gapped Privacy for Sacred Memories
In the **Virtual Ofrenda**, users share deeply vulnerable, intimate memories of their departed loved ones, family anecdotes, and personal grief. 
- **The Closed AI Pitfall:** Sending these sacred reflections to closed third-party cloud APIs means your family's memories could be logged, scanned for behavioral advertising, or retained in commercial data warehouses.
- **The Open Advantage:** By using open-weight models (`gemma3:4b`, `llama3.1:latest`) running on Ollama, **all inference happens directly in RAM on your own machine**. Not a single packet leaves your laptop. Your family stories remain 100% private and sovereign.

### 2. Works with the Lights & Internet Off
True digital self-reliance means an application works even during a power outage on a stormy Halloween night, or in a rural cemetery in Oaxaca with no cellular signal.
- **The Closed AI Pitfall:** Closed services become useless without constant internet connectivity, paid subscriptions, or during cloud outages.
- **The Open Advantage:** Because Ollama runs locally, *Ghost in the Machine* is entirely functional in a complete air-gap. Turn off your Wi-Fi, unplug the Ethernet cable, and the spirits continue to speak.

### 3. Model Freedom & No Unannounced Censorship
- You can instantly switch between lightweight, lightning-fast models (`gemma3:4b`), deep literary engines (`llama3.1:latest`), or code-specialized models (`qwen2.5-coder:7b`).
- You have complete control over system prompts, temperature, and context without fear that a closed API provider will quietly deprecate the endpoint or inject unwanted boilerplate guardrails.

### 4. Zero API Fees & Infinite Longevity
- Running local models costs **$0.00** in API fees.
- Open weights belong to humanity. The weights you download today will still run decades from now on future hardware, keeping the memory of your loved ones accessible forever.

---

## 🚀 Quickstart Guide

### Prerequisites:
1. **Node.js** (v18+)
2. **Ollama** installed with any open-weight model:
   ```bash
   ollama pull gemma3:4b
   # Or optionally:
   # ollama pull llama3.1
   # ollama pull qwen2.5-coder:7b
   ```

### Running Locally:
1. Ensure Ollama is running:
   ```bash
   ollama serve
   ```
2. Start the Ghost in the Machine server:
   ```bash
   node server.js
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Tech Stack Architecture

```
┌────────────────────────────────────────────────────────┐
│             Ghost in the Machine Frontend              │
│  - Vanilla HTML5 / CSS3 (Dark Glassmorphism & CRT)     │
│  - Generative Procedural Web Audio Synth Engine         │
│  - Real-Time HTML5 Canvas EVP Oscilloscope & Petals    │
└───────────────────────────┬────────────────────────────┘
                            │ SSE Stream (Server-Sent Events)
┌───────────────────────────▼────────────────────────────┐
│              Local Node.js Micro-Server                │
│  - Zero npm dependencies (Native HTTP / OS Telemetry)  │
│  - Hardware Telemetry & Witching Hour Calculators       │
└───────────────────────────┬────────────────────────────┘
                            │ Localhost HTTP (11434)
┌───────────────────────────▼────────────────────────────┐
│                    OLLAMA DAEMON                       │
│  - gemma3:4b        (Fast, Vision-ready)               │
│  - llama3.1:latest  (8B Deep Narrative Lore)           │
│  - qwen2.5-coder:7b (Spooky Shell Code & Logic)        │
└────────────────────────────────────────────────────────┘
```

---

## 📜 License
Open source under the MIT License. Built with pride for open AI innovation, Halloween, and Día de los Muertos! 🎃🏵️💀
