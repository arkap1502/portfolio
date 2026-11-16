# DESIGN.md — Arka Patra Portfolio

Design specification for the static portfolio of Arka Patra, a cybersecurity student and developer from Kolkata, India. Plain HTML, CSS and JavaScript. No frameworks, no build step.

Five pages, one stylesheet and one deferred script. Each page has one fixed look; nothing in the site switches theme. This document describes the site **as built**.

| File | Page | Look |
|---|---|---|
| `index.html` | Home (site entry) | Pine editorial: serif headline, clay accent, portrait card, light section sheet |
| `projects.html` | Work | Brutalist stone grey, black nav band, ledger table |
| `about.html` | About | Brutalist stone grey, huge ARKA PATRA, marquee strip |
| `certificates.html` | Certificates | Brutalist, linked from Home (not from the nav) |
| `contact.html` | Contact | Pine with lime accent, form panel |

---

## 1. Hard rules (read first)

1. **No dark mode feature.** No light/dark toggle, no theme switch, no `prefers-color-scheme` styles, no stored theme. Each page has one fixed look.
2. **There is no landing page.** The cream editorial landing page was removed. `index.html` is the Home page and the site entry point; `home.html` does not exist.
3. **No Certificates button in the nav bar.** The nav holds Work, About, Contact and the Resume button. Certificates is reached only from the certificate portion of the Home page. The Certificates page keeps the standard nav plus a mono `← BACK TO HOME` link above its title.
4. **Certificates order:** the Thiranex **internship certificate first**, the **Deloitte cyber job simulation second and shown as the main credential after it**, then the remaining credentials.
5. **Featured project:** **Website Security Copilot**, shown with one internship certificate (Thiranex) on Home.
6. **The Work page must not list** ALTRON Password Inspector. URL Scanner (Sentinel ML) **is** listed, as ledger row 02.
7. **The About page carries two skills sections** — the working matrix and the technical skills ledger — in the brutalist style, with the live interaction described in 7.4.
8. **The Home hero must fill the first screen** (viewport height minus the header) and drives the scroll transition in section 8.
9. **A footer appears on every page except Contact.**

---

## 2. Design tokens

`assets/css/site.css` declares every token on `:root`. `--arch`, `--orange` and `--text-l-muted` are no longer referenced at all; `--cream` survives only inside the unused `.btn--ink` / `.btn--outline` rules left from the deleted landing page. No page uses those classes.

### Colour

**Home (pine + sand)**

| Token | Hex | Use |
|---|---|---|
| `--pine` | `#0F2A22` | Hero background, page background |
| `--pine-2` | `#1E3A30` | Panels and certificate cards on Home |
| `--sand` | `#E9E7E1` | Background of the section sheet below the hero |
| `--pine-text` | `#F3EDE0` | Hero heading, active nav, Resume outline, stats panel fill |
| `--clay` | `#D98B5F` | Hero label, "Secure it first.", primary button, panel labels |
| `--sage` | `#9DB0A5` | Inactive nav links, mono meta on pine |
| `--sage-light` | `#C9D4CC` | Hero intro, card body text |
| `--ink-l` | `#141414` | Headings and body text on the sand sheet |
| `--text-l` | `#4A463F` | Section labels and intro lines on the sand sheet |

**Contact (pine + lime)**

| Token | Hex | Use |
|---|---|---|
| `--pine` | `#0F2A22` | Page background |
| `--panel` | `#1D211A` | Form panel |
| `--field` | `#151713` | Input fill |
| `--field-border` | `#546344` | Input and panel borders |
| `--lime` | `#D5F87A` | Accent line, arrows, submit button |
| `--text-c` | `#EEEEE6` | Body and field text |

**Brutalist (Work, About, Certificates)**

| Token | Hex | Use |
|---|---|---|
| `--stone` | `#E4E2DD` | Page background |
| `--black` | `#0B0B0B` | Nav band, ledger header strip, marquee strip, headings, buttons |
| `--row-hi` | `#2A2A2A` | Highlighted / hovered ledger row |
| `--on-dark` | `#F5F1EA` | Text on black |
| `--on-dark-muted` | `#C8C7C2` | Secondary text on black |
| `--text-s` | `#565654` | Descriptions and intro text on stone |
| `--photo` | `#BDBAB3` | Portrait placeholder |

**Footer**

| Value | Use |
|---|---|
| `#F1EFE9` | Footer background |
| `#FAF8F4` | Base strip background |
| `#2A2A28` | Footer link text |
| `#83807A` / `#8A877F` | Tagline and copyright |
| `#8E8B83` / `#9A968D` | Mono column labels and arrows |

