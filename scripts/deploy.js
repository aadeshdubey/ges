#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Branching, Build, Validation & Deployment Engine
 *
 * Supported Modes:
 *   node scripts/deploy.js --check                # Run build + 6-stage validator only
 *   node scripts/deploy.js --save [msg]           # Build, bump CalVer, validate, commit & push to 'dev' branch only
 *   node scripts/deploy.js --promote [msg]        # Build, bump CalVer, validate, commit on 'dev', merge 'dev' -> 'main', push both & ping IndexNow
 *   node scripts/deploy.js [msg]                  # Default: same as --promote (full production deployment + return to 'dev')
 *   node scripts/deploy.js --dry-run [msg]        # Build, bump & validate without committing or pushing
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

function getCurrentBranch() {
    try {
        return run('git rev-parse --abbrev-ref HEAD', { silent: true }).trim();
    } catch (e) {
        return 'main';
    }
}

function branchExistsLocally(branchName) {
    try {
        run(`git show-ref --verify --quiet refs/heads/${branchName}`, { silent: true });
        return true;
    } catch (e) {
        return false;
    }
}

function getAheadCommitCount(fromRef, toRef) {
    try {
        const count = run(`git rev-list --count ${fromRef}..${toRef}`, { silent: true }).trim();
        return parseInt(count || '0', 10);
    } catch (e) {
        return 0;
    }
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
    if (changedFiles.some(f => f === 'index.html')) {
        items.push('main landing page');
    }
    if (changedFiles.some(f => f === '404.html')) {
        items.push('404 error page');
    }
    if (changedFiles.some(f => f.startsWith('css/'))) {
        items.push('UI stylesheets');
    }
    if (changedFiles.some(f => f.startsWith('data/locales/') || f.startsWith('data/translations.json'))) {
        items.push('EN/HI/MR localization dictionaries');
    } else if (changedFiles.some(f => f.startsWith('js/'))) {
        items.push('frontend client scripts');
    }
    if (changedFiles.some(f => f === 'deploy.ps1' || f === 'deploy.bat' || f.startsWith('scripts/'))) {
        items.push('PowerShell deployment wrapper and preview workflow');
    }
    if (changedFiles.some(f => f.startsWith('.github/'))) {
        items.push('GitHub Actions CI/CD workflows');
    }
    if (changedFiles.some(f => f === 'LICENSE')) {
        items.push('proprietary license');
    }
    if (changedFiles.some(f => f.startsWith('data/schema.json') || f.startsWith('llms') || f === 'sitemap.xml')) {
        items.push('SEO & AI discovery metadata');
    }
    if (changedFiles.some(f => f === 'README.md' || f.startsWith('docs/'))) {
        items.push('repository documentation');
    }

    if (items.length === 0) {
        return 'Synchronize repository build version and production assets';
    }

    if (items.length === 1) {
        return `Update ${items[0]}`;
    }

    const last = items.pop();
    return `Update ${items.join(', ')}, and ${last}`;
}

function ensureBranchExists(branchName) {
    if (!branchExistsLocally(branchName)) {
        console.log(`  [Branch Manager] Creating '${branchName}' branch...`);
        run(`git branch ${branchName}`);
    }
}

