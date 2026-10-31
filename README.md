<div align="center">

# Arka Patra — Portfolio

**Cyber security student · Security-focused developer · West Bengal, India**

Building secure software. Exploring cybersecurity and turning ideas into working tools.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](./index.html)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](./index.html)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](./index.html)
[![No build](https://img.shields.io/badge/NO_BUILD-18202E?style=for-the-badge&logo=terminal&logoColor=white)](./index.html)
[![Responsive](https://img.shields.io/badge/RESPONSIVE-5A6578?style=for-the-badge&logo=responsive&logoColor=white)](./index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-B5303C?style=for-the-badge)](./LICENSE)

</div>

---

## Overview

A six-page static portfolio redesigned around a calm, light editorial system: ink headlines, mist surfaces, white cards and restrained crimson accents. It has no framework, no build step and no backend.

The design follows the supplied concept deck:

| Token | Value | Use |
|---|---|---|
| Ink | `#18202E` | Landing background, headlines, flagship card |
| Slate | `#5A6578` | Body copy, secondary labels |
| Mist | `#F3F5F8` | Page surfaces and quiet cards |
| White | `#FFFFFF` | Cards, header, form fields |
| Crimson | `#B5303C` | Buttons, active filters, badges, links |
| Blush | `#F7E3E5` | Soft badges and icon tiles |

- **Headings:** Space Grotesk
- **Body:** Inter
- **Labels and UI:** JetBrains Mono
- Flat cards with rounded corners, soft grey shadows and no glow
- Gentle fade-in on scroll and a small hover lift; `prefers-reduced-motion` is respected
- One shared stylesheet (`assets/site.css`) and one shared script (`assets/site.js`) across all pages

---

## Pages

| Page | What it holds |
|---|---|
| [`index.html`](./index.html) | Ink landing hero, wireframe globe, threat-monitor card, CV and portfolio actions, crimson ticker |
| [`dashboard.html`](./dashboard.html) | Mist hero, live threat-monitor card, six skill tiles, dark flagship spotlight |
| [`projects.html`](./projects.html) | Eight builds, four filters, expandable technical details, stack chips and GitHub strip |
| [`about.html`](./about.html) | Essay, profile card, education, work history and the longer story |
| [`certificates.html`](./certificates.html) | Verified Thiranex internship spotlight plus nine certificate cards with PDF proofs |
| [`contact.html`](./contact.html) | Contact rail, click-to-copy email, validated message form with inline errors |

---

## Builds

> Educational and demo security tools built to explore real concepts. These are not production security products.

| # | Project | Category | Status | Links |
|---|---|---|---|---|
| 00 | **Website Security Copilot** | Cybersecurity · Browser extension | Featured | [Live](https://website-security-copilot-3m0hij8jl-arkap1502-9053s-projects.vercel.app/) · [Code](https://github.com/arkap1502/Website-Security-Copilot) |
| 01 | **Altron Password Inspector** | Cybersecurity · Password security | Featured | [Live](https://arkap1502.github.io/password-making/) · [Code](https://github.com/arkap1502/password-making) |
| 02 | **URL Threat Scanner** | Web security · Phishing detection | — | [Live](https://arkap1502.github.io/URL-Scanner/) · [Code](https://github.com/arkap1502/URL-Scanner) |
| 03 | **NexVault** | Cybersecurity · Data protection | In progress | [Live](https://secure-vault-system.onrender.com/) |
| 04 | **Humanize AI** | Web development · AI text tool | In progress | [Live](https://arkap1502.github.io/Humanize-AI/) · [Code](https://github.com/arkap1502/Humanize-AI) |
| 05 | **Hidden-Prompt Scanner for Documents** | Cybersecurity · Prompt injection detection | Featured | [Live](https://hidden-prompt-scanner-for-documents.onrender.com/) · [Code](https://github.com/arkap1502/Hidden-prompt-scanner-for-documents%2E) |
| 06 | **Prototype Safety Check** | Cybersecurity · Prototype safety | — | [Live](https://prototype-safety-check.onrender.com/) · [Code](https://github.com/arkap1502/prototype-safety-check) |
| 07 | **Laptop Antivirus** | Cybersecurity · Real-time protection | Featured · local build | — |

Each project card opens a short technical breakdown with its stack, so the archive stays readable without loading extra pages.

---

## Certificates

`certificates.html` holds ten proofs:

- 1 verified internship certificate — Thiranex, Cyber Security Intern (Aug–Sept 2026)
- 9 course and job-simulation certificates from WSCube Tech, Forage, Cisco Networking Academy, Deloitte, Commonwealth Bank, Datacom, the National Urban League and BCLP

All PDFs live in `assets/` and open in a new tab.

---

## Contact form

The form validates name, email and message in the browser and sends through [FormSubmit](https://formsubmit.co/) with `fetch`. There is no backend and no mail client needed. If delivery fails, the page shows a direct email fallback. The email row uses the Clipboard API, with a legacy copy fallback for browsers that block it.

Contact details on the page:

- `arkap1502@gmail.com`
- `+91 97488 13115`
- [LinkedIn](https://www.linkedin.com/in/arka-patra-579110422/)
- [GitHub](https://github.com/arkap1502)
- Madhyamgram, Kolkata 700130, West Bengal, India

---

## Run locally

No install. No build. No dependencies.

```bash
# from the project root
python -m http.server 8000
```

Open <http://localhost:8000>. A local server is recommended so the Clipboard API and the form request behave like they do in production.

You can also open `index.html` directly, though `file://` limits some browser APIs.

---

## File structure

```text
portfolio/
├── index.html            → ink landing page
├── dashboard.html        → skills and flagship spotlight
├── projects.html         → filterable archive of eight builds
├── about.html            → story, profile, education, work history
├── certificates.html     → internship spotlight + nine certificate cards
├── contact.html          → contact rail + message form
├── assets/
│   ├── site.css          → shared design system and responsive styles
│   ├── site.js           → nav, reveals, filters, copy, form validation
│   ├── arka-patra.jpg    → profile photo
│   ├── Arka_Patra_CV.pdf → downloadable CV
│   ├── Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
│   └── cert-*.pdf        → nine course / simulation certificates
├── README.md
└── LICENSE
```

---

## Behaviour and accessibility

- Sticky header on content pages; overlay menu below 980px
- Mobile menu closes on Escape, on link click and on outside click
- Project filters update `aria-pressed`, the live build count and close any details panel that gets filtered out
- Scroll reveals are skipped when `prefers-reduced-motion: reduce` is set
- Focus-visible outlines, a skip link, labelled form fields with `aria-live` errors, and descriptive link text
- Semantic landmarks and one `h1` per page
- All internal links, images and ten PDF proofs resolve locally

---

## Deploy

The site is plain static files, so any static host works.

**Vercel / Netlify:** framework preset “Other”, root directory `./`, no build command, no environment variables. Publish the repository root.

**GitHub Pages:** serve the repository root from the default branch. All paths are relative, so the site works from a project subpath too.

Make sure `assets/` is included in the deployment — the CV, certificates and profile photo live there.

---

## Connect

- GitHub: [@arkap1502](https://github.com/arkap1502)
- LinkedIn: [arka-patra](https://www.linkedin.com/in/arka-patra-579110422/)
- Email: [arkap1502@gmail.com](mailto:arkap1502@gmail.com)
- X: [@arkap1502](https://x.com/arkap1502)
- Instagram: [@_its_me_chikuuuu](https://www.instagram.com/_its_me_chikuuuu/)
- Threads: [@_here_chikuu_005](https://www.threads.com/@_here_chikuu_005)

---

## License

MIT — see [LICENSE](./LICENSE).

<div align="center">

© 2026 Arka Patra. Built with curiosity, code & security in mind.

</div>