No gradients, no glow, no shadows, no glass. Clay appears only on Home, lime only on Contact. The Home hero and the section sheet are both flat colours (`--pine` and `--sand`).

### Typography (system fonts only)

| Role | Family and stack | Style at 1440 px |
|---|---|---|
| Wordmark, labels, ledger header, status, marquee, footer labels | `"Courier New", Courier, monospace` bold | Wordmark 16px; section labels 15px; hero label 13px; ledger header 13px; letter-spacing about 0.25em; uppercase |
| Headings and body (Home sheet, Work, About) | `Arial, "Helvetica Neue", Helvetica, sans-serif` | Nav and buttons 700 / 20px |
| Home display heading | `Georgia, "Times New Roman", serif` 400 | 78px, line-height 1.06 |
| Home intro | Arial 400 | 20px |
| WORK title | Arial 700, uppercase | 120px |
| ARKA PATRA title | Arial 700, uppercase | 192px, line-height 0.93 |
| Work row title | Arial 700 | 30px |
| Work row description | Arial 400 | 18px |
| About intro | Arial 400 | 21px |
| Contact "Let's build" | `Calibri, Carlito, "Segoe UI", sans-serif` 400 | 66px |
| Contact "something secure." | `Cambria, Caladea, Georgia, serif` italic | 81px |
| Contact body, link values, button | Calibri | 17px / 18px / 19px bold |
| Contact labels | Courier New regular | 15px, letter-spacing 0.22em |

No font files and no font requests. On narrow screens display sizes scale with `clamp()`.

### Shape and layout

- Page gutter **65px** at 1440 (24px on mobile, 40px at 640–1023).
- Header height is a token: `--head-h: 93px` (desktop and tablet), `66px` below 640. The hero sizes itself against it.
- Buttons: **capsule**, 61px tall, 1.5px border for outline buttons.
- Panels, ledgers, fields, certificate cards: **square corners**.
- Home portrait card: 470 × 400, 1px cream border, 26px radius (20px on mobile).
- Home hero stats panel: cream, 10px radius, two cells.

---

## 3. Components

### Nav bar (all pages)
- Left: wordmark **ARKA PATRA** (Courier New bold, 16px, wide tracking) linking to `index.html`.
- Right: **Work · About · Contact** in Arial bold 20px with about 62px between links, then the **Resume ↗** capsule (170 × 61, 1.5px border) ending at the right gutter. **No Certificates link. No theme toggle.**
- **Home / Contact:** on pine, links `--sage`, wordmark and Resume `--pine-text` (Resume outline cream). Hover fills the Resume capsule cream with pine text.
- **Work / About / Certificates:** a full-width `--black` band **99px** tall; links `--on-dark-muted`, active link `--on-dark` with a 1px underline; Resume outline `--on-dark`, hover fills cream with black text.
- Below 640px the links collapse into a menu button; the mobile menu lists Work, About, Contact, Resume.

### Buttons
- Base: capsule, 61px tall, Arial 700 20px, hover inverts fill and text.
- **Clay** (`--clay` fill, pine text, 252px): Home primary actions.
- **Outline cream** (transparent, cream text/border, 241px): Home "View résumé".
- **Solid** (`--black` fill, on-dark text, 252px): About "Explore work", Work featured.
- **Ghost** (outline black): secondary Work action.
- **Lime** (rectangular, 284 × 61, dark Calibri bold): Contact submit, ends with →.
- Focus: 3px outline in the page accent, 3px offset (clay on Home, black on brutalist pages, lime on Contact; cream inside the black band).

### Home hero
- Full first screen: `min-height: calc(100svh − var(--head-h))`; content vertically centred in a two-column grid `minmax(0, 1fr) 470px`, column gap 60px.
- Copy column: mono clay label `— B.SC. CYBER SECURITY / GNIT KOLKATA` (13px, 0.22em), then the Georgia headline in two lines — **Build it right.** in `--pine-text`, **Secure it first.** italic in `--clay` — then the intro *Cybersecurity student and UI/UX developer — security tools and applied AI.* in `--sage-light`, then two buttons.
- Media column: portrait card (470 × 400, 1px `--pine-text` border, 26px radius, `object-fit: cover`, top-anchored) with a cream stats panel overlapping its lower right: `10 CERTIFICATES` and `01 INTERNSHIP`, numbers Georgia 400 34px in `--pine`, labels mono 10px 0.18em. Panel is 56% of the card width, `right: 0`, `bottom: −28px`.
- There is **no** circular builds badge; it was removed.

