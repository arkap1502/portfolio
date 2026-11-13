# Arka Patra — Portfolio

A static portfolio for Arka Patra, a UI/UX developer and cybersecurity student from West Bengal, India. Built with HTML, CSS and JavaScript — no frameworks, no build step.

The interface follows the **Secure HUD** design language from the supplied *Portfolio UI/UX 3D* deck: a near-black canvas, cyan command accents, square panels with corner brackets, mono labels, subtle scanlines and a live threat-monitor feel.

## Pages

- [Entry](index.html) — animated cover with a full-screen code-rain canvas, boot sequence, typewriter name, orbit rings, laptop and phone
- [Home](dashboard.html) — command deck with identity panel, live threat monitor, terminal, active mission, counters and proof cards
- [About](about.html) — flippable digital identity card, focus grid, education and experience
- [Skills](skills.html) — three skill modules; every badge maps to real projects
- [Projects](projects.html) — featured URL Scanner plus seven filterable builds and mission-report dialogs
- [Certificates](certificates.html) — featured Cisco credential and a ten-document secure vault
- [Journey](journey.html) — a five-level staircase from fundamentals to AI-powered security
- [Contact](contact.html) — contact rows, encrypted-channel terminal and validated message form

## Design system

- Canvas `#05070C`, panels `#0D1219` / `#131C2B`, borders `#243450`.
- Accents: cyan `#4CC9F0`, violet `#8B7CF6`, green `#34D399`, amber `#F5B94A`.
- Type: Carlito for display and body, Courier Prime for labels, counts and terminal text.
- Square panels, four-point corner brackets, hairline rules, dotted technical grid and colour-coded status tags.
- Shared tokens, chrome and primitives live in `assets/css/core.css`; page families are split into focused modules and imported by `assets/site.css`.
- Responsive from 320px up, with a compact page structure at tablet and mobile widths.

## Interaction

- Boot sequence on the entry cover, playable once per tab and skippable.
- Full-screen falling-code canvas behind the entry cover, paused while the tab is hidden and disabled for reduced motion.
- Page-transition wipe for internal navigation, disabled when reduced motion is requested.
- Sticky navigation with a collapsible mobile menu (Escape closes it).
- Scroll reveals, a 3D pointer tilt on the About identity stack, and animated HUD counters.
- Rotating live-threat ticker on the home page.
- Project status filters, empty state and accessible `<dialog>` mission reports.
- Skill badges that reveal the builds using each skill.
- Flippable About identity card with a capability record on the back.
- Contact form with inline validation, success/error states and FormSubmit delivery.

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

```
index.html               Entry cover
dashboard.html           Home command deck
about.html               Identity, education and experience
skills.html              Skill matrix
projects.html            Featured build and filterable archive
certificates.html        Featured credential and document vault
journey.html             Five-level cybersecurity journey
contact.html             Contact details and message form

assets/site.css          Imports the CSS modules below
assets/css/core.css      Tokens, reset, header, footer, panels, buttons, terminal, motion
assets/css/entry-home.css
assets/css/about-skills.css
assets/css/projects-certs.css
assets/css/journey-contact.css
assets/css/responsive.css
assets/site.js           Navigation, boot, code rain, wipe, reveals, tilt, filters,
                         dialogs, skill readout, card flip, ticker, counters and form
assets/favicon.svg       Cyan "A" mark
assets/Arka_Patra_CV.pdf Downloadable CV
assets/cert-*.pdf        Credential documents
assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
```

## Credits

- Typefaces served by [Google Fonts](https://fonts.google.com/): Carlito and Courier Prime.
- Visual language derived from the supplied *Arka Patra Portfolio UI/UX 3D* design deck.
- Icons are CSS and inline SVG; no icon library is bundled.

## Links

- [GitHub](https://github.com/arkap1502)
- [LinkedIn](https://www.linkedin.com/in/arka-patra-579110422/)
- [Email](mailto:arkap1502@gmail.com)

## License

MIT — see [LICENSE](LICENSE).
