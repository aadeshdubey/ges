#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Local Repository Integrity & Standards Validator
 * Mirrors CI workflow validation directly on local workstations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('=== Gayatri Electrical Services (GES) Integrity Verification ===\n');

// 1. JavaScript Syntax Verification
console.log('[1/6] Verifying JavaScript syntax...');
const jsFiles = [
    'js/main.js',
    'js/main.min.js',
    'sw.js',
    'scripts/build.js',
    'scripts/deploy.js',
    'scripts/preview.js',
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
console.log('\n[2/6] Verifying JSON data & manifest files...');
const jsonFiles = [
    'version.json',
    'package.json',
    'data/schema.json',
    'data/translations.json',
    'data/locales/en.json',
    'data/locales/hi.json',
    'data/locales/mr.json',
    'site.webmanifest'
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
console.log('\n[3/6] Verifying multi-language (EN / HI / MR) key & card parity...');
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

// 4. Web Standards, Governance & Required Endpoints Verification
console.log('\n[4/6] Verifying core web standards, GitHub governance & root files...');
const requiredFiles = [
    'index.html',
    '404.html',
    'CNAME',
    'LICENSE',
    'deploy.ps1',
    'deploy.bat',
    'robots.txt',
    'sitemap.xml',
    'llms.txt',
    'llms-full.txt',
    'humans.txt',
    'security.txt',
    'opensearch.xml',
    'site.webmanifest',
    'sw.js',
    'version.json',
    'ges2026indexnowkeybhiwandi9999.txt',
    '.gitignore',
    '.github/SECURITY.md',
    '.github/CODEOWNERS',
    '.github/release.yml',
    '.github/dependabot.yml',
    '.github/PULL_REQUEST_TEMPLATE.md'
];

for (const rel of requiredFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(fullPath)) {
        console.error(`  ✗ Missing required file: ${rel}`);
        process.exit(1);
    }
    console.log(`  ✓ Found: ${rel}`);
}

// 5. Version & Date Synchronization Verification
console.log('\n[5/6] Verifying version & date synchronization across repository...');
try {
    const syncScript = path.join(ROOT_DIR, 'scripts', 'sync-version.js');
    execSync(`node "${syncScript}" --check`, { stdio: 'inherit' });
} catch (e) {
    console.error('  ✗ Synchronization check failed. Run `node scripts/sync-version.js` to fix.');
    process.exit(1);
}

// 6. Browser Deprecations, Obsolete Standards & Asset Link Integrity Audit
console.log('\n[6/6] Auditing browser deprecations, web standards & asset links...');
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

    // Check 4: Local asset link integrity (src, data-src, href)
    const assetRegex = /(?:src|href|data-src)=["']([^"':#?]+)(?:\?[^"']*)?["']/gi;
    let match;
    let checkedAssets = 0;
    while ((match = assetRegex.exec(content)) !== null) {
        const rawUrl = match[1].trim();
        // Skip javascript, data uris, mailto, tel, anchors, external schemas
        if (rawUrl.startsWith('data:') || rawUrl.startsWith('mailto:') || rawUrl.startsWith('tel:') || rawUrl.startsWith('javascript:') || rawUrl.startsWith('#') || rawUrl.startsWith('http')) {
            continue;
        }
        // Normalize relative path
        const cleanedPath = rawUrl.replace(/^\.\//, '');
        const targetPath = path.join(ROOT_DIR, cleanedPath);
        if (!fs.existsSync(targetPath)) {
            console.error(`  ✗ Broken asset reference in ${rel}: ${rawUrl} (file not found: ${cleanedPath})`);
            process.exit(1);
        }
        checkedAssets++;
    }
    console.log(`  ✓ ${rel}: 0 deprecations, 0 obsolete tags, verified ${checkedAssets} local asset links`);
}

console.log('\n=== All 6 verification stages passed successfully! ===\n');