### Section sheet (Home, below the hero)
- `.home-flow` sits on `--sand` with ink text; it overlaps the pinned hero during the transition (section 8).
- Its first section keeps its 88px top margin (the gap is outside the sheet's background — do not convert it to padding).
- Section label: mono 15px uppercase, `--text-l`. Heading: Arial 700 `clamp(1.9rem, 3.4vw, 44px)` in `--ink-l`. Intro line: 18px `--text-l`.
- Panels and certificate cards stay `--pine-2` with `--sage-light` text and clay labels — dark cards on the light sheet.

### Ledger (Work, technical skills, journey)
- Header strip: `--black` fill, 48px tall, mono 13px labels in `--on-dark-muted`.
- Rows about 78px tall, separated by 1px dark rules, no zebra, no outer box.
- Every project row in the Work ledger (`.work-ledger`) fills `--row-hi` with `--on-dark` text on hover or `:focus-within`, link row or not; `.ledger__what` moves to `--on-dark-muted` and the `CONTRIBUTOR` tag border to `--on-dark`. The About ledgers (`.tech-ledger`, `.journey`) keep their plain rows. Status is mono 15px with ↗.
- Columns on Work: `NO` (88px), `PROJECT`, `WHAT IT DOES`, `STATUS` (200px), 22px inner padding.

### Chip
Capsule, Arial 15px, 1.5px `--black` border, transparent fill, 8px × 16px padding. Matrix chips are `<button aria-pressed>`; selected is `--black` fill with `--on-dark` text. Technical-skills chips are static.

### Readout bar
Full-width `--black` strip, 72px tall, two cells (320px + rest): left `AWAITING INPUT` over mono `RELATED BUILDS`, right the result. Selected builds appear as `--on-dark` outline capsules; builds that exist on the Work page link to it with ↗, others are plain text.

### Marquee strip
Full-width `--black` strip, 73px tall, mono 15px `--on-dark` text, wide tracking: `SECURE BY DESIGN ✦ BUILD WITH INTENT ✦ SHIP WITH CARE`, repeated. **Static, not scrolling.**

### Certificate card
Square-cornered, 1px black border on stone. WebP preview where one exists (width and height set in markup), mono issuer label, Arial 700 title, date, mono credential ID, **View certificate ↗** link to the PDF. **Main** variant: wide, preview left (380px), text right, 32px padding. **Compact** variant for the vault grid (4 up, 3 up at 1180, 2 up at 900, 1 up below 640). On Home the same cards sit on `--pine-2`.

### Footer (all pages except Contact)
- Background `#F1EFE9`, 72px top padding, three-column grid `1.5fr 1fr 1fr` with 48px gaps, 64px bottom padding.
- Left: 56px rounded-square `AP` mark (`--black` fill, cream text, 14px radius) and the line *Open to internships, entry-level roles, collaboration and cybersecurity conversations.* (16px, `#83807A`, max 340px).
- Middle: mono label `EXPLORE`, then Work, About, Contact.
- Right: mono label `FIND ME ELSEWHERE`, then GitHub ↗, LinkedIn ↗, Email ↗, each with a 16px inline SVG icon and a muted arrow.
- Links: Arial 700 16px, `#2A2A28`, underline on hover.
- Base strip: `#FAF8F4`, 1px hairline on top, 20px padding, three items — `© 2026 Arka Patra` (13px), `KOLKATA, INDIA • BUILT WITH CARE` (mono 11px, 0.2em), and `Back to top ↑` linking to `#top` on the page body.
- At 900px the grid drops to two columns; below 640 it stacks to one and the base strip stacks left-aligned.

---

## 4. Navigation map

```
index.html (Home, entry) ─┬─ Work ──────► projects.html
                          ├─ About ─────► about.html
                          ├─ Contact ───► contact.html
                          └─ View all certificates ↗ ──► certificates.html
                             (the ONLY entry point to Certificates)

projects.html / about.html / certificates.html / contact.html ── wordmark ──► index.html
certificates.html ── ← BACK TO HOME ──► index.html
Every page except Contact ends in the footer; Home's footer repeats the same routes.
```

---

## 5. Content

### Featured project
**Website Security Copilot**: clay mono label `FEATURED`, title, one-paragraph description, tech chips, **View project ↗** and **GitHub ↗** buttons.

### Work ledger (below the featured block)

| No | Project | What it does | Status |
|---|---|---|---|
| 01 | Netraksha | AI fake-identity & document screening. | SIH 2026 ↗ |
| 02 | URL Scanner | Scores a link for phishing risk and traces its hosting IP. | LIVE ↗ / GITHUB ↗ |
| 03 | NexVault | Secure vault for notes and credentials. | WEB APP ↗ |
| 04 | Humanize AI | Turns AI text into natural writing. | AI ↗ |
| 05 | Assembly | Multi-agent AI workspace that cross-examines models for cited answers. | LIVE ↗ / GITHUB ↗ |

**Excluded:** ALTRON Password Inspector. Row 05 carries the `CONTRIBUTOR` tag and the disclosure line under the ledger.

### Certificates
1. **Thiranex internship certificate** (ID `THX-AUG0426-563`): first and main.
2. **Deloitte cyber job simulation**: second, the main credential after the internship.
3. Eight more credentials in the compact vault grid.

### Home stats
`10 Certificates`, `01 Internship`, Kolkata / GNIT identity in copy. No numeric builds count is shown.

---

## 6. Page layouts

### 6.1 Home (`index.html`) — pine hero + sand sheet
1. **Hero (one screen):** described in 3 "Home hero". Below 1024 it stacks: copy first, then the portrait card (max 470px) with the stats panel; mobile spacing is 24/28px with a 40px row gap so the hero still fits a 390 × 844 screen.
2. **Selected work:** mono label `SELECTED WORK`, heading *Built to be checked, not trusted.*, one `--pine-2` panel with the `FEATURED` label, **Website Security Copilot**, description, tech line (mono, sage), and a clay **View project ↗** button.
3. **Certificate portion** (the only entry point to certificates): label `CERTIFICATES`, heading *Credentials, verified.*, one line; the Thiranex card (preview + issuer + date + ID + View certificate ↗), then the Deloitte card; clay button **View all certificates ↗**.
4. **About / Contact pair:** two `--pine-2` panels, each a label, heading, one line and a clay link.
5. **Footer.**

### 6.2 Work (`projects.html`) — brutalist
1. Black nav band (99px), then the title **WORK** (Arial 700, 120px).
2. Featured panel: Website Security Copilot (1px `--black` border on `--stone`), chips, solid + ghost buttons.
3. Ledger with the black header strip, hover row, and rows Netraksha, URL Scanner, NexVault, Humanize AI, Assembly (the last with a `CONTRIBUTOR` tag and the disclosure line below the ledger).
4. **Footer.**

### 6.3 About (`about.html`) — brutalist
Order: hero, marquee strip, profile and record, **skills matrix**, **technical skills ledger**, journey, footer.

1. **Hero (one screen):** black nav band; title **ARKA / PATRA** (192px, two lines); intro in `--text-s`; black button **Explore work ↗**. Right: portrait block 386 × 481 on `--photo` with the mono caption `FIG. 01 — ARKA PATRA, GNIT KOLKATA`.
2. **Marquee strip** (static) closing the first screen.
3. **Profile and record:** mono label `PROFILE AND RECORD`, heading *A short record.*, short bio, and a two-column ledger (`EDUCATION` / `RECORD`) with B.Sc. Cyber Security, GNIT Kolkata, 2024–present and the internship, simulation and independent builds.
4. **Skills matrix, "A working matrix."** — mono label `SKILLS` in `--text-s`, Arial 700 heading, line: *Every capability is tied to a build you can open. Select a badge to see the builds that use it.*
   - **Three columns** separated by 1px `--black` rules. Each column: a small `--black` square with the `--on-dark` mono index; Arial 700 title; one-line description; a 2 × 3 grid of selectable chips; mono label `USED IN`; a line of builds.

     | | Title | Line | Chips | Used in |
     |---|---|---|---|---|
     | 01 | Security | Find, test and explain risk. | Threat detection, Password audit, Network recon, Phishing analysis, URL scanning, Wi-Fi security | URL Scanner · ALTRON · Quishing Guard |
     | 02 | Web & UI | Interfaces that look sharp and stay safe. | HTML5, CSS3, JavaScript, Figma, Responsive UI, Accessibility | Portfolio · NexVault · URL Scanner |
     | 03 | AI & Automation | Small tools that think for you. | Python, Prompt design, ML basics, Text analysis, Forensics, Automation | Humanize AI · Hidden-Prompt Scanner · Copilot |

   - **Related-builds readout** (black strip under the columns). Default: left cell `AWAITING INPUT` over mono `RELATED BUILDS`, right cell *Select a skill chip to see the builds that use it.* On select: the left cell shows the chip name and the right cell lists related builds as `--on-dark` outline capsules. Builds on the Work page link with ↗; other names are plain text. Clicking the chip again, or Escape, resets it.
   - **Behaviour:** one chip selected at a time; `aria-pressed` on chips; the readout is `aria-live="polite"`; Enter and Space work. A chip with no mapping of its own falls back to its column's `USED IN` builds (the column's `data-used` attribute). The chip → build mapping is the `skillBuilds` object in `assets/site.js`.
