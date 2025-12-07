# Counting Machine (Parcel friendly wrapper)

This folder contains a Unity WebGL build and a small Parcel configuration so you can develop and bundle it using Parcel.

What I added:
- `package.json` – parcel + scripts
- `server.js` – simple express static server that serves pre-compressed Brotli `.br` files with correct headers for Unity WebGL

Quick start
1. Install dependencies

```bash
cd public/counting-machine
npm install
```

2. Run dev server with Parcel

```bash
npm run dev
```

This opens a Parcel dev server which serves the `index.html` entry. Note: Parcel dev server may not set `Content-Encoding` headers for `.br` files. For testing production-like behavior with Brotli assets, run the `serve` script.

3. Run the express-based static server to serve `.br` with headers

```bash
npm run serve
```

Then open http://localhost:5000/ to see the Unity game.

Production build

```bash
npm run build
```

This builds the site into `dist/` which you can deploy. If your deployment target supports compressed assets, configure your server to serve `.wasm.br` and `.js.br` with `Content-Encoding: br` and correct `Content-Type`.

Notes and caveats
- Unity WebGL builds typically rely on the server to send the right `Content-Encoding` and `Content-Type` headers for `.br` compressed files. If you deploy to a static host (Netlify, Vercel, S3 + CloudFront), check their docs on Brotli and WASM serving.
- Parcel may alter asset URLs during bundling; the `Build/` directory references in `index.html` should still resolve, but when deploying you might need to adjust paths or copy the raw `Build` folder into the output directory.
