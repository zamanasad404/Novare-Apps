# Novare Apps Hub (PWA)

A lightweight hub for your PWAs — curated by **Novare Enterprise**. Brand message: **Innovate**.

## Features
- GitHub Pages ready (no build tools)
- apps.json catalog; add apps post-deploy
- Admin link to edit catalog (`?admin=1`)
- Installable PWA, offline app shell
- Accessibility: high-contrast, dyslexia-friendly, text resize, keyboard focus

## Quick Start
1. Click **Use this template** or clone.
2. Replace placeholders in:
   - `app.js` → `CONFIG.GITHUB_EDIT_URL`
   - `apps.json` → your app entries
   - (Optional) `CNAME` → your custom domain
3. Commit & push to `main`.
4. In **Settings → Pages → Source: `main` / `/ (root)`**.
5. Visit your Pages URL.

## Add/Update Apps (post-deploy)
- Edit `apps.json` in GitHub (via UI).
- Fields: `title`, `url`, `paid` (bool), `price_label?`, `summary`, `badge?`, `paypal_ncp_url?`.
- No version bump required; list refreshes via stale-while-revalidate.

## Admin Link
Append `?admin=1` to the hub URL to reveal an **Edit app list** button. It opens the `apps.json` editor at:
`CONFIG.GITHUB_EDIT_URL`.

## Service Worker
- App shell cached at install.
- `apps.json`: stale-while-revalidate.
- To force-update, bump `CACHE_VERSION` in `service-worker.js`.

## Accessibility
- Skip link, clear focus styles, large hit targets.
- High-contrast & dyslexia-friendly toggles.
- Text-size slider (90–130%).

## Custom Domain
- Add a `CNAME` file with your domain (e.g., `apps.novareapps.com`).
- Create a CNAME DNS record to `YOUR_USERNAME.github.io`.
- GitHub Pages will issue HTTPS automatically.

## Testing
- Open DevTools → Application → Manifest: Check installability.
- Application → Service Workers: check for “activated”.
- DevTools → Network → offline: confirm app shell loads.
- Run Lighthouse; targets: PWA ✓, Perf ≥ 90, A11y ≥ 95.

## Credits
Novare Enterprise — **Innovate**
