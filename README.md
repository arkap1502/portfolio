# Arka Patra — Portfolio

A static portfolio for Arka Patra, a cybersecurity student and developer from Kolkata, India. Plain HTML, CSS and JavaScript — no frameworks, no build step.

The interface follows the page-by-page design in `DESIGN.md`: a cream editorial landing page, a pine-split Home page, brutalist Work / About / Certificates pages and a pine-and-lime Contact page. Each page has one fixed look — there is no dark mode and no theme switch.

## Pages

- [Landing](index.html) — cream editorial entry page: Georgia heading, arch portrait, orange builds badge
- [Home](home.html) — pine split hero, profile stats, selected work, the certificate portion (internship + Deloitte) and an about/contact pair
- [Work](projects.html) — featured Website Security Copilot and the three-row project ledger
- [About](about.html) — hero, marquee strip, profile and record, the working skills matrix with related-builds readout, technical skills ledger and the five-level journey
- [Certificates](certificates.html) — the Thiranex internship certificate first, the Deloitte cyber job simulation second, then eight more credentials
- [Contact](contact.html) — direct links and a validated message form

## Design system

- **Landing:** cream `#F2EEE6`, ink `#141414`, orange `#C2410C`; Georgia heading, Arial body.
- **Home / Contact:** pine `#0F2A22` and `#1E3A30`, clay `#D98B5F` on Home, lime `#D5F87A` on Contact.
- **Work / About / Certificates:** stone `#E4E2DD`, black `#0B0B0B` nav band and ledger strips.
- **Type:** Arial for headings and body, Courier New for wordmark, labels and ledger metadata, Georgia for the landing heading, Calibri and Cambria on Contact. System fonts only.
- Capsule buttons, square-cornered panels and ledgers, no shadows, gradients or glass. One stylesheet (`assets/css/site.css`) and one deferred script (`assets/site.js`).

## Run locally

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Performance notes

- One stylesheet and one deferred script for the whole site; no libraries, no web fonts requested from a third party.
- No blur filters, no canvas, no continuous animations. Hover and focus states only, all disabled for `prefers-reduced-motion`.
- Images are WebP, served at their display size, and the certificate preview and portrait are sized in the markup to avoid layout shift.

## Project structure

```
index.html               Landing (cream)
home.html                Home (pine split)
projects.html            Work
about.html               Profile, skills matrix, technical ledger, journey
certificates.html        Internship and Deloitte credentials plus the vault
contact.html             Direct links and message form

assets/css/site.css      Tokens per page palette, components, layouts, responsive rules
assets/site.js           Mobile menu, skill readout and contact form
assets/arka-patra.webp   Portrait
assets/cert-thiranex-preview.webp
                         Thiranex certificate preview
assets/favicon.svg       Wordmark mark
assets/Arka_Patra_CV2.pdf
                         Downloadable résumé
assets/cert-*.pdf        Credential documents
assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf
```

## Links

- [GitHub](https://github.com/arkap1502)
- [LinkedIn](https://www.linkedin.com/in/arka-patra-579110422/)
- [Email](mailto:arkap1502@gmail.com)

## License

MIT — see [LICENSE](LICENSE).
