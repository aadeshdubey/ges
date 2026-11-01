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
    'scripts/validate.js'
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
    'version.json'
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
console.log('\n[4/4] Verifying version & date synchronization across repository...');
try {
    const syncScript = path.join(ROOT_DIR, 'scripts', 'sync-version.js');
    execSync(`node "${syncScript}" --check`, { stdio: 'inherit' });
} catch (e) {
    console.error('  ✗ Synchronization check failed. Run `node scripts/sync-version.js` to fix.');
    process.exit(1);
}

console.log('\n=== All 4 verification stages passed successfully! ===\n');
