# BUG-HUNT

Structured, single-page **Offensive Security Command Hub** with:
- Category-based command cards
- Dynamic variable replacement (`[TARGET]`, `[IP]`, `[SELECTOR]`, `[WORDLIST]`)
- Safe JSON import/export with schema validation
- Favorites, search, active/passive/offline filters
- AI assistant cards with graceful fallback when API key is missing
- Chart overview with Chart.js fallback guard

## Run locally

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Files

- `index.html` – app shell and layout
- `app/styles.css` – component styling
- `app/app.js` – application logic and rendering
