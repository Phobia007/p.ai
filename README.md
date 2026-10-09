# Preacherman website

Current interactive Preacherman website for `preacherman.ai`, imported on 2026-10-09. This repository is separate from the desktop application and `preachermanai.com`.

## Source and build

`public/` is the canonical, complete static website: HTML routes, editable custom JavaScript/CSS, the existing Nuxt/Vue runtime bundles, fonts, scene models, textures, images, and audio. The export does not contain the original upstream Vue source project. Builds preserve the current rendered site and do not regenerate it from an older mirror.

Use Node.js 22.12 or later:

```sh
npm ci
npm run check
npm run preview
```

`npm run build` validates and copies `public/` into `dist/`. `npm run check` additionally checks the Cloudflare package without deploying it. The preview binds to `127.0.0.1:8124`; set `PORT` to change this. Stop it with Ctrl+C. No Open Design installation or workstation-specific directory is required.

Edit `public/`, then rebuild. Do not edit generated `dist/`. Dependency folders, build output, screenshots, local sessions, historical exports, and desktop executables are excluded from Git.

## Main pages

- `/`: interactive scene and avatar exploration
- `/vision/`, `/accessories/`, `/whitepaper/`: detail pages
- `/contact/`: Outlook compose link and `preachermanai.com` link
- `/get-app/`: Get Preacherman, Windows notice, macOS architecture choices, Website link
- `/work/` and `/pillars/`: existing catalog and detail routes

The site supports light and dark appearance. The persistent account control opens the existing login panel.

## Important editable components

- `public/assets/get-preacherman.css`, `GetPreacherman.js`, `get-preacherman-markup.js`: download panel and spacing.
- `public/assets/get-preacherman-config.js`: installer URLs (currently `null`) and Website destination (`https://preacherman.ai/`).
- `public/assets/auth/`: account panel, existing email/password authentication, and pinned browser SDK/license.
- `public/assets/scene-appearance.*`, `scroll-entry.*`, `pillar-art.*`: appearance, scene entry, and outline illustrations.
- `public/assets/navigation-pages.json`, `avatar-catalog.json`, `pillar-catalog.json`: reference content catalogs. Existing HTML and compiled modules also embed content; changing a catalog alone does not regenerate them.

Downloads intentionally show unavailable notices. The imported authentication code supports email/password; other unconfigured sign-in choices retain their notices. Live authentication needs separate acceptance with a real account. Its browser configuration contains a public project URL and publishable key, not server credentials.

## Cloudflare connection (next step)

This repository upload does not connect or deploy Cloudflare. The included Wrangler configuration preserves the existing Worker identity `preacherman-ai`, `dist/` output, and `preacherman.ai` / `www.preacherman.ai` custom domains for a later authorized switch.

| Setting | Value |
| --- | --- |
| Repository | `Phobia007/p.ai` |
| Branch | `main` |
| Root directory | `/` |
| Build command | `npm run build` |
| Deployment command | `npx wrangler deploy` |
| Static assets | `dist/` |

Keep the existing www redirect when changing the repository connection. Before promoting the site, verify all live routes and authentication, review imported page titles/social/canonical metadata, and review the Website destination: it currently points to the same domain this site will occupy. This import deliberately preserves the approved page content and link behavior.

## Import integrity

The current website's runtime files were copied without visual changes. Local filesystem paths in reference JSON metadata were reduced to filenames. The machine-specific authentication import manifest was omitted. No original mirror, Open Design workspace history, or old build pipeline is included. `docs/verification.md` records delivery checks and known limits.
