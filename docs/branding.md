# Browser favicon

The favicon is reused directly from the live `https://preachermanai.com/` page, per the owner's request on 2026-10-09. The repository uses the exact same SVG data URI in every full HTML page. `public/favicon.svg` contains the identical SVG bytes.

- Source dimensions/viewBox: 212 × 240.
- Source SHA-256: `2d3547187f3e85dedeaf33b59d7a90f78b1c21d43486ca441158bc59403ff91c`.
- Preserve its paths, black fill, original proportions, and transparent background. Do not redraw it, crop a different monogram, add a backing shape, or recolor it.
- ICO, PNG, Apple touch and web-manifest icons are compatibility rasterizations of that same SVG, centered with their aspect ratio preserved.
- The browser tab name remains `preacherman` on all routes.

`npm run build` verifies the source icon hash and the matching favicon URI on every full HTML page. The original local editor preview uses the same asset and head links.
