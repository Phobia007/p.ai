# Initial repository delivery — 2026-10-09

Target: `Phobia007/p.ai`, branch `main`.

## Completed checks

- Imported 578 runtime files (52,483,832 bytes, approximately 50.05 MiB).
- SHA-256 verification confirms all imported repository files match the import inventory. Only local path metadata in `assets/avatar-catalog.json` was sanitized; the machine-specific authentication source manifest was excluded.
- `npm install --no-audit --no-fund` installed the pinned dependency tree and generated `package-lock.json`.
- `npm run check` passed: source/output validation, HTML resource references, required pages, file-size checks, workstation path and private-key checks, and Wrangler deployment dry run.
- All 30 `index.html` page routes responded successfully from the independent `dist/` preview.
- Microsoft Edge browser checks passed for Home in light/dark, Get Preacherman in light/dark, the persistent account panel, Windows unavailable notice, macOS Apple Silicon selection, Contact navigation and links, and mobile layout without horizontal overflow.
- The latest Get Preacherman heading remains 40 px with its left-aligned layout and spacing.
- Browser checks recorded zero console/page errors, zero failed same-origin responses, and zero external network requests in these exercised states.
- Temporary browser and HTTP server were closed after verification.

## Scope and remaining launch checks

This delivery uploads the current static website to GitHub. It does not publish a Cloudflare deployment, switch domain routing, change the old repositories, or modify the desktop application.

The browser checks open the account panel but do not submit real credentials. Live sign-in, session restoration and sign-out still need account-based acceptance. Installer URLs remain intentionally unavailable.

The existing exported Nuxt/Vue bundles are preserved. Original upstream Vue source files are not part of the editor export. Imported search/social metadata and the web manifest still contain legacy branding and need a separate launch pass. The Website action still points to `https://preacherman.ai/`; choose its final product destination before placing this presentation at that domain.

Before switching Cloudflare, verify its active Git connection, production branch, build command, domain bindings, and www redirect. The checked-in Wrangler file preserves the intended existing Worker identity; its presence alone does not establish a Git connection or prove a deployment.
