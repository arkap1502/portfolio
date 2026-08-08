# Arka Patra — Portfolio

A premium, dark cybersecurity-themed personal portfolio for **Arka Patra**, a B.Sc. Cyber Security student and security-focused developer from West Bengal, India.

Live sections: Hero · About · Skills · Projects · Certifications · Education · Cybersecurity Journey · GitHub · Security Lab · Contact.

## Preview

Open `index.html` in any modern browser — it's a single self-contained file with no build step and no dependencies to install.

## Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties (design tokens), glassmorphism, grid/flex layout, keyframe animations
- **Vanilla JavaScript** — no frameworks or libraries; all interactivity is hand-written

Fonts are loaded from Google Fonts (Space Grotesk, Inter, JetBrains Mono). Everything else — icons, layout, animation — is inline, so the whole site is a single portable `index.html`.

## Features

- Responsive layout (desktop, tablet, mobile) with a hamburger menu below 900px
- Sticky navigation with scroll-based active-link highlighting
- Typed terminal animation in the hero
- Scroll-reveal animations via `IntersectionObserver`
- Project filtering (All / Cybersecurity / Web Development)
- Expandable "Technical Details" panels on each project card
- Animated 0–100 risk meter on the URL Threat Scanner project card
- Click-to-copy email in the contact section
- Holographic certification cards
- Full keyboard navigation and visible focus states
- Respects `prefers-reduced-motion`
- SEO metadata, Open Graph tags, and an inline SVG favicon (no external image files needed)

## File Structure

```
index.html   → everything: markup, <style> CSS, and <script> JS in one file
```

## Before You Publish

Two placeholders still need your details:

| What | Where in the file | What to do |
|---|---|---|
| Contact email | search for `emailBtn` / `data-copy` | Replace `your.email@example.com` with your real email |
| CV download | search for `downloadCvBtn` | Currently shows an alert — point the button at a hosted PDF resume (e.g. upload to your repo and link `href="/resume.pdf"`) |

## Content Policy

All project details, GitHub links, CGPA figures, and the Deloitte Australia Cyber Job Simulation (Forage) credential reflect only what was explicitly provided — nothing about work experience, internships, certifications, or credentials was invented. Cybersecurity projects are clearly labeled as educational/demo tools, not production security products.

## Deploying

Since it's a single static file, you can host it for free on any of:

- **GitHub Pages** — push to a repo (e.g. `arkap1502/portfolio`), enable Pages on the `main` branch
- **Netlify / Vercel** — drag-and-drop deploy of the folder containing `index.html`

## License

Personal portfolio content — free to use as a structural reference, but replace the personal details before reusing.

---

© 2026 Arka Patra. Built with curiosity, code & security in mind.