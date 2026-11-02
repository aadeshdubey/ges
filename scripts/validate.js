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
console.log('[1/4] Verifying JavaScript syntax...');
const jsFiles = [
    'js/main.js',
    'js/main.min.js',
    'sw.js',
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
console.log('\n[2/4] Verifying JSON data & manifest files...');
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

// 3. Web Standards & Required Endpoints Verification
console.log('\n[3/4] Verifying core web standards & root files...');
const requiredFiles = [
    'index.html',
    '404.html',
    'CNAME',
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
    '.gitignore'
];

for (const rel of requiredFiles) {
    const fullPath = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(fullPath)) {
        console.error(`  ✗ Missing required file: ${rel}`);
        process.exit(1);
    }
    console.log(`  ✓ Found: ${rel}`);
}

// 4. Version & Date Synchronization Verification
console.log('\n[4/5] Verifying version & date synchronization across repository...');
try {
    const syncScript = path.join(ROOT_DIR, 'scripts', 'sync-version.js');
    execSync(`node "${syncScript}" --check`, { stdio: 'inherit' });
} catch (e) {
    console.error('  ✗ Synchronization check failed. Run `node scripts/sync-version.js` to fix.');
    process.exit(1);
}

// 5. Browser Deprecations, Obsolete Standards & Asset Link Integrity Audit
console.log('\n[5/5] Auditing browser deprecations, web standards & asset links...');
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

console.log('\n=== All 5 verification stages passed successfully! ===\n');
