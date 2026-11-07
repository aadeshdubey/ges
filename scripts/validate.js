#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Local & CI 7-Stage Repository Integrity Validator
 * Mirrors CI workflow validation directly on local workstations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('=== Gayatri Electrical Services (GES) Integrity Verification ===\n');

// 1. JavaScript Syntax Verification
console.log('[1/7] Verifying JavaScript syntax...');
const jsFiles = [
    'js/main.js',
    'js/main.min.js',
    'sw.js',
    'deploy/deploy.js',
    'deploy/preview.js',
    'scripts/build.js',
    'scripts/sync-version.js',
    'scripts/validate.js',
    'scripts/ping-sitemap.js'
];

for (const rel of jsFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    try {
        execSync(`node -c "${fullPath}"`);
        console.log(`  ✓ Syntax OK: ${rel}`);
    } catch (e) {
        console.error(`  ✗ Syntax error in ${rel}`);
        process.exit(1);
    }
}

// 2. JSON Integrity Verification
console.log('\n[2/7] Verifying JSON data, agent manifest & webmanifest files...');
const jsonFiles = [
    'package.json',
    'data/version.json',
    'data/schema.json',
    'data/translations.json',
    'data/locales/en.json',
    'data/locales/hi.json',
    'data/locales/mr.json',
    'assets/site.webmanifest',
    '.well-known/agent.json'
];

for (const rel of jsonFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    try {
        const raw = fs.readFileSync(fullPath, 'utf-8');
        JSON.parse(raw);
        console.log(`  ✓ Valid JSON: ${rel}`);
    } catch (e) {
        console.error(`  ✗ Invalid JSON in ${rel}:`, e.message);
        process.exit(1);
    }
}

// 3. Multi-Language (EN / HI / MR) Key Parity Verification
console.log('\n[3/7] Verifying multi-language (EN / HI / MR) key & card parity...');
const enLocale = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/locales/en.json'), 'utf-8'));
const hiLocale = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/locales/hi.json'), 'utf-8'));
const mrLocale = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data/locales/mr.json'), 'utf-8'));

const enKeys = Object.keys(enLocale).sort();
const hiKeys = Object.keys(hiLocale).sort();
const mrKeys = Object.keys(mrLocale).sort();

if (JSON.stringify(enKeys) !== JSON.stringify(hiKeys) || JSON.stringify(enKeys) !== JSON.stringify(mrKeys)) {
    console.error('  ✗ Locale top-level key mismatch across en.json, hi.json, mr.json!');
    process.exit(1);
}
if (
    enLocale.industries_section.cards.length !== hiLocale.industries_section.cards.length ||
    enLocale.industries_section.cards.length !== mrLocale.industries_section.cards.length
) {
    console.error('  ✗ Industry cards count mismatch across locales!');
    process.exit(1);
}
console.log(`  ✓ 100% Parity: ${enKeys.length} top-level keys, ${enLocale.industries_section.cards.length} industry cards, ${Object.keys(enLocale.service_modals || {}).length} service modals across EN/HI/MR`);

// 4. Web Standards, Governance, Root Hygiene & Required Endpoints Verification
console.log('\n[4/7] Verifying core web standards, GitHub governance & root directory hygiene...');
const requiredFiles = [
    'index.html',
    '404.html',
    'CNAME',
    'LICENSE',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
    'sw.js',
    'ges2026indexnowkeybhiwandi9999.txt',
    '.gitignore',
    '.gitattributes',
    '.well-known/security.txt',
    '.well-known/agent.json',
    'assets/humans.txt',
    'assets/opensearch.xml',
    'assets/site.webmanifest',
    'assets/gayatri-electrical.vcf',
    'data/version.json',
    'deploy/deploy.ps1',
    'deploy/deploy.bat',
    'deploy/deploy.js',
    'deploy/preview.js',
    '.github/copilot-instructions.md',
    '.github/SECURITY.md',
    '.github/CODEOWNERS',
    '.github/release.yml',
    '.github/dependabot.yml',
    '.github/PULL_REQUEST_TEMPLATE.md',
    '.github/workflows/promote.yml'
];

for (const rel of requiredFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(fullPath)) {
        console.error(`  ✗ Missing required file: ${rel}`);
        process.exit(1);
    }
    console.log(`  ✓ Found: ${rel}`);
}

// Root directory hygiene guard: ensure no stray files clutter root
const allowedRootEntries = new Set([
    '.git',
    '.github',
    '.well-known',
    'assets',
    'css',
    'data',
    'deploy',
    'docs',
    'images',
    'js',
    'scripts',
    'node_modules',
    '.gitignore',
    '.gitattributes',
    '404.html',
    'CNAME',
    'ges2026indexnowkeybhiwandi9999.txt',
    'index.html',
    'LICENSE',
    'llms-full.txt',
    'llms.txt',
    'package.json',
    'package-lock.json',
    'README.md',
    'robots.txt',
    'sitemap.xml',
    'sw.js'
]);

