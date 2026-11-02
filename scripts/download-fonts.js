const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.resolve(__dirname, '..', 'assets', 'fonts');
if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function fetch(url, headers = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetch(res.headers.location, headers));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
            }
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

async function main() {
    const rawCss = fs.readFileSync(path.join(FONTS_DIR, 'google-fonts.css'), 'utf-8');
    
    // Parse @font-face blocks
    const fontFaceRegex = /(@font-face\s*\{[\s\S]*?\})/g;
    const blocks = rawCss.match(fontFaceRegex) || [];

    console.log(`Found ${blocks.length} @font-face blocks.`);

    let localCss = '';
    let fontIndex = 0;

    for (const block of blocks) {
        const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/);
        const weightMatch = block.match(/font-weight:\s*(\d+)/);
        const styleMatch = block.match(/font-style:\s*([^;]+)/);
        const urlMatch = block.match(/src:\s*url\((https:[^)]+)\)\s*format\(['"]?woff2['"]?\)/);
        const unicodeMatch = block.match(/unicode-range:\s*([^;]+);/);

        if (!familyMatch || !weightMatch || !urlMatch) {
            localCss += block + '\n\n';
            continue;
        }

        const family = familyMatch[1].trim().toLowerCase();
        const weight = weightMatch[1].trim();
        const style = styleMatch ? styleMatch[1].trim() : 'normal';
        const remoteUrl = urlMatch[1].trim();
        const unicodeRange = unicodeMatch ? unicodeMatch[1].trim() : null;

        fontIndex++;
        // Create clean filename: e.g. khand-500-subset-1.woff2
        const subsetMatch = block.match(/\/\*\s*([a-z0-9_-]+)\s*\*\//i);
        const subset = subsetMatch ? subsetMatch[1].trim() : `sub${fontIndex}`;
        const fileName = `${family}-${weight}-${subset}.woff2`;
        const filePath = path.join(FONTS_DIR, fileName);

        if (!fs.existsSync(filePath)) {
            console.log(`Downloading ${fileName} from ${remoteUrl}...`);
            const fontData = await fetch(remoteUrl);
            fs.writeFileSync(filePath, fontData);
            console.log(`  ✓ Saved ${fileName} (${fontData.length} bytes)`);
        } else {
            console.log(`  ✓ Already exists: ${fileName}`);
        }

        localCss += `/* ${family} ${weight} [${subset}] */
@font-face {
  font-family: '${familyMatch[1].trim()}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: swap;
  src: url('${fileName}') format('woff2');
${unicodeRange ? `  unicode-range: ${unicodeRange};\n` : ''}}
`;
    }

    fs.writeFileSync(path.join(FONTS_DIR, 'fonts.css'), localCss, 'utf-8');
    console.log(`Successfully generated assets/fonts/fonts.css`);
}

main().catch(console.error);
