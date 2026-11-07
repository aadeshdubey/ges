# Gayatri Electrical Services (GES) — GitHub Copilot & Coding Agent Instructions

You are working on the official enterprise repository for **Gayatri Electrical Services (GES)** (`https://www.gayatrielectrical.in`), a Government Authorized Electrical Contractor (Est. 2003) and Licensed Lift Contractor in Bhiwandi, Maharashtra.

## 1. Strict Root Directory Hygiene
- **NEVER add random scripts, logs, or helper files to the root (`/`) directory.**
- Only files strictly required at `/` by GitHub Pages, W3C Service Worker scope, search crawlers, or Git/Node (`index.html`, `404.html`, `CNAME`, `sw.js`, `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `ges2026indexnowkeybhiwandi9999.txt`, `package.json`, `README.md`, `LICENSE`, `.gitignore`, `.gitattributes`) belong in root.
- Release & deployment scripts belong in **`deploy/`** (`deploy/deploy.ps1`, `deploy/deploy.bat`, `deploy/deploy.js`, `deploy/preview.js`), with runtime logs written to `deploy/logs/` (git-ignored).
- Build & validation utilities belong in **`scripts/`** (`scripts/build.js`, `scripts/sync-version.js`, `scripts/validate.js`, `scripts/ping-sitemap.js`).
- Version metadata, JSON-LD schema, and locales belong in **`data/`** (`data/version.json`, `data/schema.json`, `data/translations.json`, `data/locales/{en,hi,mr}.json`).
- Web manifests, OpenSearch, authorship credits, icons, and self-hosted fonts belong in **`assets/`** (`assets/site.webmanifest`, `assets/opensearch.xml`, `assets/humans.txt`, `assets/fonts/`).
- Machine-readable security and agent discovery endpoints belong in **`.well-known/`** (`.well-known/security.txt`, `.well-known/agent.json`).

## 2. Branching & Release Promotion Workflow (`dev` -> `main`)
- **`dev`** is the active development and testing branch.
- **`main`** is the live production branch served by GitHub Pages (`www.gayatrielectrical.in`).
- All commits must follow the exact convention:
  `GES v<VERSION> : <Concise summary of changes>`
  (Example: `GES v26.11.07.1 : Update main landing page and EN/HI/MR localization dictionaries`)
- Never create empty or line-ending-only (`CRLF` vs `LF`) commits.

## 3. Single Source of Truth for Versioning (`data/version.json`)
- `data/version.json` controls the CalVer build (`YY.MM.DD.BUILD`) and release date across all 16 synchronized files.
- Always run `node scripts/build.js` and `node scripts/sync-version.js` after editing locales or version metadata.
- Always verify changes with `node scripts/validate.js` (or `.\deploy\deploy.ps1 -Check`), which runs the 7-stage integrity, locale parity, deprecation, asset size, and cross-file business data validator.

## 4. Multilingual (EN / HI / MR) & Brand Integrity
- Every key added to `data/locales/en.json` MUST be added with accurate electrical engineering terminology in `data/locales/hi.json` (Hindi) and `data/locales/mr.json` (Marathi).
- Preserve `.notranslate` attributes on curated electrical engineering sections in `index.html`.
- Corporate typography uses Indian Type Foundry (ITF) **Khand** (Headings/Display) and **Rajdhani** (Body/UI) paired with Brand Orange (`#f69024`) and Trademark Navy Blue (`#0d1392`).

