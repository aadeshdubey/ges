#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Automated Version & Date Synchronization Engine
 * Single Source of Truth: version.json
 *
 * Usage:
 *   node scripts/sync-version.js                # Syncs all files to match version.json
 *   node scripts/sync-version.js --bump         # Auto-detects date + bumps daily build number
 *   node scripts/sync-version.js --check        # Verifies all files are in sync (CI check)
 *   node scripts/sync-version.js --set-version 26.11.01.1 --set-date 2026-11-01
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(ROOT_DIR, 'version.json');

function getTodayIso() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(isoDate) {
    const parts = isoDate.split('-').map(Number);
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        check: false,
        bump: false,
        setVersion: null,
        setDate: null
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--check') {
            options.check = true;
        } else if (args[i] === '--bump') {
            options.bump = true;
        } else if (args[i] === '--set-version' && i + 1 < args.length) {
            options.setVersion = args[++i].replace(/^v/, '');
        } else if (args[i] === '--set-date' && i + 1 < args.length) {
            options.setDate = args[++i];
        } else if (args[i] === '--help' || args[i] === '-h') {
            console.log(`
GES Version & Date Synchronization Utility
------------------------------------------
Usage:
  node scripts/sync-version.js
      Syncs all repository files to match version.json.

  node scripts/sync-version.js --bump
      Auto-detects current date and increments build number (e.g. 26.11.01.1 -> 26.11.01.2).
      Resets build to 1 if the day has changed.

  node scripts/sync-version.js --check
      Checks if all repository files are synchronized with version.json (exits 1 if out of sync).

  node scripts/sync-version.js --set-version <v> --set-date <YYYY-MM-DD>
      Updates version.json with specific version and date, then syncs all repository files.
`);
            process.exit(0);
        }
    }
    return options;
}

function loadVersionConfig() {
    if (!fs.existsSync(VERSION_FILE)) {
        console.error('Error: version.json not found at ' + VERSION_FILE);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
}

function saveVersionConfig(config) {
    fs.writeFileSync(VERSION_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

function autoBump(config) {
    const today = getTodayIso();
    const [year, month, day] = today.split('-');
    const yy = year.slice(-2);
    const datePrefix = `${yy}.${month}.${day}`;

    if (config.releaseDate === today) {
        // Same day: increment build number
        config.build = (config.build || 0) + 1;
    } else {
        // New day: update date and reset build count to 1
        config.releaseDate = today;
        config.build = 1;
    }

    config.version = `${datePrefix}.${config.build}`;
    config.versionBadge = `v${config.version}`;
    config.cacheBuster = `v=${config.version}`;
    config.serviceWorkerCacheName = `ges-cache-v${config.version}`;
    config.formattedDate = formatDate(config.releaseDate);
    config.lastUpdated = config.releaseDate;

    return config;
}

function getSyncRules(config) {
    const ver = config.version;
    const badge = config.versionBadge || `v${ver}`;
    const date = config.releaseDate;
    const formattedDate = config.formattedDate || formatDate(date);
    const cacheBuster = config.cacheBuster || `v=${ver}`;
    const swCacheName = config.serviceWorkerCacheName || `ges-cache-v${ver}`;

    return [
        {
            file: 'sitemap.xml',
            description: 'Sitemap <lastmod> dates',
            replace: [
                {
                    from: /<lastmod>.*?<\/lastmod>/g,
                    to: `<lastmod>${date}</lastmod>`
                }
            ]
        },
        {
            file: 'index.html',
            description: 'HTML metadata dates and asset cache busters',
            replace: [
                {
                    from: /<meta name="DC\.date" content=".*?">/g,
                    to: `<meta name="DC.date" content="${date}">`
                },
                {
                    from: /<meta name="DC\.date\.modified" content=".*?">/g,
                    to: `<meta name="DC.date.modified" content="${date}">`
                },
                {
                    from: /<meta name="revised" content=".*?">/g,
                    to: `<meta name="revised" content="${formattedDate}">`
                },
                {
                    from: /href="css\/style\.min\.css\?v=[^"]*"/g,
                    to: `href="css/style.min.css?${cacheBuster}"`
                },
                {
                    from: /src="js\/main\.min\.js\?v=[^"]*"/g,
                    to: `src="js/main.min.js?${cacheBuster}"`
                }
            ]
        },
        {
            file: 'data/schema.json',
            description: 'JSON-LD Schema dateModified fields',
            replace: [
                {
                    from: /"dateModified":\s*"[^"]*"/g,
                    to: `"dateModified": "${date}"`
                }
            ]
        },
        {
            file: 'llms.txt',
            description: 'llms.txt header date and version badge',
            replace: [
                {
                    from: /> Last Updated & Verified: .*? \| Knowledge Profile Version: .*$/m,
                    to: `> Last Updated & Verified: ${date} | Knowledge Profile Version: ${badge}`
                }
            ]
        },
        {
            file: 'llms-full.txt',
            description: 'llms-full.txt header date and technical version badge',
            replace: [
                {
                    from: /> Last Updated & Verified: .*? \| Technical Specification Version: .*$/m,
                    to: `> Last Updated & Verified: ${date} | Technical Specification Version: ${badge}`
                }
            ]
        },
        {
            file: 'docs/CANVA_BRAND_GUIDE.md',
            description: 'Canva Brand Guide header date and version',
            replace: [
                {
                    from: /> Last Updated: .*? \| Guide Version: .*$/m,
                    to: `> Last Updated: ${date} | Guide Version: ${badge}`
                }
            ]
        },
        {
            file: 'css/style.css',
            description: 'CSS header comment version and date',
            replace: [
                {
                    from: /\* Version: .*? \| Release Date: .*$/m,
                    to: `* Version: ${ver} | Release Date: ${date}`
                }
            ]
        },
        {
            file: 'css/style.min.css',
            description: 'Minified CSS header comment version and date',
            replace: [
                {
                    from: /\/\* GES Corporate Stylesheet v.*? \(.*?\) \*\//,
                    to: `/* GES Corporate Stylesheet v${ver} (${date}) */`
                }
            ]
        },
        {
            file: 'js/main.js',
            description: 'JavaScript header comment version and date',
            replace: [
                {
                    from: /\* Version: .*? \| Release Date: .*$/m,
                    to: `* Version: ${ver} | Release Date: ${date}`
                }
            ]
        },
        {
            file: 'js/main.min.js',
            description: 'Minified JavaScript header comment version and date',
            replace: [
                {
                    from: /\* Version: .*? \| Release Date: .*$/m,
                    to: `* Version: ${ver} | Release Date: ${date}`
                }
            ]
        },
        {
            file: 'sw.js',
            description: 'Service Worker cache name and asset cache busters',
            replace: [
                {
                    from: /\* Version: .*? \| Offline Resilience Engine/m,
                    to: `* Version: ${ver} | Offline Resilience Engine`
                },
                {
                    from: /const CACHE_NAME = 'ges-cache-v.*?';/,
                    to: `const CACHE_NAME = '${swCacheName}';`
                },
                {
                    from: /'css\/style\.min\.css\?v=.*?',/,
                    to: `'css/style.min.css?${cacheBuster}',`
                },
                {
                    from: /'js\/main\.min\.js\?v=.*?',/,
                    to: `'js/main.min.js?${cacheBuster}',`
                }
            ]
        },
        {
            file: 'README.md',
            description: 'README Version badge',
            replace: [
                {
                    from: /img\.shields\.io\/badge\/Version-v.*?-0d1392/,
                    to: `img.shields.io/badge/Version-${badge}-0d1392`
                },
                {
                    from: /alt="Version v.*?"/,
                    to: `alt="Version ${badge}"`
                }
            ]
        },
        {
            file: 'humans.txt',
            description: 'humans.txt Last Updated date',
            replace: [
                {
                    from: /Last Updated: .*$/m,
                    to: `Last Updated: ${date}`
                }
            ]
        },
        {
            file: 'package.json',
            description: 'package.json version field',
            replace: [
                {
                    from: /"version":\s*"[^"]*"/,
                    to: `"version": "${ver}"`
                }
            ]
        }
    ];
}

