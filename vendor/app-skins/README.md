# app-skins

Selectable skins shared by all of Dr. Lin's apps: **Modern Minimal, Dark Elegant, Glass, Editorial, Impressionist, Playful**.
Open `preview.html` to see them all.

## In a Vite/React app (Schedule Maker, ShiftEval, ResearchForge, FHR Lens…)

```bash
npm install github:pjungwp/app-skins
```

```ts
import 'app-skins/skins.css'          // tokens, fonts and background art (art loads only when its skin is on)
import { SKINS, applySkin } from 'app-skins'
applySkin(savedId)                     // sets <html data-skin="…">; applySkin(null) returns to the app's own look
```

Each app adds one small adapter block mapping `--sk-*` onto its own colour names (see `PROMPT.md`, step 3).
To pick up new art or skins, re-install (`npm update app-skins`) and redeploy.

## Anywhere else (Lovable, Google Sites, a single HTML file)

Download `pack/app-skins-pack.zip`: stylesheet, `tokens.json`, art, preview page and `PROMPT.md`, a copy-paste prompt that tells ChatGPT or Claude how to add the skins to an app.

## Adding or changing a skin

Edit `skins.data.mjs` (one block of tokens per skin, art paths optional), drop images into `art/` (WebP for paintings, SVG for line art), then run `npm run build`.
All art: no text, calm centre, wide (≈1536×1024) and tall (≈1024×1536) versions for backgrounds.

## Apps without a build step (plain HTML)

Copy the `static/` folder into the app as `skins/`, then:

```html
<link rel="stylesheet" href="skins/skins.css">
<script src="skins/skins.js"></script>
<script>AppSkins.init('myapp.skin')</script>   <!-- re-applies the saved choice before first paint -->
```

`AppSkins.SKINS` lists the skins for a picker; `AppSkins.set(id)` switches and saves (`null` = the app's own look). Then add the adapter CSS block (see `PROMPT.md`, step 3).
