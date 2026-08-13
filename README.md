# Arka Patra — Portfolio

A single-page portfolio site for **Arka Patra**, a B.Sc. Cyber Security student (GNIT / MAKAUT) building security-focused Python and web tools. Built as one self-contained `index.html` file — no build step, no dependencies to install.

## Features

- Responsive single-page layout with smooth-scroll navigation and active-section highlighting
- Animated typing terminal in the hero section
- Filterable project grid (All / Security / Web / Tools, etc.)
- Expandable "technical details" panels on project cards
- Animated risk meter demo on the URL Scanner project card
- Click-to-copy email button in the Contact section
- Scroll-triggered reveal animations throughout
- Mobile hamburger menu
- Respects `prefers-reduced-motion` for users who want fewer animations

## Sections

| Section | Anchor |
|---|---|
| Hero | `#home` |
| Education | `#education` |
| Skills | `#skills` |
| Projects | `#projects` |
| Journey / Timeline | `#journey` |
| Contact | `#contact` |

## Tech Stack

- Plain HTML5 + CSS3 (custom properties / design tokens, no framework)
- Vanilla JavaScript (no libraries)
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## Getting Started

No build tools required. Just open the file in a browser:

```bash
open index.html
```

Or serve it locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Customization

Before deploying, update the following placeholders:

- **CV / resume link** — the "Download CV" button (`#downloadCvBtn`) currently shows an alert; replace its `href` with a path to your PDF resume and remove the JS placeholder handler.
- **Email address** — the copy-to-clipboard contact button uses `data-copy="your.email@example.com"`; replace with your real email.
- **Social links** — GitHub, LinkedIn, Instagram, and Threads URLs are hardcoded in the hero, contact, and footer sections; update as needed.
- **Project repos** — each project card links to a GitHub repo under `github.com/arkap1502`; update if repos move or new projects are added.

## Browser Support

Targets modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses CSS `backdrop-filter`, CSS custom properties, and `IntersectionObserver`.

## License

Personal portfolio — content and branding belong to Arka Patra. Feel free to use the code structure as a template for your own portfolio.