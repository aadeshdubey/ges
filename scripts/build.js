#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Automated Asset & Locale Bundler
 *
 * Performs:
 * 1. Synchronizes data/locales/{en,hi,mr}.json into data/translations.json
 * 2. Embeds the synchronized {en,hi,mr} locale dictionary into js/main.js
 *    (so translations work 100% instantly on file://, localhost, and production)
 * 3. Regenerates js/main.min.js from js/main.js
 * 4. Strictly preserves original line endings (CRLF / LF) and only writes to disk
 *    when meaningful content has changed, preventing false git dirty states.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function writeIfChanged(filePath, newContentNormalized) {
    let existingRaw = '';
    let eol = '\n';
    if (fs.existsSync(filePath)) {
        existingRaw = fs.readFileSync(filePath, 'utf-8');
        if (existingRaw.includes('\r\n')) {
            eol = '\r\n';
        }
        const existingNormalized = existingRaw.replace(/\r\n/g, '\n');
        if (existingNormalized === newContentNormalized) {
            return false; // Zero changes: do not touch file or alter line endings
        }
    }
    const finalContent = eol === '\r\n'
        ? newContentNormalized.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
        : newContentNormalized;
    fs.writeFileSync(filePath, finalContent, 'utf-8');
    return true;
}

function main() {
    console.log('=== GES Build & Asset Bundler ===');

    const enPath = path.join(ROOT_DIR, 'data/locales/en.json');
    const hiPath = path.join(ROOT_DIR, 'data/locales/hi.json');
    const mrPath = path.join(ROOT_DIR, 'data/locales/mr.json');

    const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const hi = JSON.parse(fs.readFileSync(hiPath, 'utf-8'));
    const mr = JSON.parse(fs.readFileSync(mrPath, 'utf-8'));

    const combined = { en, hi, mr };

    // 1. Update data/translations.json only if changed
    const translationsPath = path.join(ROOT_DIR, 'data/translations.json');
    const translationsNormalized = JSON.stringify(combined, null, 2) + '\n';
    writeIfChanged(translationsPath, translationsNormalized);
    console.log('  ✓ Synchronized data/translations.json from data/locales/{en,hi,mr}.json');

    // 2. Embed translations dictionary inside js/main.js only if changed
    const mainJsPath = path.join(ROOT_DIR, 'js/main.js');
    let mainJs = fs.readFileSync(mainJsPath, 'utf-8').replace(/\r\n/g, '\n');

    const dictRegex = /^(\s*const translations = ).*?(;\s*)$/m;
    if (!dictRegex.test(mainJs)) {
        console.error('  ✗ Could not locate `const translations = ...;` in js/main.js');
        process.exit(1);
    }

    mainJs = mainJs.replace(dictRegex, `$1${JSON.stringify(combined)};`);
    writeIfChanged(mainJsPath, mainJs);
    console.log('  ✓ Embedded en/hi/mr locale dictionaries into js/main.js');

    // 3. Regenerate js/main.min.js from js/main.js only if changed
    const minJsPath = path.join(ROOT_DIR, 'js/main.min.js');
    const minJs = mainJs
        .split('\n')
        .filter(line => !line.trim().startsWith('//'))
        .join('\n');
    writeIfChanged(minJsPath, minJs);
    console.log('  ✓ Regenerated js/main.min.js from js/main.js');

    console.log('=== Build completed successfully ===\n');
}

main();
