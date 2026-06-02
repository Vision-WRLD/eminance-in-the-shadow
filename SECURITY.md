# Security Policy

NOCTURNE ("Eminance in the Shadow") is a static, client-only demonstration site. There is no backend, database, authentication, or payment processing — the attack surface is intentionally minimal.

## Hardening in place
- **Content-Security-Policy** locks sources to self plus Google Fonts and Unsplash images; `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`. Set both via `<meta>` (works on any host) and `_headers` (Netlify/Cloudflare).
- **Clickjacking**: `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`.
- **MIME sniffing**: `X-Content-Type-Options: nosniff`.
- **Referrer**: `strict-origin-when-cross-origin`.
- **Permissions-Policy** disables geolocation, mic, camera, payment, USB, FLoC.
- **HSTS** preloads HTTPS for two years.
- **COOP / CORP** isolate the browsing context.
- No cookies, no analytics, no third-party trackers. State lives only in browser `localStorage`.
- No secrets in the repo (`.env*` git-ignored).

## Note on hosting
`<meta>` CSP applies everywhere. The full header set in `_headers` applies on hosts that honour it (Netlify, Cloudflare Pages). GitHub Pages serves over HTTPS but does not apply custom headers; deploy behind Netlify/Cloudflare for the complete set.

## Reporting
Open an issue at https://github.com/Vision-WRLD or use the site contact page.
