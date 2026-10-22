# Delphic Auth

Shared email/password sign-in for Delphic apps. There is no public sign-up.

Apps send people to:

```text
https://auth.delphic.studio/?redirect=<encodeURIComponent(absolute return URL)>
```

`redirect` must be an `https` URL whose host is `delphic.studio` or a subdomain of it. Any other value is rejected.

After a successful sign-in, or when a session is already present, the site refreshes the Firebase ID token and:

1. Sets `delphic_token=<idToken>; Domain=.delphic.studio; Path=/; Secure; SameSite=Lax; Max-Age=3600`
2. Returns to `redirect` with the token in the fragment: `#token=<idToken>`

Apps store that fragment value in `sessionStorage` under `delphic_token`, then remove the fragment. They may also read the cookie of the same name.

## Accent

The accent is `#F6ADC6` (抚子粉, Nadeshiko). The runner-up is `#FFB7C5` (樱花, cherry blossom).

The other candidates are in [`docs/accent-compare.html`](docs/accent-compare.html):

- `#F3B6C0`, the previous accent
- `#EFBBCC`, Cameo Pink (ISCC-NBS)
- `#F091A9`, Mauvelous (Crayola)

## Local

```bash
npm install
npm run dev
```

## Deploy

Cloudflare Pages project `delphic-auth`, custom domain `auth.delphic.studio`.

```bash
npm run build
npx wrangler pages deploy dist --project-name delphic-auth
```
