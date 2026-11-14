# Arka Patra — Portfolio

A static portfolio for Arka Patra, a UI/UX developer and cybersecurity student from West Bengal, India. Built with HTML, CSS and JavaScript — no frameworks, no build step.

The interface follows the **Secure HUD** design language from the supplied *Portfolio UI/UX 3D* deck: a near-black canvas, cyan command accents, square panels with corner brackets, mono labels, subtle scanlines and a live threat-monitor feel.

## Pages

- [Entry](index.html) — animated cover with a boot sequence, typewriter name, orbit rings, laptop and phone
- [Home](dashboard.html) — command deck with identity panel, live threat monitor, drag-to-rotate globe, terminal, active mission, counters and proof cards
- [About](about.html) — profile, education and experience, the skill matrix, and the five-level cybersecurity journey from fundamentals to AI-powered security
- [Projects](projects.html) — featured URL Scanner plus seven filterable builds and mission-report dialogs
- [Certificates](certificates.html) — featured Cisco credential and a ten-document secure vault
- [Contact](contact.html) — contact rows, encrypted-channel terminal and validated message form

## Design system

- Canvas `#05070C`, panels `#0D1219` / `#131C2B`, borders `#243450`.
- Accents: cyan `#4CC9F0`, violet `#8B7CF6`, green `#34D399`, amber `#F5B94A`.
- Type: Carlito for display and body, Courier Prime for labels, counts and terminal text.
- Square panels, four-point corner brackets, hairline rules, dotted technical grid and colour-coded status tags.
- Shared tokens, chrome and primitives live in `assets/css/core.css`; page families are split into focused modules that every page links from its `<head>`, so the browser fetches them in parallel rather than through a chain of `@import`s.
- Responsive from 320px up, with a compact page structure at tablet and mobile widths.

## Interaction

- Boot sequence on the entry cover, playable once per tab and skippable.
- Full-screen falling-code canvas behind the entry cover, paused while the tab is hidden and disabled for reduced motion.
- Page-transition wipe for internal navigation, a short 180 ms curtain that hands over to the prefetched page; skipped when reduced motion is requested.
- Navigation acceleration: internal pages are prefetched on hover and focus only, and skipped entirely on Save-Data or 2G connections.
- Sticky navigation with a collapsible mobile menu (Escape closes it).
- Scroll reveals, a 3D pointer tilt on the About identity stack, and animated HUD counters.
- Rotating live-threat ticker on the home page.
- Interactive orthographic globe on the home page: drag or use the arrow keys to rotate in any direction, with a pulsing marker on West Bengal and animated network arcs. Idle spin runs at 22.35°/s, and three magnetic-field orbit rings plus a radiation halo travel with it on the same 16.1 s revolution.
- Project status filters, empty state and accessible `<dialog>` mission reports.
- Skill badges that reveal the builds using each skill.
- Flippable About identity card with a capability record on the back.
- Contact form with inline validation, success/error states and FormSubmit delivery.

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Performance notes

- Typefaces are self-hosted latin subsets in `assets/fonts/` and declared in `core.css` with `font-display: swap`; there is no third-party font request before first paint. The regular Carlito weight is preloaded.
- Frosted blur is limited to true overlays — the page wipe, modal dialogs, the boot screen and the small portrait caption. Panels, cards and windows use translucent fills with borders and inset highlights, so the glass look is identical over the flat canvas at a fraction of the paint cost.
- Images ship as WebP (portrait and certificate preview); the original JPG/PNG stay in `assets/` as source files.
- The boot sequence runs for 1.3 s and is skippable.
- Nav prefetching happens on intent, not on load, so opening a page does not download the other five.
- Animations respect `prefers-reduced-motion`, and the transition wipe is skipped for it.

## Project structure

```
index.html               Entry cover
dashboard.html           Home command deck
about.html               Identity, education, experience, skills and the five-level journey
projects.html            Featured build and filterable archive
certificates.html        Featured credential and document vault
contact.html             Contact details and message form

assets/css/core.css      Tokens, reset, header, footer, panels, buttons, terminal, motion
assets/css/entry-home.css
assets/css/about-skills.css
assets/css/projects-certs.css
assets/css/journey-contact.css
assets/css/responsive.css
assets/fonts/*.woff2      Self-hosted latin subsets: Carlito and Courier Prime (400/700)
assets/site.js           Navigation, boot, wipe, reveals, tilt, filters,
                         dialogs, skill readout, card flip, ticker, counters and form
assets/globe.js          Interactive home-page globe: rotation, land mask, arcs and location marker
assets/world-land-110m.json
                         Natural Earth 1:110m land geometry (public domain)
assets/arka-patra.webp   Portrait used on the About profile card (JPG kept as source)
assets/cert-thiranex-preview.webp
                         Thiranex certificate preview (PNG kept as source)
assets/favicon.svg       Cyan "A" mark
assets/Arka_Patra_CV.pdf Downloadable CV
assets/cert-*.pdf        Credential documents
assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
```

## Credits

- Typefaces: Carlito and Courier Prime (SIL Open Font License), self-hosted from the Google Fonts distribution.
- Land geometry from [Natural Earth](https://www.naturalearthdata.com/) 1:110m land (public domain).
- Visual language derived from the supplied *Arka Patra Portfolio UI/UX 3D* design deck.
- Icons are CSS and inline SVG; no icon library is bundled.

## Links

- [GitHub](https://github.com/arkap1502)
- [LinkedIn](https://www.linkedin.com/in/arka-patra-579110422/)
- [Email](mailto:arkap1502@gmail.com)

## License

MIT — see [LICENSE](LICENSE).