function main() {
    const options = parseArgs();
    let config = loadVersionConfig();

    let configUpdated = false;

    if (options.bump) {
        config = autoBump(config);
        configUpdated = true;
    }

    if (options.setVersion) {
        config.version = options.setVersion;
        config.versionBadge = `v${options.setVersion}`;
        config.cacheBuster = `v=${options.setVersion}`;
        config.serviceWorkerCacheName = `ges-cache-v${options.setVersion}`;
        configUpdated = true;
    }
    if (options.setDate) {
        config.releaseDate = options.setDate;
        config.formattedDate = formatDate(options.setDate);
        config.lastUpdated = options.setDate;
        configUpdated = true;
    }

    if (configUpdated && !options.check) {
        saveVersionConfig(config);
        console.log(`[OK] Updated version.json: version=${config.version}, date=${config.releaseDate}`);
    }

    const rules = getSyncRules(config);
    let outOfSyncCount = 0;
    let updatedFilesCount = 0;

    console.log(`\nGES Synchronization Engine — Target: Version ${config.version} | Date ${config.releaseDate}`);
    console.log(`--------------------------------------------------------------------------------`);

    for (const rule of rules) {
        const filePath = path.join(ROOT_DIR, rule.file);
        if (!fs.existsSync(filePath)) {
            console.warn(`[WARN] File not found: ${rule.file}`);
            continue;
        }

        const originalContent = fs.readFileSync(filePath, 'utf-8');
        let newContent = originalContent;

        for (const r of rule.replace) {
            newContent = newContent.replace(r.from, r.to);
        }

        if (originalContent !== newContent) {
            if (options.check) {
                console.error(`[OUT OF SYNC] ${rule.file} (${rule.description})`);
                outOfSyncCount++;
            } else {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log(`[SYNCED] ${rule.file} -> ${rule.description}`);
                updatedFilesCount++;
            }
        } else {
            console.log(`[CURRENT] ${rule.file}`);
        }
    }

    console.log(`--------------------------------------------------------------------------------`);
    if (options.check) {
        if (outOfSyncCount > 0) {
            console.error(`[FAIL] ${outOfSyncCount} file(s) are out of sync with version.json.`);
            console.error(`Run 'node scripts/sync-version.js' to bring them into sync.`);
            process.exit(1);
        } else {
            console.log(`[PASS] All repository files are fully synchronized with version.json.`);
        }
    } else {
        console.log(`[DONE] Synchronization complete. ${updatedFilesCount} file(s) updated.\n`);
    }
}

main();