5. **Technical skills ledger, "The stack behind the builds."** Mono label `TECHNICAL SKILLS`, Arial 700 heading, line: *Grouped the way it reads on my CV — languages, platforms and tools.* Ledger with a black header strip (`GROUP · SKILLS`); left column mono group label, right column static chips, wrapping.

   | Group | Chips |
   |---|---|
   | Programming | Python, JavaScript, HTML, CSS, SQL |
   | Cybersecurity | Web security, Phishing awareness, Password security, Security analysis, Security fundamentals |
   | Development | Flask, SQLite, Frontend, Responsive UI, REST / API concepts |
   | Operating systems | Windows 11, Linux |
   | Tools | VS Code, Git, GitHub, Vercel, Render, Microsoft Office |
   | Soft skills | Problem solving, Communication, Teamwork, Logical thinking, Continuous learning |

6. **Journey:** a ledger of five numbered rows (mono index, Arial 700 title, one line each).
7. **Footer.**

### 6.4 Certificates (`certificates.html`) — brutalist
Black nav band, mono `← BACK TO HOME`, title **CERTIFICATES**, Main card 1: Thiranex internship; Main card 2: Deloitte job simulation (text-only wide card); then the eight-credential vault grid with 1px rules; a mono total line; footer.

### 6.5 Contact (`contact.html`) — pine and lime
- **No footer on this page.**
- Left column: mono label `CONTACT / 06`; Calibri **Let's build** (`--text-c`) over Cambria Italic **something secure.** (`--lime`); intro *Open to internships, entry-level roles, collaboration and cybersecurity conversations.* in `--sage`; a link ledger below (rows about 67px; mono label, Calibri 18px value, lime ↗ at the right end, 1px dark-green rules): `EMAIL arkap1502@gmail.com`, `GITHUB github.com/arkap1502`, `LINKEDIN linkedin.com/in/arka-patra-579110422`.
- Right: form panel `--panel` fill, 1px border, 40–44px padding. Mono labels `SEND A MESSAGE`, `NAME`, `EMAIL`, `MESSAGE`; fields in `--field` with a 1px `--field-border` (name and email 57px tall, message 100px); lime submit **Send message →**.
- Validation messages in `--text-c` with a lime marker (clay marker on send failure).

