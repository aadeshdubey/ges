#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — One-Command Local Build, Commit & Deploy Pipeline
 *
 * Usage:
 *   npm run deploy -- "Add new transformer service details"
 *   node scripts/deploy.js "Custom commit description"
 *   node scripts/deploy.js                             # Auto-generates descriptive summary
 *   node scripts/deploy.js --dry-run                   # Runs build, bump & validation without pushing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

function run(cmd, options = {}) {
    return execSync(cmd, {
        cwd: ROOT_DIR,
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf-8',
        env: { ...process.env, ...(options.env || {}) }
    });
}

function isVersionAlreadyBumped() {
    try {
        const headVersionRaw = run('git show HEAD:version.json', { silent: true });
        const headConfig = JSON.parse(headVersionRaw);
        const currentConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf-8'));
        return headConfig.version !== currentConfig.version;
    } catch (e) {
        return false;
    }
}

function generateAutoSummary(changedFiles) {
    const items = [];
    if (changedFiles.some(f => f.startsWith('js/') || f.startsWith('data/locales/') || f.startsWith('data/translations.json'))) {
        items.push('hybrid EN/HI/MR localization engine');
    }
    if (changedFiles.includes('LICENSE')) {
        items.push('proprietary license');
    }
    if (changedFiles.includes('404.html') || changedFiles.includes('index.html')) {
        items.push('Bhiwandi geo-coordinates and 404 brand lockup');
    }
    if (changedFiles.some(f => f.startsWith('.github/') || f.startsWith('scripts/'))) {
        items.push('automated GitHub CI/CD and deploy pipeline');
    }
    if (changedFiles.some(f => f.startsWith('data/schema.json') || f.startsWith('llms'))) {
        items.push('structured schema updates');
    }

    if (items.length === 0) {
        return 'Synchronize repository build version and production assets';
    }

    if (items.length === 1) {
        return `Update ${items[0]}`;
    }

    const last = items.pop();
    return `Implement ${items.join(', ')}, and ${last}`;
}

function main() {
    const rawArgs = process.argv.slice(2);
    const isDryRun = rawArgs.includes('--dry-run');
    const isNoPush = rawArgs.includes('--no-push');
    const messageArgs = rawArgs.filter(a => a !== '--dry-run' && a !== '--no-push');
    const customSummary = messageArgs.join(' ').trim();

    console.log('\n================================================================');
    console.log('  Gayatri Electrical Services (GES) — Automated Deploy Pipeline');
    console.log('================================================================\n');

    // Step 1: Check git status before bumping to detect meaningful changed files
    const statusOutput = run('git status --porcelain', { silent: true }).trim();
    if (!statusOutput && !customSummary) {
        console.log('No uncommitted changes detected in working tree. Nothing to deploy.');
        process.exit(0);
    }

    const modifiedFiles = statusOutput
        .split('\n')
        .filter(Boolean)
        .map(line => line.slice(3).trim());

    // Step 2: Run asset & locale bundler (scripts/build.js)
    console.log('>>> [Step 1/5] Bundling locales & regenerating minified assets...');
    run('node scripts/build.js');

    // Step 3: Auto-bump CalVer version (if not already bumped since HEAD) & synchronize all repository files
    console.log('>>> [Step 2/5] Synchronizing CalVer version across repository...');
    if (isVersionAlreadyBumped()) {
        run('node scripts/sync-version.js');
    } else {
        run('node scripts/sync-version.js --bump');
    }

    // Step 4: Run 6-stage repository validation suite
    console.log('>>> [Step 3/5] Running 6-stage integrity & standards validator...');
    run('node scripts/validate.js');

    // Read the newly bumped version from version.json
    const versionConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf-8'));
    const version = versionConfig.version;

    // Step 5: Construct commit message in exact GES style: "GES v<VERSION> : <Description>"
    let summary = customSummary || generateAutoSummary(modifiedFiles);
    // Strip leading "GES v... :" if the user already typed it
    summary = summary.replace(/^GES\s+v[\d.]+\s*:\s*/i, '').trim();
    const commitMessage = `GES v${version} : ${summary}`;

    console.log(`>>> [Step 4/5] Staging changes & committing as:`);
    console.log(`    "${commitMessage}"\n`);

    if (isDryRun) {
        console.log('[DRY RUN] Skipping git add, git commit, and git push.');
        process.exit(0);
    }

    run('git add -A');
    run(`git commit -m ${JSON.stringify(commitMessage)}`, {
        env: { GES_SKIP_PRECOMMIT_BUMP: '1' }
    });

    if (isNoPush) {
        console.log('\n[NO-PUSH] Commit created locally. Run `git push origin main` when ready.');
        process.exit(0);
    }

    // Step 6: Push to origin main & notify search engines
    console.log('\n>>> [Step 5/5] Pushing to GitHub (origin main) & pinging search engines...');
    run('git push origin main');

    try {
        run('node scripts/ping-sitemap.js');
    } catch (e) {
        console.warn('Notice: Search engine ping skipped or offline.');
    }

    console.log('\n================================================================');
    console.log(`  SUCCESS: Deployed GES v${version} to GitHub!`);
    console.log('================================================================\n');
}

main();