const rootEntries = fs.readdirSync(ROOT_DIR);
for (const entry of rootEntries) {
    if (!allowedRootEntries.has(entry)) {
        console.error(`  ✗ Root Hygiene Violation: Unexpected file or folder in root directory: '${entry}'. Move it to an appropriate folder (assets/, data/, deploy/, docs/, or scripts/).`);
        process.exit(1);
    }
}
console.log(`  ✓ Root Hygiene Verified: Only mandatory root files present (${rootEntries.length} entries)`);

// 5. Version & Date Synchronization Verification
console.log('\n[5/7] Verifying version & date synchronization across repository...');
try {
    const syncScript = path.join(ROOT_DIR, 'scripts', 'sync-version.js');
    execSync(`node "${syncScript}" --check`, { stdio: 'inherit' });
} catch (e) {
    console.error('  ✗ Synchronization check failed. Run `node scripts/sync-version.js` to fix.');
    process.exit(1);
}

// 6. Browser Deprecations, Obsolete Standards, Image Alt & Asset Link Integrity Audit
console.log('\n[6/7] Auditing browser deprecations, image alt attributes & asset links...');
const htmlFiles = ['index.html', '404.html'];

for (const rel of htmlFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    const content = fs.readFileSync(fullPath, 'utf-8');

    // Check 1: PWA Mobile-Web-App-Capable deprecation
    if (content.includes('apple-mobile-web-app-capable') && !content.includes('mobile-web-app-capable')) {
        console.error(`  ✗ Deprecation warning in ${rel}: <meta name="apple-mobile-web-app-capable"> requires <meta name="mobile-web-app-capable">`);
        process.exit(1);
    }

    // Check 2: Obsolete HTML tags
    const obsoleteTags = ['<font', '<center', '<marquee', '<blink', '<basefont', '<applet', '<frameset'];
    for (const tag of obsoleteTags) {
        if (content.toLowerCase().includes(tag)) {
            console.error(`  ✗ Obsolete HTML tag found in ${rel}: ${tag}>`);
            process.exit(1);
        }
    }

    // Check 3: Mixed content (insecure http:// in src or href, excluding xmlns and DTDs)
    const insecureRegex = /(?:src|href)=["']http:\/\/[^"']+/gi;
    const insecureMatches = content.match(insecureRegex) || [];
    if (insecureMatches.length > 0) {
        console.error(`  ✗ Insecure mixed-content URLs found in ${rel}:`, insecureMatches);
        process.exit(1);
    }

    // Check 4: Every <img> tag must have a non-empty alt attribute for SEO & Accessibility
    const imgTags = content.match(/<img\b[^>]*>/gi) || [];
    for (const imgTag of imgTags) {
        if (!/\balt=["'][^"']+["']/i.test(imgTag)) {
            console.error(`  ✗ Accessibility/SEO violation in ${rel}: <img> tag missing non-empty alt attribute: ${imgTag}`);
            process.exit(1);
        }
    }

    // Check 5: Local asset link integrity (src, data-src, href)
    const assetRegex = /(?:src|href|data-src)=["']([^"':#?]+)(?:\?[^"']*)?["']/gi;
    let match;
    let checkedAssets = 0;
    while ((match = assetRegex.exec(content)) !== null) {
        const rawUrl = match[1].trim();
        if (rawUrl.startsWith('data:') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('javascript:') || rawUrl.startsWith('#') || rawUrl.startsWith('http')) {
            continue;
        }
        const cleanedPath = rawUrl.replace(/^\.?\//, '');
        if (!cleanedPath) continue;
        const targetPath = path.join(ROOT_DIR, cleanedPath);
        if (!fs.existsSync(targetPath)) {
            console.error(`  ✗ Broken asset reference in ${rel}: ${rawUrl} (file not found: ${cleanedPath})`);
            process.exit(1);
        }
        checkedAssets++;
    }

    // Check 6: External CDN <script> and <link rel="stylesheet"> tags must enforce Subresource Integrity (SRI)
    const cdnTags = content.match(/<(?:script|link)\b[^>]+(?:src|href)=["']https:\/\/(?:cdnjs\.cloudflare\.com|unpkg\.com|cdn\.jsdelivr\.net)[^"']+["'][^>]*>/gi) || [];
    for (const cdnTag of cdnTags) {
        if (!/\bintegrity=["']sha(?:256|384|512)-[A-Za-z0-9+/=]+["']/i.test(cdnTag) || !/\bcrossorigin=["']anonymous["']/i.test(cdnTag)) {
            console.error(`  ✗ Supply-Chain Security (SRI) violation in ${rel}: External CDN tag missing integrity="sha384-..." or crossorigin="anonymous": ${cdnTag}`);
            process.exit(1);
        }
    }

    // Check 7: External <a target="_blank"> links must include rel="noopener"
    const blankLinks = content.match(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi) || [];
    for (const linkTag of blankLinks) {
        if (!/\brel=["'][^"']*noopener[^"']*["']/i.test(linkTag)) {
            console.error(`  ✗ Security/Tabnabbing violation in ${rel}: <a target="_blank"> missing rel="noopener": ${linkTag}`);
            process.exit(1);
        }
    }

    console.log(`  ✓ ${rel}: 0 deprecations, ${imgTags.length} <img> alt tags, ${cdnTags.length} SRI CDN hashes, ${blankLinks.length} target="_blank" links & ${checkedAssets} local assets verified`);
}

// 7. Cross-File Business Data Parity, Asset Size & Security Expiry Guard
console.log('\n[7/7] Verifying cross-file business data parity, image budgets & security.txt expiry...');

// 7a. Verify security.txt Expires timestamp is at least 30 days in the future
const secTxt = fs.readFileSync(path.join(ROOT_DIR, '.well-known/security.txt'), 'utf-8');
const expMatch = secTxt.match(/^Expires:\s*(.+)$/m);
if (!expMatch) {
    console.error('  ✗ Missing Expires header in .well-known/security.txt');
    process.exit(1);
}
const expDate = new Date(expMatch[1].trim());
const daysRemaining = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
if (isNaN(daysRemaining) || daysRemaining < 30) {
    console.error(`  ✗ .well-known/security.txt Expires date is too close or expired (${expMatch[1].trim()}). Run node scripts/sync-version.js.`);
    process.exit(1);
}
console.log(`  ✓ RFC 9116 Security Policy valid (${daysRemaining} days until expiration)`);

// 7b. Verify corporate contact, domain & geo-coordinate parity across core files
const parityFiles = [
    'index.html',
    'data/schema.json',
    'llms.txt',
    'llms-full.txt',
    '.well-known/agent.json',
    'assets/gayatri-electrical.vcf'
];
    const requiredTokens = [
        { label: 'Primary Hotline (86938 93333)', regex: /86938[\s-]*93333/ },
        { label: 'Secondary Hotline (83905 97000)', regex: /83905[\s-]*97000/ },
        { label: 'Technical Hotline (98227 89699)', regex: /98227[\s-]*89699/ },
        { label: 'Official Email', regex: /support@gayatrielectrical\.in/ },
        { label: 'Canonical Domain', regex: /www\.gayatrielectrical\.in/ },
        { label: 'Bhiwandi Latitude (19.287777)', regex: /19\.287777/ },
        { label: 'Bhiwandi Longitude (73.084288)', regex: /73\.084288/ }
    ];

for (const file of parityFiles) {
    const text = fs.readFileSync(path.join(ROOT_DIR, file), 'utf-8');
    for (const token of requiredTokens) {
        if (!token.regex.test(text)) {
            console.error(`  ✗ Cross-file parity mismatch in ${file}: Missing ${token.label}`);
            process.exit(1);
        }
    }
}
console.log(`  ✓ 100% Business Entity Parity (All 3 Hotlines, Email, Domain, Bhiwandi Geo-Coordinates) across ${parityFiles.length} discovery files`);

// 7c. Verify image file size budget (< 1.5 MB per image)
const MAX_IMAGE_BYTES = 1536 * 1024;
function walkFiles(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) results = results.concat(walkFiles(full));
        else results.push(full);
    }
    return results;
}
const mediaFiles = [...walkFiles(path.join(ROOT_DIR, 'images')), ...walkFiles(path.join(ROOT_DIR, 'assets'))];
for (const file of mediaFiles) {
    const stat = fs.statSync(file);
    if (stat.size > MAX_IMAGE_BYTES) {
        const rel = path.relative(ROOT_DIR, file);
        console.error(`  ✗ Asset size budget exceeded: ${rel} is ${Math.round(stat.size / 1024)} KB (max 1536 KB)`);
        process.exit(1);
    }
}
console.log(`  ✓ Asset Size Guard: All ${mediaFiles.length} media/font files are within the 1.5 MB performance budget`);

// 7d. Verify Production JavaScript Cleanliness (No stray debugger statements)
for (const jsRel of ['js/main.js', 'js/main.min.js']) {
    const jsContent = fs.readFileSync(path.join(ROOT_DIR, jsRel), 'utf-8');
    if (/\bdebugger\s*;/.test(jsContent)) {
        console.error(`  ✗ Production JS hygiene violation in ${jsRel}: Stray 'debugger;' statement detected`);
        process.exit(1);
    }
}
console.log('  ✓ Production JS Hygiene: 0 stray debugger statements in js/main.js & js/main.min.js');

console.log('\n=== All 7 verification stages passed successfully! ===\n');