---

## 7. Motion and accessibility

- Hover and focus states only, plus the Home scroll transition in section 8. No parallax, no canvas; the marquee strip is static.
- Everything animated is disabled under `prefers-reduced-motion: reduce`.
- Visible focus ring on every interactive element; skip-to-content link; semantic landmarks; labelled form fields; alt text on every image.
- Hover rules for the nav links are scoped with `:not(.nav-cv)` so the Resume capsule keeps its own fill/text pair on hover.

---

## 8. Home scroll transition

The Home hero is a **full-screen stage** and the rest of the page rides up over it as a sheet.

**Structure:** `main` contains `.hero-shell` (the hero) and `.home-flow` (everything below it, on `--sand`), followed by the footer.

**Layout**
- `.hero-shell` is `min-height: calc(100svh − var(--head-h))` and stretches, so hero + header fill exactly one screen.
- The hero content is vertically centred; the header keeps `--head-h` (93px desktop/tablet, 66px below 640).
- `.home-flow` starts immediately below the hero; its first section's 88px margin collapses out of it, so the sheet's background edge sits 88px below the hero. This is the intended spacing — do not pad the flow.

**Behaviour**
- At **1024px and wider** `.hero-shell` becomes `position: sticky; top: 0` with `--sand`-covered `.home-flow` above it (`z-index: 1`), so the sheet slides up over the pinned hero.
- `assets/site.js` scrubs by scroll position only, so scrolling up reverses it exactly: `progress = scrollY / coverDistance`, where `coverDistance` is the flow's document offset (measured on load and on resize).
- While scrubbing, the hero content moves up to 30% of the hero height, scales to 0.965, and fades from opacity 1 to 0 between 45% and 95% of the travel — so the copy stays on screen until the sheet is covering it, never leaving an empty stretch of pine.
- Updates are batched in `requestAnimationFrame` with a passive scroll listener; background tabs paint synchronously and a `visibilitychange` handler repaints on return.
- Below 1024px the hero is not pinned (the stacked hero can be taller than the viewport) but the drift and fade still run.
- With `prefers-reduced-motion: reduce`, no `hero-scroll` class is added: the hero stays in normal flow, full opacity, and the page scrolls normally. Toggling the setting mid-session restores or removes the effect.
- `body` uses `overflow-x: hidden` with an `overflow: clip` override where supported, because `hidden` would create a scroll container and break sticky pinning.

