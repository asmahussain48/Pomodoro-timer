# Pomodoro Timer

A glassmorphic, animated Pomodoro timer — Focus / Short Break / Long Break modes, a live circular progress ring, ambient background sounds (lofi, rain, nature, fireplace, library, original), session tracking, and fullscreen mode. Pure HTML/CSS/JS, no build step.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8080
```

## Deploy to Vercel

This is a static site, so no configuration is required.

**Option A — CLI:**

```bash
npx vercel --prod
```

**Option B — Git:**

1. Push this folder to a GitHub repo.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other**. No build command, output directory is the project root.

`vercel.json` is already included with clean URLs and long-term caching for `images/` and `sounds/`.
