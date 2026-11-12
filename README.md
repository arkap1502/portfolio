# Arka Patra — Portfolio

A static portfolio for Arka Patra, a cyber security student and security-focused developer from West Bengal, India. Built with HTML, CSS and JavaScript — no frameworks or build step.

The interface follows the **Lunar** design system: a charcoal, near-monochrome canvas with panels, hairline rules, mono labels, and a serif italic accent voice.

## Pages

- [Entry](index.html) — animated cover with orbit, laptop and phone
- [Home](dashboard.html) — hero with build/certificate/internship counts, live threat monitor, astronaut visor and palette strip, then a scroll-down row with the Thiranex internship credential and one featured build
- [Projects](projects.html) — eight security builds with filters and detail dialogs
- [About](about.html) — profile, education, experience and toolkit (light by default)
- [Certificates](certificates.html) — featured credential and nine certificate cards
- [Contact](contact.html) — contact details and validated message form

## Design system

- Charcoal `#151515` background, `#1D1E1E` panels, `#0F0F0F` insets, hairline `#333334` rules.
- Poppins for display and body, Source Serif 4 italic for accent lines, Courier Prime for labels.
- Light and dark themes via the footer switch, persisted in `localStorage` (`arka-theme`).
- Five visor sets — Pearl, Obsidian, Glacier, Nebula and Lunar — selectable from the home-page strip and persisted in `localStorage` (`arka-palette`). Picking one rethemes the entire interface: canvas, panels, insets, hairlines, text tones and accent, in both light and dark, plus the hero astronaut portrait (`assets/theme-*.webp`). Lunar is the default. The entry cover keeps its own lunar canvas and is excluded from the palette themes.

## Interaction

- Responsive layout with a collapsible mobile menu.
- Project category filters and accessible `<dialog>` details.
- Animated live-threat ticker on the home page.
- Contact form validation with inline errors and a success state.
- Scroll reveals with a safety fallback so content is never left hidden.

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project structure

```
index.html            Entry cover
dashboard.html        Portfolio home
projects.html         Project index
about.html            About and record
certificates.html     Credentials
contact.html          Contact and form
assets/site.css       Design system, themes, palettes, responsive rules
assets/site.js        Navigation, theme/palette, filters, dialogs, ticker, form
assets/lunar-hero.webp  Master astronaut artwork
theme-*-hero.webp      Full-resolution hero art per visor set (graded from the master)
theme-*.webp           Palette strip thumbnails, cropped from the same art
assets/cert-*.pdf     Credential documents
assets/Arka_Patra_CV.pdf
```

## Credits

- Typefaces served by [Google Fonts](https://fonts.google.com/): Poppins, Source Serif 4 and Courier Prime.
- Astronaut artwork and palette thumbnails are derived from the supplied Lunar design deck and optimised as WebP.

## Links

- [GitHub](https://github.com/arkap1502)
- [LinkedIn](https://www.linkedin.com/in/arka-patra-579110422/)
- [Email](mailto:arkap1502@gmail.com)

## License

MIT — see [LICENSE](LICENSE).