function main() {
    const rawArgs = process.argv.slice(2);
    const isCheckOnly = rawArgs.includes('--check');
    const isSaveOnly = rawArgs.includes('--save');
    const isPromote = rawArgs.includes('--promote') || (!isCheckOnly && !isSaveOnly);
    const isDryRun = rawArgs.includes('--dry-run');
    const isNoPush = rawArgs.includes('--no-push');

    const flags = new Set(['--check', '--save', '--promote', '--dry-run', '--no-push']);
    const messageArgs = rawArgs.filter(a => !flags.has(a));
    const customSummary = messageArgs.join(' ').trim();

    console.log('\n================================================================');
    if (isCheckOnly) {
        console.log('  Gayatri Electrical Services (GES) — Build & Integrity Check');
    } else if (isSaveOnly) {
        console.log('  Gayatri Electrical Services (GES) — Save to DEV Branch');
    } else {
        console.log('  Gayatri Electrical Services (GES) — Production Promote & Deploy');
    }
    console.log('================================================================\n');

    // Mode 1: Check Only
    if (isCheckOnly) {
        console.log('>>> [Step 1/2] Bundling locales & regenerating minified assets...');
        run('node scripts/build.js');
        console.log('\n>>> [Step 2/2] Running 6-stage integrity & standards validator...');
        run('node scripts/validate.js');
        console.log('================================================================');
        console.log('  SUCCESS: All local build & validation checks passed!');
        console.log('================================================================\n');
        process.exit(0);
    }

    ensureBranchExists('dev');
    const activeBranch = getCurrentBranch();
    const statusOutput = run('git status --porcelain', { silent: true }).trim();
    const devAheadOfMain = getAheadCommitCount('main', 'dev');

    if (!statusOutput && !customSummary && !(isPromote && devAheadOfMain > 0)) {
        console.log('No uncommitted changes or unpromoted dev commits detected. Nothing to deploy.');
        process.exit(0);
    }

    const modifiedFiles = statusOutput
        .split('\n')
        .filter(Boolean)
        .map(line => line.slice(3).trim());

    // Step 1: Run asset & locale bundler (scripts/build.js)
    console.log('>>> [Step 1/5] Bundling locales & regenerating minified assets...');
    run('node scripts/build.js');

    // Step 2: Auto-bump CalVer version if there are uncommitted changes (or custom summary)
    const hasWorkingChanges = Boolean(statusOutput || customSummary);
    if (hasWorkingChanges) {
        console.log('>>> [Step 2/5] Synchronizing CalVer version across repository...');
        if (isVersionAlreadyBumped()) {
            run('node scripts/sync-version.js');
        } else {
            run('node scripts/sync-version.js --bump');
        }
    } else {
        console.log('>>> [Step 2/5] Verifying existing CalVer synchronization from dev...');
        run('node scripts/sync-version.js --check');
    }

    // Step 3: Run 6-stage repository validation suite
    console.log('>>> [Step 3/5] Running 6-stage integrity & standards validator...');
    run('node scripts/validate.js');

    const versionConfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'version.json'), 'utf-8'));
    const version = versionConfig.version;

    if (isDryRun) {
        console.log(`[DRY RUN] Target Version: v${version}. Skipping git commit and push.`);
        process.exit(0);
    }

    // Ensure commits happen cleanly on 'dev' first
    if (hasWorkingChanges) {
        if (activeBranch !== 'dev') {
            console.log(`  [Branch Guard] Switching working changes onto 'dev' branch...`);
            run('git checkout dev');
        }

        let summary = customSummary || generateAutoSummary(modifiedFiles);
        summary = summary.replace(/^GES\s+v[\d.]+\s*:\s*/i, '').trim();
        const commitMessage = `GES v${version} : ${summary}`;

        console.log(`>>> [Step 4/5] Staging changes & committing on 'dev' as:`);
        console.log(`    "${commitMessage}"\n`);

        run('git add -A');
        run(`git commit -m ${JSON.stringify(commitMessage)}`, {
            env: { GES_SKIP_PRECOMMIT_BUMP: '1' }
        });
    } else {
        console.log(`>>> [Step 4/5] Using validated commit(s) already on 'dev' (v${version})...`);
    }

    if (isNoPush) {
        console.log('\n[NO-PUSH] Commit created locally on dev.');
        process.exit(0);
    }

    // Mode 2: Save Only to 'dev'
    if (isSaveOnly) {
        console.log('\n>>> [Step 5/5] Pushing changes to origin/dev (live main site untouched)...');
        run('git push -u origin dev');
        console.log('\n================================================================');
        console.log(`  SUCCESS: Saved GES v${version} to 'dev' branch on GitHub!`);
        console.log('  Run `.\\deploy.ps1 -Promote` when ready to publish to main.');
        console.log('================================================================\n');
        process.exit(0);
    }

    // Mode 3: Promote 'dev' -> 'main' & Deploy Live
    console.log('\n>>> [Step 5/5] Promoting dev -> main, pushing to GitHub Pages & pinging search engines...');
    run('git push -u origin dev');
    run('git checkout main');
    run('git merge dev --no-edit');
    run('git push origin main');

    // Always switch workspace back to 'dev' so daily work stays isolated from live 'main'
    run('git checkout dev');

    try {
        run('node scripts/ping-sitemap.js');
    } catch (e) {
        console.warn('Notice: Search engine ping skipped or offline.');
    }

    console.log('\n================================================================');
    console.log(`  SUCCESS: Promoted & Deployed GES v${version} (dev -> main)!`);
    console.log(`  Active Local Branch: dev (in sync with main)`);
    console.log('================================================================\n');
}

main();
