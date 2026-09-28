<div align="center">

# 🛡️ ARKA PATRA — `~/security-lab`
### Cyber Security Student · Security-Focused Developer · West Bengal, India

**Building secure software. Exploring cybersecurity. Turning ideas into working tools.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](./index.html)
[![CSS3](https://img.shields.io/badge/CSS3-FF2E0E?style=for-the-badge&logo=css3&logoColor=white)](./index.html)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](./index.html)
[![No Build](https://img.shields.io/badge/NO_BUILD-3DFF88?style=for-the-badge&logo=terminal&logoColor=black)](./index.html)
[![Responsive](https://img.shields.io/badge/RESPONSIVE-131314?style=for-the-badge&logo=mobile&logoColor=white)](./index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

`B.Sc Cyber Security @ GNIT` · `Python / JS` · `Web Security` · `System: ONLINE`

[🚀 View Work](./projects.html) · [🧬 About](./about.html) · [📬 Contact](./contact.html)

</div>

---

```bash
arka@security-lab:~$ whoami
> arka-patra

arka@security-lab:~$ focus
> cybersecurity + development

arka@security-lab:~$ ls
> index.html  projects.html  about.html  contact.html

arka@security-lab:~$ status
> SYSTEM ONLINE ██████████ 100%
```

> A zero-dependency, dark-red **CY•FOCUS** portfolio. Four static HTML files. No framework. No build step. No backend. Just open and run.

---

## ⚡ What makes this different?

Not another generic template. This is a **threat-monitor styled portfolio**:

- 🔴 **Red Device Panel Hero** — wire-globe, silhouette, Threat Monitor side-card, marquee tape (`CY•FOCUS / PASSWORD SECURITY / WEB SECURITY`)
- 🎞️ **Dual Infinite Marquee** — white + red tapes scrolling opposite directions, tilted -1.2deg
- 🧪 **Interactive Demos inside cards** — animated risk-meter, expandable technical breakdowns, filterable grid
- 👤 **About page** — personal essay, education dossier, cybersecurity journey in one essay-style box
- 📬 **Standalone Contact page** — two-card layout (info rail + message form with validation)
- 📱 **Device-friendly Full Screen** — 100vw layout, `100svh` hero, hamburger + fullscreen mobile menu, scroll-spy nav
- 👁️ **Reveal-on-scroll + scroll cue** — IntersectionObserver everywhere, zero libraries

---

## 🧰 Arsenal — Featured Builds

> ⚠️ **Disclaimer:** Educational / demo security tools to explore real concepts — not production security products. All analysis is 100% client-side; nothing leaves the browser unless noted.

| # | Project | Type | Live | Code |
|---|---------|------|------|------|
| 00 | **Website Security Copilot** `FEATURED` | Browser Extension + Web Security | [Live Demo](https://website-security-copilot-3m0hij8jl-arkap1502-9053s-projects.vercel.app/) | [Code](https://github.com/arkap1502/Website-Security-Copilot) |
| 01 | **Altron Password Inspector** `FEATURED` | Password Security | [Live Demo](https://arkap1502.github.io/password-making/) | [Code](https://github.com/arkap1502/password-making) |
| 02 | **URL Threat Scanner** | Phishing Detection | [Live Demo](https://arkap1502.github.io/URL-Scanner/) | [Code](https://github.com/arkap1502/URL-Scanner) |
| 03 | **NexVault** `FEATURED · GROUP · IN PROGRESS` | Secure Vault Web App | [Live Demo](https://secure-vault-system.onrender.com/) | — |
| 04 | **Humanize AI** `IN PROGRESS` | AI Text Tool | [Live Demo](https://arkap1502.github.io/Humanize-AI/) | [Code](https://github.com/arkap1502/Humanize-AI) |
| 05 | **Hidden-Prompt Scanner for Documents** `FEATURED` | Document Security · Prompt Injection Detection | [Live Demo](https://hidden-prompt-scanner-for-documents.onrender.com/) | [Code](https://github.com/arkap1502/Hidden-prompt-scanner-for-documents.) |
| 06 | **Prototype Safety Check** | Prototype Safety · Web Security | [Live Demo](https://prototype-safety-check.onrender.com/) | [Code](https://github.com/arkap1502/prototype-safety-check) |

### 00 — Website Security Copilot ◈ Featured
AI-powered assistant that scans, explains, and helps fix website security issues — plus an Always-On browser guard.
- 🧩 **Primarily a browser extension** — the live demo shows the UI & lets you test a URL; full auto-guard needs Load unpacked (`extension/` folder)
- Manual Scan Mode: URL input → headers (`CSP`, `HSTS`, `X-Frame-Options`), SSL/TLS, cookies, open ports / fingerprinting, DNS-email (`SPF`, `DMARC`, `DKIM`) + AI risk score & plain-English fixes
- Always-On Guard Mode: ON/OFF toggle → auto-watches every site, instant verdict `Safe ✅ / Suspicious ⚠️ / Blocked ⛔`, auto-blocks harmful sites (force-open only when OFF)
- Every finding ships severity + evidence + why-it-matters + copy-paste fix (Nginx / Apache / Next.js); risk score `100 - min(100, 10*C + 5*H + 2*M + 1*L)`, grades A–F
- Passive-safe by default (normal requests only, `robots.txt` respected); AI only explains tool output, never invents findings
- Stack: Next.js + Tailwind, FastAPI, Python (`httpx`, `ssl`, `dnspython`), SQLite → Postgres, Docker, MV3 extension

### 01 — Altron Password Inspector
Futuristic HUD for password generation + strength checking.
- `crypto.getRandomValues()` — never `Math.random()`
- Length / charset / punctuation controls, show-hide, copy, clear
- Live strength HUD · Fully client-side

### 02 — URL Threat Scanner
Browser-based URL risk analyzer (0–100).
- Raw-IP, shady-TLD, brand-misspelling, phishing-keyword detection
- Per-finding explanations + verdict · Animated risk meter in-card

### 03 — NexVault ◈ Group Project
> *Your data, your vault, your control.*
- Auth-gated vault dashboard, encrypted access-controlled storage
- Green-glow `group-card` highlight + pulsing `IN PROGRESS` pill

### 04 — Humanize AI
React + Express app with **zero-build offline fallback** — same engine ported to vanilla JS for GitHub Pages. Light / Medium / Strong modes, real-time transform, word-count diff.

### 05 — Hidden-Prompt Scanner for Documents ◈ Featured
Scans `PDF`, `DOCX`, `TXT`, `MD`, `HTML` for hidden prompt-injection attacks aimed at LLMs.
- Invisible-text heuristics — white-on-white, `< 2pt` / zero-size fonts, transparent text, off-page content, zero-width chars (`U+200B/C/D, U+FEFF`)
- Metadata / comments / footnotes / annotations scan + injection-phrase match (`ignore previous instructions`, `disregard system prompt`, `you are now ...`, etc.)
- `LOW / MEDIUM / HIGH` risk scoring · CLI + JSON report · Flask web UI · Fully local scan
- Stack: Python, Flask, PyPDF2, python-docx, BeautifulSoup — deployed on Render

### 06 — Prototype Safety Check
Passive safety scanner for **deployed** prototypes (never repo links).
- 6 checks — SQLi, XSS, malware, phishing, DoS exposure, MitM (HTTPS / HSTS / TLS)
- Safe / Risky / Critical verdict with reasons + fix suggestions
- Web UI + `scanner.py` CLI + `GET /api/scan?url=...` API + re-scan history
- Stack: Python, Flask, HTML / JS — deployed on Render

---

## 🗺️ Site Map

```
index.html      → DASHBOARD (hero + device panel + tapes)
                  #skills   → SKILL MATRIX
                  #projects → SPOTLIGHT (flagship build + View All tile → projects.html)
projects.html   → ARCHIVE (all 07 builds, filter: All / Cybersecurity / Web)
about.html      → ABOUT (personal essay + education dossier + cybersecurity journey, one-box story)
                  + WORK HISTORY (Forage virtual experience) + 08 CERTIFICATES with notes
contact.html    → CONTACT (info rail + validated message form, no backend — mailto fallback)
```

Global nav on every page: `DASHBOARD → ABOUT → PROJECTS` + red `CONTACT` button → `contact.html`.

---

## 🧬 Skill Matrix

| Domain | Stack |
|--------|-------|
| ◇ Programming | Python · JavaScript · HTML · CSS · SQL |
| ◈ Cybersecurity | Web Security · Phishing Awareness · Password Security · Security Analysis · Fundamentals |
| ◆ Development | Flask · SQLite · Frontend · Responsive UI · REST / API concepts |
| ▣ OS | Windows 11 · Linux |
| ⚙ Tools | VS Code · Git · GitHub · Microsoft Office |
| ✦ Soft | Problem Solving · Communication · Teamwork · Logical Thinking · Continuous Learning |

---

## 👤 About Page

`about.html` holds the personal side in the same theme:

- **Essay** — interests (Cybersecurity, AI, Web Security, Software Engineering), project areas, toolbox chips
- **Education** — B.Sc Cyber Security @ GNIT (2024 — Present), Higher Secondary (2024), Secondary (2022)
- **Cybersecurity Journey** — full story condensed into one essay-style box + route chips
- **Work History** — Thiranex Cyber Security internship (Aug–Sept 2026, verified) + Forage virtual experience (6 job simulations) + open-to-work card
- **Certificates (08)** — Forage Technical Interviews · Cisco Intro to Cybersecurity · Cisco Hardware Basics · Deloitte Cyber · NUL Career Readiness · BCLP Interview Success · CommBank Cybersecurity · Datacom AI at Work
- CTA banner → `projects.html`

---

## 📬 Contact Page

`contact.html` is a standalone two-card layout:

- **Left rail** — `REPLIES WITHIN 24 HOURS` badge, channel rows (Email click-to-copy, Phone, LinkedIn, GitHub), address card
- **Right card** — validated message form (name / email / message required); on submit it opens the visitor's mail app with a pre-filled email — **no backend**
- Set your real address in `data-copy="your.email@example.com"` (`contact.html` → `#emailBtn`)

---

## 🚀 Run it in 10 seconds

No install. No build. No dependencies.

**Option 1 — double-click:**
```bash
open index.html
# or just double-click index.html in Explorer
```

**Option 2 — local server (recommended):**
```bash
python3 -m http.server 8000
# visit → http://localhost:8000
```

**Fonts (CDN only):** Space Grotesk · Inter · JetBrains Mono

### File structure
```
portfolio/
├── index.html      → dashboard (hero, skills, flagship spotlight)
├── projects.html   → full archive, all 07 builds with filters
├── about.html      → essay + education + cybersecurity journey
├── contact.html    → contact channels + message form
├── README.md       → you are here
└── LICENSE         → MIT
```

---

## 🎨 Design Tokens — CY FOCUS DARK + RED

```css
--bg: #131314;        --surface: #1c1c1f;
--cyan: #ff2e0e;      --green: #3dff88;
--amber: #ff5a1f;     --text: #f2efe9;
--font-display: 'Space Grotesk';
--font-body: 'Inter';
--font-mono: 'JetBrains Mono';
```

Glass cards: `linear-gradient(180deg, #202023, #171719)` + `0 0 0 4px #0b0b0c` ring + deep shadow. Selection: `rgba(255,46,14,0.4)`.

---

## 🔧 Make it yours — 5-min checklist

- [ ] **CV button** — `#downloadCvBtn` in `index.html` currently fires an `alert()`; point `href` to your PDF and delete the placeholder handler
- [ ] **Email** — `data-copy="your.email@example.com"` on `#emailBtn` in `contact.html` → your real email
- [ ] **Phone** — `tel:+919748813115` in `contact.html` → your number
- [ ] **Socials** — hero + contact + footer URLs (GitHub / LinkedIn / X / Instagram / Threads)
- [ ] **Projects** — update Live Demo / Code links under `github.com/arkap1502` as repos move
- [ ] **Address** — `.c-addr` block in `contact.html` → your city

---

## 🌐 Browser Support

Modern evergreen: Chrome · Firefox · Safari · Edge. Uses `backdrop-filter`, CSS custom properties, `IntersectionObserver`, `crypto.getRandomValues()`, `navigator.clipboard`.

Respects `prefers-reduced-motion` — animations collapse to instant render.

---

## 📬 Connect — Let's Build Something Secure

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-arkap1502-181717?style=for-the-badge&logo=github)](https://github.com/arkap1502)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Arka_Patra-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/arka-patra-579110422/)
[![X](https://img.shields.io/badge/X-arkap1502-000000?style=for-the-badge&logo=x)](https://x.com/arkap1502)
[![Instagram](https://img.shields.io/badge/Instagram-_its_me_chikuuuu-E4405F?style=for-the-badge&logo=instagram)](https://www.instagram.com/_its_me_chikuuuu/?hl=en)
[![Threads](https://img.shields.io/badge/Threads-_here_chikuu_005-000000?style=for-the-badge&logo=threads)](https://www.threads.com/@_here_chikuu_005)

📞 `+91 97488 13115` · 📍 Madhyamgram, North 24 Parganas, Kolkata 700130

</div>

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

<div align="center">

© 2026 Arka Patra. Built with curiosity, code & security in mind. 🛡️

`// END OF TRANSMISSION`

</div>