---

## 9. Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥ 1180px | The layouts at 1440 scale fluidly |
| 1024–1180px | Hero media column narrows to 460px; ledger and vault columns tighten |
| 640–1023px | All heroes stack (portrait below text); matrix columns stack; certificate main cards stack; Home hero is not pinned |
| < 640px | Nav becomes a menu button; single column; WORK title and ARKA PATRA shrink; ledger rows stack; the readout bar stacks; footer stacks; the Home portrait keeps its shape at full width |

The page body never scrolls sideways.

---

## 10. Performance

- One stylesheet (`assets/css/site.css`) and one deferred script (`assets/site.js`).
- System fonts only; no libraries, no blur, no canvas, no continuous animation.
- Images are WebP at display size, with width and height in markup.
- Assets are requested with a version query (`site.css?v=14`, `site.js?v=10`); bump the matching one whenever the CSS or JS changes.

---

## 11. Files

```
index.html               Home (pine hero, sand sheet, work, certificates, about/contact, footer)
projects.html            Work
about.html               About (hero, profile, skills matrix, technical ledger, journey, footer)
certificates.html        Certificates (internship, Deloitte, vault, footer)
contact.html             Contact (no footer)

assets/css/site.css      Tokens per page palette, components, layouts, scroll stage, footer, responsive rules
assets/site.js           Mobile menu, hero scroll scrub, skills readout, contact form
assets/arka-patra.webp   Portrait
assets/cert-thiranex-preview.webp
                         Thiranex certificate preview
assets/favicon.svg       Wordmark mark
assets/Arka_Patra_CV2.pdf
                         Downloadable résumé
assets/cert-*.pdf        Credential documents
assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
```

`site.js` has **no theme logic**.

---

## 12. Do / Don't

**Do**
- Keep the Home hero at exactly one screen and the sheet on `--sand` with ink text.
- Keep the 88px gap above the first Home section as a margin on the section.
- Keep square corners on panels and ledgers, capsules on buttons.
- Lead Home's certificate portion with the internship, then Deloitte.
- Keep the footer on Home, Work, About and Certificates, and off Contact.

**Don't**
- Reintroduce a landing page, a theme toggle, or any light/dark switching.
- Add a Certificates item to the nav.
- List ALTRON Password Inspector on the Work page.
- Add the circular builds badge back to the hero.
- Mix palettes across pages (clay only on Home, lime only on Contact).
- Use shadows, gradients, glow, glassmorphism or rounded shadowed cards.
- Pad `.home-flow` or change the first section's margin.

---

## 13. Pre-ship checklist

- [ ] No theme toggle; no `prefers-color-scheme` styles
- [ ] No landing page; the wordmark and every home link point at `index.html`
- [ ] Nav shows Work, About, Contact, Resume only, on every page
- [ ] Each page matches its palette and type in section 2
- [ ] Home hero fills the viewport, with no badge and a two-cell stats panel
- [ ] Home sheet is `#E9E7E1` with ink headings; sections keep their 88px rhythm
- [ ] Scroll down/up plays the reveal symmetrically with no empty stretch of pine
- [ ] Home certificate portion shows Thiranex then Deloitte, with a View all certificates button
- [ ] Certificates page order: Thiranex, Deloitte, then the vault
- [ ] Work page: Website Security Copilot featured; ledger rows Netraksha, URL Scanner, NexVault, Humanize AI, Assembly; no ALTRON Password Inspector
- [ ] About page: matrix (three columns, readout bar, keyboard-selectable chips) and all six technical groups
- [ ] Footer present on Home, Work, About, Certificates; absent on Contact; Back to top returns to the hero
- [ ] Marquee strip is static; reduced motion verified
- [ ] Mobile layout checked at 375px
