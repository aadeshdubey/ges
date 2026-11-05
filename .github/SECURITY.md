# Security Policy — Gayatri Electrical Services (GES)

## Supported Versions

Gayatri Electrical Services maintains a continuous CalVer (`YY.MM.DD.BUILD`) release model. Only the latest production release on the `main` branch is actively supported with security updates.

| Version | Supported |
| :--- | :--- |
| Latest (`main` / `v26.x`) | :white_check_mark: Active |
| Older CalVer tags | :x: Superseded |

## Automated Security Controls

This repository enforces multiple layers of continuous security verification:
1. **GitHub CodeQL Static Analysis** (`.github/workflows/codeql.yml`) — Scans JavaScript/TypeScript on every push, pull request, and weekly schedule.
2. **Dependabot Security & Version Updates** (`.github/dependabot.yml`) — Monitors npm packages and GitHub Actions workflows weekly.
3. **Standards & Mixed-Content Guard** (`scripts/validate.js`) — Blocks insecure `http://` asset links, obsolete HTML tags, and browser deprecations before commit and in CI.

## Reporting a Vulnerability

If you discover a security issue within this repository, please report it privately using GitHub's native **Security Advisories ("Report a vulnerability")** feature under the repository's **Security** tab rather than opening a public issue.
