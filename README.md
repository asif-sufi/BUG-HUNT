# BUG-HUNT

A structured single-page **Offensive Security Command Hub** for bug bounty + penetration testing workflows.

## Features

- Large multi-category command arsenal (recon, web, API, OIDC, AD, privesc, mobile, chains)
- Dynamic placeholders: `[TARGET]`, `[IP]`, `[SELECTOR]`, `[WORDLIST]`
- AI Config modal for Gemini key storage in local browser storage
- AI helper cards (payload crafting + recon analysis)
- Favorites, active/passive/offline filters, full search, export/import JSON
- Safe import validation to prevent broken tool objects

## Run locally

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Open `http://localhost:8000`.
