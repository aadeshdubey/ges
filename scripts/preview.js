#!/usr/bin/env node
/**
 * Gayatri Electrical Services (GES) — Local Live-Mode Preview Server & Wi-Fi QR Generator
 *
 * Features:
 *   - Runs build & 6-stage validation before launching
 *   - Automatically detects & frees stale listeners on Port 8080 (or falls back cleanly)
 *   - Serves index.html, 404.html, root-relative assets (/assets/*), and Service Worker identically to GitHub Pages
 *   - Generates a zero-dependency ISO/IEC 18004 QR Code (Version 2-L) directly in the terminal for instant mobile Wi-Fi scanning
 *   - Gracefully closes all active TCP sockets and releases the port immediately on Enter or Ctrl+C
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_PORT = parseInt(process.env.PORT || '8080', 10);

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

// ============================================================================
// Minimal Pure-JS QR Code Generator (Version 1-3, Byte Mode, ECC Level L)
// Renders scannable Unicode half-block QR codes in Windows PowerShell / CMD
// ============================================================================
const QR_VERSIONS = [
    null,
    { version: 1, size: 21, dataBytes: 19, ecBytes: 7, align: [] },
    { version: 2, size: 25, dataBytes: 34, ecBytes: 10, align: [6, 18] },
    { version: 3, size: 29, dataBytes: 55, ecBytes: 15, align: [6, 22] }
];

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGaloisField() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
        const next = new Array(poly.length + 1).fill(0);
        const root = GF_EXP[i];
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], root);
        }
        poly = next;
    }
    return poly;
}

function rsEncode(data, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const msg = new Uint8Array(data.length + ecLen);
    msg.set(data, 0);
    for (let i = 0; i < data.length; i++) {
        const coef = msg[i];
        if (coef !== 0) {
            for (let j = 0; j < gen.length; j++) {
                msg[i + j] ^= gfMul(gen[j], coef);
            }
        }
    }
    return msg.slice(data.length);
}

function buildQrMatrix(text) {
    const payload = Buffer.from(text, 'utf-8');
    let spec = QR_VERSIONS[2];
    for (let v = 1; v <= 3; v++) {
        if (payload.length + 2 <= QR_VERSIONS[v].dataBytes) {
            spec = QR_VERSIONS[v];
            break;
        }
    }

    const size = spec.size;
    const modules = Array.from({ length: size }, () => new Array(size).fill(null));
    const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));

    function setFunctionModule(r, c, dark) {
        if (r >= 0 && r < size && c >= 0 && c < size) {
            modules[r][c] = Boolean(dark);
            isFunction[r][c] = true;
        }
    }

    function drawFinder(row, col) {
        for (let dy = -1; dy <= 7; dy++) {
            for (let dx = -1; dx <= 7; dx++) {
                const r = row + dy;
                const c = col + dx;
                if (r < 0 || r >= size || c < 0 || c >= size) continue;
                const inOuter = (dy >= 0 && dy <= 6 && (dx === 0 || dx === 6)) || (dx >= 0 && dx <= 6 && (dy === 0 || dy === 6));
                const inInner = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
                setFunctionModule(r, c, inOuter || inInner);
            }
        }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        setFunctionModule(6, i, i % 2 === 0);
        setFunctionModule(i, 6, i % 2 === 0);
    }

    // Alignment pattern (Version >= 2)
    if (spec.align.length > 0) {
        const ar = spec.align[1];
        const ac = spec.align[1];
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const dark = Math.max(Math.abs(dy), Math.abs(dx)) !== 1;
                setFunctionModule(ar + dy, ac + dx, dark);
            }
        }
    }

    // Dark module
    setFunctionModule(size - 8, 8, true);

    // Reserve format info areas
    for (let i = 0; i < 9; i++) {
        if (!isFunction[8][i]) setFunctionModule(8, i, false);
        if (!isFunction[i][8]) setFunctionModule(i, 8, false);
    }
    for (let i = 0; i < 8; i++) {
        if (!isFunction[8][size - 1 - i]) setFunctionModule(8, size - 1 - i, false);
        if (!isFunction[size - 1 - i][8]) setFunctionModule(size - 1 - i, 8, false);
    }

    // Encode byte stream
    const bits = [];
    function pushBits(val, len) {
        for (let i = len - 1; i >= 0; i--) {
            bits.push((val >>> i) & 1);
        }
    }

    pushBits(0b0100, 4); // Byte mode
    pushBits(payload.length, 8);
    for (const b of payload) pushBits(b, 8);
    pushBits(0, Math.min(4, spec.dataBytes * 8 - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);

    const dataCodewords = new Uint8Array(spec.dataBytes);
    for (let i = 0; i < bits.length / 8; i++) {
        let byte = 0;
        for (let b = 0; b < 8; b++) byte = (byte << 1) | bits[i * 8 + b];
        dataCodewords[i] = byte;
    }
    const padBytes = [0xec, 0x11];
    for (let i = bits.length / 8, p = 0; i < spec.dataBytes; i++, p++) {
        dataCodewords[i] = padBytes[p % 2];
    }

    const ecCodewords = rsEncode(dataCodewords, spec.ecBytes);
    const allCodewords = new Uint8Array(spec.dataBytes + spec.ecBytes);
    allCodewords.set(dataCodewords, 0);
    allCodewords.set(ecCodewords, spec.dataBytes);

    const allBits = [];
    for (const cw of allCodewords) {
        for (let b = 7; b >= 0; b--) allBits.push((cw >>> b) & 1);
    }

    // Place data bits in upward/downward 2-column zigzag
    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
            const r = upward ? size - 1 - vert : vert;
            for (let j = 0; j < 2; j++) {
                const c = right - j;
                if (!isFunction[r][c]) {
                    const dark = bitIdx < allBits.length ? Boolean(allBits[bitIdx++]) : false;
                    // Apply Mask 0: (r + c) % 2 === 0
                    modules[r][c] = (r + c) % 2 === 0 ? !dark : dark;
                }
            }
        }
        upward = !upward;
    }

    // Write Format Information for Level L (01) + Mask 0 (000) -> 0x77c4
    const formatBits = 0x77c4;
    function getFormatBit(i) {
        return ((formatBits >>> i) & 1) === 1;
    }

    for (let i = 0; i <= 5; i++) modules[8][i] = getFormatBit(i);
    modules[8][7] = getFormatBit(6);
    modules[8][8] = getFormatBit(7);
    modules[7][8] = getFormatBit(8);
    for (let i = 9; i < 15; i++) modules[14 - i][8] = getFormatBit(i);

    for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = getFormatBit(i);
    for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = getFormatBit(i);
    modules[size - 8][8] = true;

    return modules;
}

function renderQrCodeToTerminal(url) {
    try {
        const matrix = buildQrMatrix(url);
        const size = matrix.length;
        const quiet = 2;
        const total = size + quiet * 2;

        const isDark = (r, c) => {
            const mr = r - quiet;
            const mc = c - quiet;
            if (mr < 0 || mr >= size || mc < 0 || mc >= size) return false;
            return matrix[mr][mc];
        };

        const lines = [];
        for (let r = 0; r < total; r += 2) {
            let line = '    ';
            for (let c = 0; c < total; c++) {
                const top = isDark(r, c);
                const bottom = r + 1 < total ? isDark(r + 1, c) : false;
                // Light background around dark modules for universal phone camera recognition
                if (top && bottom) line += ' ';
                else if (top && !bottom) line += '▄';
                else if (!top && bottom) line += '▀';
                else line += '█';
            }
            lines.push(line);
        }
        return lines.join('\n');
    } catch (e) {
        return '    [QR Code Unavailable]';
    }
}

function getLocalWifiIp() {
    const interfaces = os.networkInterfaces();
    const candidates = [];
    for (const [name, addrs] of Object.entries(interfaces)) {
        for (const addr of addrs || []) {
            if (addr.family === 'IPv4' && !addr.internal) {
                const lower = name.toLowerCase();
                const isVirtual = lower.includes('vethernet') || lower.includes('wsl') || lower.includes('virtual') || lower.includes('vmware') || lower.includes('vbox');
                candidates.push({ ip: addr.address, isWifi: lower.includes('wi-fi') || lower.includes('wlan'), isVirtual });
            }
        }
    }
    candidates.sort((a, b) => (b.isWifi - a.isWifi) || (a.isVirtual - b.isVirtual));
    return candidates.length > 0 ? candidates[0].ip : '127.0.0.1';
}

function freePortIfNeeded(port) {
    if (process.platform !== 'win32') return;
    try {
        const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
        const lines = out.split(/\r?\n/).filter(l => l.includes('LISTENING'));
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && /^\d+$/.test(pid) && Number(pid) !== process.pid) {
                console.log(`  [Port Guard] Freeing stale process (PID ${pid}) on port ${port}...`);
                execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            }
        }
    } catch (e) {
        // Port is already free
    }
}

function main() {
    const isSmokeTest = process.argv.includes('--smoke-test');

    console.log('\n================================================================');
    console.log('  Gayatri Electrical Services (GES) — Local Live-Mode Preview');
    console.log('================================================================\n');

    console.log('>>> [1/3] Bundling locales & regenerating minified assets...');
    execSync('node scripts/build.js', { cwd: ROOT_DIR, stdio: 'inherit' });

    console.log('\n>>> [2/3] Running 6-stage integrity & standards validator...');
    execSync('node scripts/validate.js', { cwd: ROOT_DIR, stdio: 'inherit' });

    console.log(`>>> [3/3] Preparing local HTTP server on port ${DEFAULT_PORT}...`);
    freePortIfNeeded(DEFAULT_PORT);

    const sockets = new Set();

    const server = http.createServer((req, res) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        let pathname = decodeURIComponent(parsedUrl.pathname);
        if (pathname === '/') pathname = '/index.html';

        const safeRelPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
        const filePath = path.join(ROOT_DIR, safeRelPath);

        if (!filePath.startsWith(ROOT_DIR)) {
            res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('403 Forbidden');
            return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            });
            fs.createReadStream(filePath).pipe(res);
        } else {
            // Serve custom 404.html just like GitHub Pages
            const notFoundPath = path.join(ROOT_DIR, '404.html');
            res.writeHead(404, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store'
            });
            if (fs.existsSync(notFoundPath)) {
                fs.createReadStream(notFoundPath).pipe(res);
            } else {
                res.end('404 Not Found');
            }
        }
    });

    server.on('connection', socket => {
        sockets.add(socket);
        socket.on('close', () => sockets.delete(socket));
    });

    let shuttingDown = false;
    function gracefulShutdown(reason) {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`\n\n>>> Shutting down preview server (${reason})...`);
        for (const socket of sockets) {
            try {
                socket.destroy();
            } catch (e) {}
        }
        server.close(() => {
            console.log(`  ✓ Port ${DEFAULT_PORT} closed and released cleanly.`);
            console.log('================================================================\n');
            process.exit(0);
        });
        setTimeout(() => process.exit(0), 500).unref();
    }

    server.listen(DEFAULT_PORT, '0.0.0.0', () => {
        const wifiIp = getLocalWifiIp();
        const localUrl = `http://localhost:${DEFAULT_PORT}`;
        const mobileUrl = `http://${wifiIp}:${DEFAULT_PORT}`;

        console.log('\n================================================================');
        console.log('  LIVE PREVIEW SERVER IS RUNNING (GitHub Pages Emulation Mode)');
        console.log('================================================================');
        console.log(`  • Laptop URL      : ${localUrl}`);
        console.log(`  • 404 Page Test   : ${localUrl}/404.html`);
        console.log(`  • Mobile Wi-Fi URL: ${mobileUrl}`);
        console.log('\n  Scan this QR code with your phone camera (on the same Wi-Fi):');
        console.log('');
        console.log(renderQrCodeToTerminal(mobileUrl));
        console.log('');
        console.log('  [Tip] If your phone cannot reach the Wi-Fi URL, ensure your');
        console.log('        Windows Wi-Fi profile is set to "Private network" or');
        console.log('        allow Node.js when Windows Firewall prompts.');
        console.log('================================================================');

        if (isSmokeTest) {
            gracefulShutdown('smoke test complete');
            return;
        }

        // Open default browser on Windows automatically
        if (process.platform === 'win32' && !process.env.GES_NO_BROWSER) {
            exec(`start "" "${localUrl}"`);
        }

        console.log('\n>>> Press [ENTER] or [Ctrl+C] at any time to stop the server and free port ' + DEFAULT_PORT + '...');

        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        process.stdin.resume();
        process.stdin.once('data', () => gracefulShutdown('user pressed Enter'));
    });

    process.on('SIGINT', () => gracefulShutdown('received SIGINT / Ctrl+C'));
    process.on('SIGTERM', () => gracefulShutdown('received SIGTERM'));
}

main();
