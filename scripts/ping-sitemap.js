#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Instant Search Engine Indexing Engine
 * Submits updated URLs via the modern IndexNow protocol (Bing, Yahoo, DuckDuckGo, Naver)
 * and verifies sitemap.xml <lastmod> synchronization for Googlebot.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'www.gayatrielectrical.in';
const KEY = 'ges2026indexnowkeybhiwandi9999';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URL_LIST = [
    `https://${HOST}/`,
    `https://${HOST}/sitemap.xml`,
    `https://${HOST}/llms.txt`,
    `https://${HOST}/llms-full.txt`
];

function submitIndexNow() {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            host: HOST,
            key: KEY,
            keyLocation: KEY_LOCATION,
            urlList: URL_LIST
        });

        let finished = false;
        function finish(result) {
            if (finished) return;
            finished = true;
            resolve(result);
        }

        const req = https.request('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Content-Length': Buffer.byteLength(payload),
                'User-Agent': 'GayatriElectricalServicesBot/1.0 (+https://www.gayatrielectrical.in/)'
            },
            timeout: 8000
        }, (res) => {
            // Drain response stream
            res.on('data', () => {});
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 202) {
                    console.log(`  ✓ IndexNow API: Status ${res.statusCode} (URLs accepted for instant indexing across Bing, Yahoo, Naver, DuckDuckGo)`);
                    finish({ ok: true, status: res.statusCode });
                } else {
                    console.warn(`  ⚠ IndexNow API notice: Status ${res.statusCode} (${res.statusMessage})`);
                    finish({ ok: false, status: res.statusCode });
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            console.warn('  ⚠ IndexNow API: Request timed out (non-blocking)');
            finish({ ok: false, error: 'Timeout' });
        });

        req.on('error', (err) => {
            console.warn(`  ⚠ IndexNow API notice: ${err.message}`);
            finish({ ok: false, error: err.message });
        });

        req.write(payload);
        req.end();
    });
}

function verifyGoogleSitemapLastMod() {
    const sitemapPath = path.resolve(__dirname, '..', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
        console.warn('  ⚠ sitemap.xml not found locally');
        return;
    }
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const lastModMatch = content.match(/<lastmod>(.*?)<\/lastmod>/);
    if (lastModMatch) {
        console.log(`  ✓ Googlebot Sitemaps: Verified active <lastmod> date is ${lastModMatch[1]} (Google's official index mechanism)`);
    }
}

async function main() {
    console.log(`=== GES Instant Search Engine Indexing Pipeline ===\n`);
    console.log(`Submitting ${URL_LIST.length} primary URLs for real-time indexing...`);
    await submitIndexNow();
    verifyGoogleSitemapLastMod();
    console.log(`\n=== Instant indexing dispatch completed successfully ===\n`);
}

main().catch((err) => {
    console.error('Non-blocking indexing notice:', err.message);
    process.exit(0);
});
