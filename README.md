# TitleBlock — IT Project Artifact Control

A project-management artifact generator for IT/software teams. Pick a
template, fill in the mandatory fields, and generate a versioned artifact
that links back to the previous revision for the same project — with
changed fields flagged automatically.

Templates included: Software Release Note, Sprint Status Report, Technical
Design Document, Incident / Bug Report, and Statement of Work (SOW).

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons
- Data persistence via `localStorage` (see note below)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## About data storage

`src/App.jsx` was originally built as a Claude.ai artifact, where a
`window.storage` API is provided by the platform for saving data across
sessions. This repo includes a small shim in `src/main.jsx` that
re-implements the same `get` / `set` / `delete` / `list` interface on top of
`localStorage`, so the app works standalone with no backend.

That means:
- Data is stored per-browser, not shared between users or devices.
- Clearing browser storage clears the artifacts.

If you want multi-user or cross-device persistence, swap the shim in
`src/main.jsx` for calls to your own API (e.g. a small Express/Supabase/
Firebase backend), keeping the same four-method interface so `App.jsx`
doesn't need to change.

## Pushing to GitHub

From this project folder:

```bash
git init
git add .
git commit -m "Initial commit: TitleBlock artifact generator"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploying

Any static host works since this builds to plain HTML/JS/CSS in `dist/`:
Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc. Point the build
command to `npm run build` and the output directory to `dist`.
