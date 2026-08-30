# Yashwanth Krishna — Personal Site

A hand-built static personal site. No build step, no frameworks, no icon libraries —
just HTML, one CSS file and one vanilla JavaScript file. Open `index.html` in a
browser (or serve the folder) to view. Live at https://yashwanth-krishna-g.github.io/
## Structure

```
index.html                 Home — hero (flow-field canvas), selected work, experience,
                           about, accolades rail, life teaser, contact
work.html                  Full project index with discipline filters
project-topology.html      Case study: Generative AI for topology optimisation (flagship)
project-turbine.html       Case study: Parametric CFD of a radial turbine
project-cfd.html           Case study: CFD solvers from scratch (MathJax equations)
project-aero.html          Case study: SAE Aero Design UAV (MathJax equations)
project-bionic.html        Case study: Compliant bionic arm
project-supra.html         Case study: Supra SAE India powertrain
project-maker.html         Build notes: smart water-filling system + 3D-printed speaker
life.html                  Routine, gym, badminton, gaming, hobbies (bento grid)
404.html                   Not-found page (GitHub Pages picks this up automatically)

assets/
  css/style.css            The whole design system — all colours live in the token
                           blocks at the top (dark default, [data-theme="light"] override)
  js/main.js               Theme toggle, nav, scroll reveal, hero particle field,
                           accolades rail, project filters, copy-email
  img/art/                 Generated blueprint-style SVG schematics for projects
                           without photos (topology, bionic, supra, water, speaker)
  img/                     Photos, accolade thumbnails, project media
  video/                   Project videos (CFD runs, turbine runs, flight test)
  docs/                    Résumé, certificates and report PDFs
```

## Design notes

- Fonts: Fraunces (display serif), Inter (body), JetBrains Mono (labels) via Google Fonts.
- Icons are small inline SVGs — Font Awesome was removed.
- The hero background is a canvas particle flow field (a nod to CFD streamlines);
  it pauses off-screen and disables itself for `prefers-reduced-motion`.
- Theme is persisted in `localStorage` and applied by a tiny inline script before
  first paint to avoid flashing.

## Deploying

The site is plain static files. Push to the `main` branch of
`MAffanK/maffank.github.io` and GitHub Pages serves it as-is. (A `netlify.toml`
with cache headers is included if it's ever hosted on Netlify.)

## Still to add

- Real photos for the bionic arm, Supra, water system and speaker (the generated
  schematics stand in for now — swap the `assets/img/art/*.svg` references).
- Photo wall on the Life page.
