# Arka Patra — Portfolio

Personal portfolio site for **Arka Patra**, a B.Sc. Cyber Security student building security-focused Python and web applications.

🔗 Single-page, dark-themed site with a terminal-style hero, animated 3D background, and smooth in-page navigation.

## Features

- **Single-page layout** — all sections (Home, Skills, Projects, Certifications, Journey, GitHub, Contact) live on one scrollable page with smooth-scroll navigation and scroll-based active-link highlighting.
- **Animated hero terminal** with a typing effect and a small animated 3D robot companion.
- **Three.js background** — subtle animated network/particle scene behind the content.
- **Custom cursor** — canvas-based "water flow" cursor effect on desktop/pointer devices.
- **Project showcase** with category filtering (Cybersecurity / Web) and expandable technical detail panels.
- **Scroll-reveal animations** for section content as you scroll down the page.
- **Responsive design** with a mobile hamburger menu.
- **Accessible** — respects `prefers-reduced-motion`, includes focus states and ARIA labels.

## Tech Stack

- HTML5, CSS3 (custom properties, no framework)
- Vanilla JavaScript (no build step required)
- [Three.js](https://threejs.org/) (r128) for the 3D background
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## Sections

| Section | Description |
|---|---|
| Home | Hero intro, terminal animation, status chips, socials |
| Skills | Tools and concepts used across development and security work |
| Projects | Featured builds (e.g. Altron Password Inspector, URL Threat Scanner, Phish·AI, Personal Portfolio) with filtering and tech details |
| Certifications | Verified credentials |
| Journey | Timeline of the cybersecurity learning path |
| GitHub | Highlighted public repositories |
| Contact | Contact form and direct contact options |

## Getting Started

This is a static site with no dependencies or build process.

1. Clone or download the repository.
2. Open `index.html` directly in a browser, **or** serve it locally:

   ```bash
   python3 -m http.server 8000
   ```

   Then visit `http://localhost:8000`.

## Customization

- **Colors / theme** — edit the CSS custom properties in the `:root` block at the top of `index.html` (`--cyan`, `--green`, `--bg`, etc.).
- **Content** — update the relevant `<section>` blocks (Skills, Projects, Certifications, Journey, GitHub, Contact) directly in `index.html`.
- **Resume/CV** — the "Download CV" button currently shows a placeholder alert; replace it with a real link to your PDF resume.
- **Social links** — update the footer and hero social icons with your own profile URLs.

## License

This project is free to use and adapt for your own portfolio.