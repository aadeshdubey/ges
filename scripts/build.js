#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Automated Asset & Locale Bundler
 *
 * Performs:
 * 1. Synchronizes data/locales/{en,hi,mr}.json into data/translations.json
 * 2. Embeds the synchronized {en,hi,mr} locale dictionary into js/main.js
 *    (so translations work 100% instantly on file://, localhost, and production)
 * 3. Regenerates js/main.min.js from js/main.js
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function main() {
    console.log('=== GES Build & Asset Bundler ===');

    const enPath = path.join(ROOT_DIR, 'data/locales/en.json');
    const hiPath = path.join(ROOT_DIR, 'data/locales/hi.json');
    const mrPath = path.join(ROOT_DIR, 'data/locales/mr.json');

    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf-8'));
    const mr = JSON.parse(fs.readFileSync(mrPath, 'utf-8'));

    const combined = { en, hi, mr };

    // 1. Update data/translations.json
    const translationsPath = path.join(ROOT_DIR, 'data/translations.json');
    fs.writeFileSync(translationsPath, JSON.stringify(combined, null, 2) + '\n', 'utf-8');
    console.log('  ✓ Synchronized data/translations.json from data/locales/{en,hi,mr}.json');

    // 2. Embed translations dictionary inside js/main.js
    const mainJsPath = path.join(ROOT_DIR, 'js/main.js');
    let mainJs = fs.readFileSync(mainJsPath, 'utf-8').replace(/\r\n/g, '\n');

    const dictRegex = /^(\s*const translations = ).*?(;\s*)$/m;
    if (!dictRegex.test(mainJs)) {
        console.error('  ✗ Could not locate `const translations = ...;` in js/main.js');
        process.exit(1);
    }

    mainJs = mainJs.replace(dictRegex, `$1${JSON.stringify(combined)};`);
    fs.writeFileSync(mainJsPath, mainJs, 'utf-8');
    console.log('  ✓ Embedded en/hi/mr locale dictionaries into js/main.js');

    // 3. Regenerate js/main.min.js from js/main.js
    const minJsPath = path.join(ROOT_DIR, 'js/main.min.js');
    const minJs = mainJs
        .split('\n')
        .filter(line => !line.trim().startsWith('//'))
        .join('\n');
    fs.writeFileSync(minJsPath, minJs, 'utf-8');
    console.log('  ✓ Regenerated js/main.min.js from js/main.js');

    console.log('=== Build completed successfully ===\n');
}

main();

