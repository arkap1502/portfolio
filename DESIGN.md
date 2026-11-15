# DESIGN.md — Arka Patra Portfolio

Design specification for the static portfolio of Arka Patra, a cybersecurity student and developer from Kolkata, India. Plain HTML, CSS and JavaScript. No frameworks, no build step.

**Source of truth: the PDF *Arka Patra Portfolio — More Designs* (5 slides, 1440 × 810 artboard).** Every page below is built exactly as its slide is drawn. Colors, fonts and measurements were read from the PDF itself. Anything not in the PDF is marked *proposed*.

| PDF slide | Page | Look |
|---|---|---|
| 1 · Landing page | `index.html` | Cream editorial, Georgia heading, arch portrait, orange badge |
| 2 · Home page | `home.html` | Pine split, Arial heading, clay button, dashed portrait frame |
| 3 · Work | `projects.html` | Brutalist stone grey, black nav band, ledger table |
| 4 · About page | `about.html` | Brutalist stone grey, huge ARKA PATRA, marquee strip |
| 5 · Contact | `contact.html` | Pine with lime accent, form panel |
| not in PDF | `certificates.html` | Brutalist system of slides 3 and 4 *(proposed)* |

---

## 1. Hard rules (read first)

These override anything else in this file.

1. **No dark mode feature.** No light/dark toggle, no theme switch, no `prefers-color-scheme` styles, no stored theme. Each page has one fixed look. The pine Home and Contact pages are in the PDF and are kept as drawn; they are page designs, not a mode.
2. **No Certificates button in the nav bar.** The nav holds Work, About, Contact and the Resume button. The Certificates page is reached from the **certificate portion of the Home page** (see 6.2).
3. **Certificates page order:** the Thiranex **internship certificate first**, the **Deloitte cyber job simulation second and shown as the main credential after it**, then the remaining credentials.
4. **Featured project:** **Website Security Copilot**, shown with one internship certificate (Thiranex) on Home.
5. **The Work page must not list** URL Threat Scanner or ALTRON Password Inspector. (The PDF's Work slide shows them; they are removed here, so the ledger starts at Netraksha.)
6. **The About page carries two skills sections** (the working matrix and the technical skills ledger) in the brutalist style of slide 4, with the same interaction as the live site (see 6.4).

---

## 2. Design tokens

### Color (sampled from the PDF)

**Landing (slide 1)**

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#F2EEE6` | Page background |
| `--arch` | `#D9D2C4` | Arch portrait fill |
| `--ink-l` | `#141414` | Heading, primary button, rules |
| `--text-l` | `#4A463F` | Intro paragraph |
| `--text-l-muted` | `#6B665D` | Inactive nav links, mono lines |
| `--orange` | `#C2410C` | Top label, "08 BUILDS" circle |

**Home (slide 2) and Contact (slide 5)**

| Token | Hex | Use |
|---|---|---|
| `--pine` | `#0F2A22` | Page background (Home left half, all of Contact) |
| `--pine-2` | `#1E3A30` | Home right half |
| `--pine-text` | `#F3EDE0` | Home heading, active nav |
| `--clay` | `#D98B5F` | Home label and primary button |
| `--sage` | `#9DB0A5` | Inactive nav links, Home mono text |
| `--sage-light` | `#C9D4CC` | Home intro paragraph |
| `--panel` | `#1D211A` | Contact form panel |
| `--field` | `#151713` | Contact input fill |
| `--field-border` | `#546344` | Contact input border |
| `--lime` | `#D5F87A` | Contact accent line, arrows, submit button |
| `--text-c` | `#EEEEE6` | Contact body text |

**Brutalist (slides 3 and 4)**

| Token | Hex | Use |
|---|---|---|
| `--stone` | `#E4E2DD` | Page background |
| `--black` | `#0B0B0B` | Nav band, ledger header strip, marquee strip, headings, buttons |
| `--row-hi` | `#2A2A2A` | Highlighted / hovered ledger row |
| `--on-dark` | `#F5F1EA` | Text on black |
| `--on-dark-muted` | `#C8C7C2` | Secondary text on black |
| `--text-s` | `#565654` | Descriptions, intro text on stone |
| `--photo` | `#BDBAB3` | Portrait placeholder |

No gradients, no glow, no shadows, no glass. Orange appears only on the Landing page; lime only on Contact; clay only on Home.

### Typography (fonts in the PDF)

| Role | Family and stack | Style at 1440 px |
|---|---|---|
| Wordmark, labels, ledger header, status, marquee | **Courier New** bold: `"Courier New", Courier, monospace` | Wordmark 16px; labels 15px; ledger header 13px; letter-spacing about 0.25em; uppercase |
| Nav links, buttons, headings, body (Landing, Home, Work, About) | **Arial**: `Arial, "Helvetica Neue", Helvetica, sans-serif` | Nav and buttons 700 / 20px |
| Landing heading | **Georgia** 400 | 84px, line-height 1.13 |
| Landing intro | Arial 400 | 22px, line-height 1.2 |
| Home heading | Arial 700 | 78px, line-height 1.1 |
| Home intro | Arial 400 | 22px |
| WORK title | Arial 700, uppercase | 120px |
| ARKA PATRA title | Arial 700, uppercase | 192px, line-height 0.93 |
| Work row title | Arial 700 | 30px |
| Work row description | Arial 400 | 18px |
| About intro | Arial 400 | 21px |
| Contact "Let's build" | **Calibri** 400: `Calibri, Carlito, "Segoe UI", sans-serif` | 66px |
| Contact "something secure." | **Cambria Italic**: `Cambria, Caladea, Georgia, serif` italic | 81px |
| Contact body, link values, button | Calibri | 17px / 18px / 19px bold |
| Contact labels | Courier New regular | 15px, letter-spacing 0.22em |

System fonts only, so no font files and no font requests. On narrow screens scale display sizes with `clamp()`.

### Shape and layout

- Artboard 1440 × 810. Page gutter **65px** at 1440 (left and right). Scale the gutter to 24px on mobile *(proposed)*.
- Buttons: **capsule**, 61px tall, 1.5px border for outline buttons.
- Panels, ledgers, fields: **square corners**. The Home portrait frame has a large corner radius (about 100px) with a dashed border.
- Landing portrait: **arch** (stadium shape).

---

## 3. Components

### Nav bar (all pages)
- Left: wordmark **ARKA PATRA** (Courier New bold, 16px, wide tracking) at x = 65.
- Right: **Work · About · Contact** in Arial bold 20px with about 62px between links, then the **Resume ↗** capsule (170 × 61, 1.5px border) ending at the right gutter. **No Certificates link. No theme toggle.**
- **Landing:** on `--cream`, links `--text-l-muted`, wordmark and Resume in `--ink-l`; no band. Nav items sit about 64px from the top.
- **Home / Contact:** on pine, links `--sage`, wordmark and Resume in `--pine-text` (Resume outline cream). Same vertical position as Landing.
- **Work / About / Certificates:** a full-width `--black` band **99px** tall; links `--on-dark-muted`, active link `--on-dark` with a 1px underline; Resume outline `--on-dark`. Nav items sit about 46px from the top.

### Buttons
- **Landing:** primary `--ink-l` fill, cream text, 318 × 61; secondary outline `--ink-l`, 241 × 61. Both end with ↗.
- **Home:** primary `--clay` fill, `--pine` text, 252 × 61, ends with ↗.
- **About:** primary `--black` fill, `--on-dark` text, 252 × 61, ends with ↗.
- **Contact submit:** rectangular `--lime` fill, dark Calibri bold text, 284 × 61, ends with →.
- Hover: invert fill and text. Focus: 3px outline in the page's accent, 3px offset.

### Ledger (Work, technical skills, Contact links)
- Header strip: `--black` fill, 48px tall, mono 13px labels in `--on-dark-muted`.
- Rows about 78px tall, separated by 1px dark rules, no zebra, no outer box.
- Link rows: hover fills the row `--row-hi` with `--on-dark` text, as the highlighted first row in the PDF. Status is mono 15px with ↗.
- Columns on Work: `NO` (x = 87), `PROJECT` (x = 175), `WHAT IT DOES` (x = 698), `STATUS` (x = 1223).

### Chip *(proposed, from the PDF's button language)*
Capsule, Arial 15px, 1.5px `--black` border, transparent fill, 8px × 16px padding. Matrix chips are `<button aria-pressed>`; selected is `--black` fill with `--on-dark` text. Technical-skills chips are static.

### Readout bar *(proposed)*
Full-width `--black` strip (same look as the ledger header, 72px tall) with `--on-dark` text; see 6.4.

### Marquee strip
Full-width `--black` strip, 73px tall, mono 15px `--on-dark` text, wide tracking: `SECURE BY DESIGN ✦ BUILD WITH INTENT ✦ SHIP WITH CARE`, repeated to fill the width. **Static, not scrolling.**

### Certificate card *(proposed)*
Square-cornered panel with a 1px `--black` border on `--stone`. WebP preview (width and height set in markup), mono issuer label, Arial 700 title, date, mono credential ID, **View certificate ↗** link to the PDF. **Main** variant: wide, preview left, text right. **Compact** variant for the vault grid. On Home the same cards sit on pine panels (`--pine-2` fill, `--pine-text`).

---

## 4. Navigation map

```
Landing (index.html) ── Explore selected work ↗ ──► Work
        │                View résumé ↗ ───────────► assets/Arka_Patra_CV2.pdf
        └─ wordmark ───────────────────────────────► Home

Home (home.html) ─┬─ Work ──── projects.html
                  ├─ About ─── about.html
                  ├─ Contact ─ contact.html
                  └─ View all certificates ↗ ─ certificates.html
                     (the ONLY entry point to Certificates; it is not in the nav)
```

The Certificates page shows the standard nav (Work, About, Contact, Resume) and a mono `← BACK TO HOME` link above its title.

---

## 5. Content

### Featured project
**Website Security Copilot**: orange/clay/black mono label `FEATURED` (per page palette), title, one-paragraph description, tech chips, **View project ↗** and **GitHub ↗** buttons.

### Work ledger (below the featured block)

| No | Project | What it does | Status |
|---|---|---|---|
| 01 | Netraksha | AI fake-identity & document screening. | SIH 2026 ↗ |
| 02 | NexVault | Secure vault for notes and credentials. | WEB APP ↗ |
| 03 | Humanize AI | Turns AI text into natural writing. | AI ↗ |

**Excluded:** URL Threat Scanner, ALTRON Password Inspector.

### Certificates
1. **Thiranex internship certificate** (ID `THX-AUG0426-563`): first and main.
2. **Deloitte cyber job simulation**: second, the main credential after the internship.
3. Eight more credentials in the compact vault grid.

---

## 6. Page layouts

### 6.1 Landing (`index.html`) — PDF slide 1, cream
- Orange mono label `· B.SC. CYBER SECURITY / GNIT KOLKATA` at y = 164.
- Georgia heading **Secure by design, / useful by default.** at y = 207, two lines.
- Intro, `--text-l`: *I'm Arka Patra — a cybersecurity student building security tools, UI/UX developer and AI-assisted systems.* at y = 508, max width about 590px.
- Buttons at y = 611: **Explore selected work ↗** (primary), **View résumé ↗** (outline).
- Bottom: a 1px `--ink-l` rule at y = 748 (x 65 to 863) and the mono line `FULL-STACK • APP SECURITY • APPLIED AI` at y = 763.
- Right: arch portrait (`assets/arka-patra.webp`) 437 × 578 at x = 950, y = 142, on `--arch`.
- Orange circle `--orange`, 164px, centered at (977, 677) overlapping the arch's lower left, text **08 / BUILDS** in Arial 700 25px, cream.

### 6.2 Home (`home.html`) — PDF slide 2, pine split
1. **Hero:** background split about 52 / 48 (`--pine` left, `--pine-2` right). Clay mono label `— PINE SPLIT · GNIT KOLKATA` *(replace "PINE SPLIT" with the site's own tag, e.g. `— SECURE BY DESIGN`)*; Arial 700 heading **Build it right. / Secure it first.** in `--pine-text`; intro *Cybersecurity student and developer — full-stack apps, security tools and applied AI.* in `--sage-light`; clay button **See the work ↗**. Right: dashed portrait frame (x 808 to 1401, y 158 to 737, radius about 100, 1px dashed cream) holding `assets/arka-patra.webp`.
2. **Profile stats:** a row of stat blocks separated by 1px `--sage` rules; number Arial 700 large in `--pine-text`, label mono in `--sage`.
3. **Selected work:** one panel on `--pine-2`: **Website Security Copilot**, linking to Work.
4. **Certificate portion** (the only entry point to certificates): clay mono label `CERTIFICATES`, heading, one line; the Thiranex internship card, then the Deloitte card; clay button **View all certificates ↗** to `certificates.html`.
5. **About / Contact pair:** two panels on `--pine-2` with a short blurb and a link each.

### 6.3 Work (`projects.html`) — PDF slide 3, brutalist
1. Black nav band (99px), then the title **WORK** (Arial 700, 120px, x = 59, y = 111).
2. Featured panel: Website Security Copilot (1px `--black` border on `--stone`).
3. Ledger with the black header strip (y = 278), highlighted hover row, and rows Netraksha, NexVault, Humanize AI.

### 6.4 About (`about.html`) — PDF slide 4, brutalist
Order: hero, marquee strip, profile and record, **skills matrix**, **technical skills ledger**, journey.

1. **Hero (one screen):** black nav band; title **ARKA / PATRA** (192px, x = 59, y = 126, two lines); intro in `--text-s`: *Cybersecurity student and developer building security tools, full-stack apps and AI-assisted systems.*; black button **Explore work ↗** at y = 638. Right: portrait block 386 × 481 at x = 1004, y = 142 on `--photo`, with the mono caption `FIG. 01 — ARKA PATRA, GNIT KOLKATA` below it.
2. **Marquee strip** (static) closing the first screen.
3. **Profile and record:** short bio; education (B.Sc. Cyber Security, GNIT Kolkata, 2024–present) and record as a two-column ledger.
4. **Skills matrix, "A working matrix."** — same content and UX as the live site, in the slide's style.
   - Mono label `SKILLS` in `--text-s`, Arial 700 heading **A working matrix.**, line: *Every capability is tied to a build you can open. Select a badge to see the builds that use it.*
   - **Three columns** separated by 1px `--black` rules (no rounded cards, no shadows, no teal, no orange). Each column: a small `--black` square with the `--on-dark` mono index; Arial 700 title; a one-line description; a 2 × 3 grid of selectable chips; mono label `USED IN`; a line of builds.

     | | Title | Line | Chips | Used in |
     |---|---|---|---|---|
     | 01 | Security | Find, test and explain risk. | Threat detection, Password audit, Network recon, Phishing analysis, URL scanning, Wi-Fi security | URL Scanner · ALTRON · Quishing Guard |
     | 02 | Web & UI | Interfaces that look sharp and stay safe. | HTML5, CSS3, JavaScript, Figma, Responsive UI, Accessibility | Portfolio · NexVault · URL Scanner |
     | 03 | AI & Automation | Small tools that think for you. | Python, Prompt design, ML basics, Text analysis, Forensics, Automation | Humanize AI · Hidden-Prompt Scanner · Copilot |

   - **Related-builds readout** (black strip under the columns). Default: left cell `AWAITING INPUT` over mono `RELATED BUILDS`, right cell *Select a skill chip to see the builds that use it.* On select: the left cell shows the chip name and the right cell lists the related builds as `--on-dark` outline capsules. Builds that exist on the Work page link to it with ↗; other names (URL Scanner, ALTRON, and so on) are plain text. Clicking the chip again, or Escape, resets it.
   - **Behavior:** one chip selected at a time; `aria-pressed` on chips; the readout is `aria-live="polite"`; Enter and Space work. A chip with no mapping of its own falls back to its column's `USED IN` builds. The mapping is a plain object in `assets/site.js`.
5. **Technical skills ledger, "The stack behind the builds."** Mono label `TECHNICAL SKILLS`, Arial 700 heading, line: *Grouped the way it reads on my CV — languages, platforms and tools.* Ledger with a black header strip (`GROUP · SKILLS`); left column mono group label, right column static chips, wrapping.

   | Group | Chips |
   |---|---|
   | Programming | Python, JavaScript, HTML, CSS, SQL |
   | Cybersecurity | Web security, Phishing awareness, Password security, Security analysis, Security fundamentals |
   | Development | Flask, SQLite, Frontend, Responsive UI, REST / API concepts |
   | Operating systems | Windows 11, Linux |
   | Tools | VS Code, Git, GitHub, Vercel, Render, Microsoft Office |
   | Soft skills | Problem solving, Communication, Teamwork, Logical thinking, Continuous learning |

6. **Five-level journey:** a ledger of five numbered rows (mono index, Arial 700 title, one line each).

### 6.5 Certificates (`certificates.html`) — brutalist *(proposed)*
Black nav band, `← BACK TO HOME`, title **CERTIFICATES** (Arial 700 uppercase), Main card 1: Thiranex internship; Main card 2: Deloitte job simulation; then the eight-credential vault grid with 1px rules.

### 6.6 Contact (`contact.html`) — PDF slide 5, pine and lime
- Left column (x = 76): mono label `CONTACT / 06`; Calibri **Let's build** (`--text-c`) over Cambria Italic **something secure.** (`--lime`); intro *Open to internships, entry-level roles, collaboration and cybersecurity conversations.* in `--sage`; a link ledger below (rows about 67px; mono label at x = 76, Calibri 18px value at x = 218, lime ↗ at the right end, 1px dark-green rules): `EMAIL arkap1502@gmail.com`, `GITHUB github.com/arkap1502`, `LINKEDIN linkedin.com/in/arka-patra-579110422`.
- Right: form panel x = 796 to 1380, y = 152 to 716, `--panel` fill, 1px border. Mono labels `SEND A MESSAGE`, `NAME`, `EMAIL`, `MESSAGE`; fields in `--field` with a 1px `--field-border` (name and email 57px tall, message 100px); lime submit **Send message →**.
- Validation messages in `--text-c` with a lime marker.

---

## 7. Motion and accessibility

- Hover and focus states only. No continuous animation, no parallax, no canvas; the marquee strip is static.
- Everything animated is disabled under `prefers-reduced-motion: reduce`.
- Contrast: the main text pairings (body on cream, stone and pine) pass WCAG AA by estimate; re-check with a contrast tool before shipping. Keep `--text-l-muted` for large or mono text only.
- Visible focus ring on every interactive element; skip-to-content link; semantic landmarks; labelled form fields; alt text on every image.

---

## 8. Responsive *(proposed; the PDF is desktop only)*

| Breakpoint | Behavior |
|---|---|
| ≥ 1024px | The slide layouts at 1440 scale down fluidly |
| 640–1023px | Heroes stack (portrait below text); matrix columns stack; certificate main cards stack |
| < 640px | Nav becomes a menu button; single column; WORK and ARKA PATRA titles shrink to about 72px; ledger rows stack; the readout bar stacks its cells; the Home dashed frame and Landing arch keep their shape at full width |

The page body never scrolls sideways.

---

## 9. Performance

- One stylesheet (`assets/css/site.css`) and one deferred script (`assets/site.js`).
- System fonts only; no libraries, no blur, no canvas.
- Images are WebP at display size, with width and height in markup.

---

## 10. Files

```
index.html               Landing (cream, entry page)
home.html                Home (pine split)
projects.html            Work
about.html               About (hero, profile, skills matrix, technical ledger, journey)
certificates.html        Certificates (linked from Home, not from the nav)
contact.html             Contact

assets/css/site.css      Tokens per page palette, components, layouts, responsive rules
assets/site.js           Mobile menu, skills readout, contact form validation
assets/arka-patra.webp   Portrait
assets/cert-thiranex-preview.webp
assets/favicon.svg
assets/Arka_Patra_CV2.pdf
assets/cert-*.pdf
assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
```

`site.js` has **no theme logic**.

---

## 11. Do / Don't

**Do**
- Match each page to its PDF slide: palette, fonts, positions and button sizes from section 2, 3 and 6.
- Keep square corners on panels and ledgers, capsules on buttons.
- Lead Home's certificate portion with the internship, then Deloitte.

**Don't**
- Add a theme toggle or any switching between light and dark.
- Add a Certificates item to the nav.
- List URL Threat Scanner or ALTRON Password Inspector on the Work page.
- Mix palettes across pages (orange only on Landing, clay only on Home, lime only on Contact).
- Use shadows, gradients, glow, glassmorphism or rounded shadowed cards.

---

## 12. Pre-ship checklist

- [ ] No theme toggle; no `prefers-color-scheme` in CSS
- [ ] Nav shows Work, About, Contact, Resume only, on every page
- [ ] Each page matches its slide (colors, fonts, nav band, button sizes)
- [ ] Home certificate portion shows Thiranex then Deloitte, with a View all certificates button
- [ ] Certificates page order: Thiranex, Deloitte, then the vault
- [ ] Work page: Website Security Copilot featured; ledger has no URL Threat Scanner or ALTRON Password Inspector
- [ ] About page: matrix (three columns, readout bar, keyboard-selectable chips) and all six technical groups
- [ ] Marquee strip is static; reduced motion verified
- [ ] Mobile layout checked at 375px
