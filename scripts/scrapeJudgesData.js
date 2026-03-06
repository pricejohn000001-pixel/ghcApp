/**
 * Script to scrape judges data from GHC website
 * Run this with: node scripts/scrapeJudgesData.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const URL = 'https://ghconline.gov.in/index.php/honble-the-chief-justice-sitting-judges/';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'scrapedJudges.json');

/**
 * Fetch HTML content from URL
 */
function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Extract text content from HTML string
 */
function extractText(html) {
    return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract attribute value from HTML tag
 */
function extractAttribute(html, tag, attribute) {
    const regex = new RegExp(`<${tag}[^>]*${attribute}="([^"]*)"`, 'i');
    const match = html.match(regex);
    return match ? match[1] : null;
}

/**
 * Generate ID from name
 */
function generateId(name) {
    return name
        .toLowerCase()
        .replace(/hon'ble|mr\.|mrs\.|ms\.|justice/gi, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z_]/g, '');
}

/**
 * Parse judges from HTML
 */
function parseJudges(html) {
    const judges = [];

    try {
        // Look for common patterns in GHC website structure
        // The website typically has judge information in WordPress content areas

        // Pattern 1: Look for judge sections within wp-content or similar divs
        const contentPattern = /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
        let contentMatch = contentPattern.exec(html);

        if (!contentMatch) {
            // Try alternative pattern
            contentMatch = /<article[^>]*>([\s\S]*?)<\/article>/gi.exec(html);
        }

        if (contentMatch) {
            let content = contentMatch[1];

            // Look for table rows or list items with judge information
            const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            let rowMatch;

            while ((rowMatch = rowPattern.exec(content)) !== null) {
                const row = rowMatch[1];

                // Extract image
                const imgMatch = /<img[^>]*src="([^"]*)"[^>]*>/i.exec(row);
                const avatar = imgMatch ? imgMatch[1] : '';

                // Extract name - look for text containing "Justice"
                const tdPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                const cells = [];
                let cellMatch;

                while ((cellMatch = tdPattern.exec(row)) !== null) {
                    const cellText = extractText(cellMatch[1]);
                    if (cellText) cells.push(cellText);
                }

                // Find the cell with justice name
                const nameCell = cells.find(cell =>
                    cell.includes('Justice') || cell.includes('Hon')
                );

                if (nameCell) {
                    const name = nameCell.trim();
                    const isChiefJustice = name.toLowerCase().includes('chief justice');

                    judges.push({
                        id: generateId(name),
                        name: name,
                        title: isChiefJustice ? 'Chief Justice' : '',
                        avatar: avatar.startsWith('http') ? avatar :
                            avatar.startsWith('/') ? `https://ghconline.gov.in${avatar}` :
                                `https://ghconline.gov.in/${avatar}`,
                        biography: '',
                        details: [
                            { label: 'Parent High Court', value: 'Gauhati' },
                            { label: 'Stream', value: '' },
                            { label: 'Date of Birth', value: '' },
                            { label: 'Date of Elevation', value: '' },
                            { label: 'Date of Transfer', value: '' },
                            { label: 'Date of Retirement', value: '' },
                            { label: 'Postal Address', value: '' },
                            { label: 'Place of Stationing', value: 'Principal Seat' },
                            { label: 'Telephone', value: '' }
                        ]
                    });
                }
            }

            // Try alternative: Look for figure or div elements with judge info
            if (judges.length === 0) {
                const figurePattern = /<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi;
                let figureMatch;

                while ((figureMatch = figurePattern.exec(content)) !== null) {
                    const figure = figureMatch[1];

                    const imgMatch = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/i.exec(figure);
                    if (imgMatch) {
                        const avatar = imgMatch[1];
                        const name = imgMatch[2] || '';

                        if (name && name.includes('Justice')) {
                            const isChiefJustice = name.toLowerCase().includes('chief justice');

                            judges.push({
                                id: generateId(name),
                                name: name,
                                title: isChiefJustice ? 'Chief Justice' : '',
                                avatar: avatar.startsWith('http') ? avatar :
                                    avatar.startsWith('/') ? `https://ghconline.gov.in${avatar}` :
                                        `https://ghconline.gov.in/${avatar}`,
                                biography: '',
                                details: [
                                    { label: 'Parent High Court', value: 'Gauhati' },
                                    { label: 'Stream', value: '' },
                                    { label: 'Date of Birth', value: '' },
                                    { label: 'Date of Elevation', value: '' },
                                    { label: 'Date of Transfer', value: '' },
                                    { label: 'Date of Retirement', value: '' },
                                    { label: 'Postal Address', value: '' },
                                    { label: 'Place of Stationing', value: 'Principal Seat' },
                                    { label: 'Telephone', value: '' }
                                ]
                            });
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error parsing judges:', error);
    }

    return judges;
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('Fetching judges data from GHC website...');
        const html = await fetchHTML(URL);

        console.log('Parsing judges data...');
        const judges = parseJudges(html);

        console.log(`Found ${judges.length} judges`);

        if (judges.length > 0) {
            // Create data directory if it doesn't exist
            const dataDir = path.dirname(OUTPUT_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            // Save to file
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(judges, null, 2));
            console.log(`Judges data saved to ${OUTPUT_FILE}`);

            // Print summary
            judges.forEach((judge, index) => {
                console.log(`${index + 1}. ${judge.name}`);
                if (judge.avatar) console.log(`   Avatar: ${judge.avatar}`);
            });
        } else {
            console.log('No judges found. The website structure may have changed.');
            console.log('You may need to manually inspect the HTML and update the parsing logic.');

            // Save HTML for inspection
            const htmlFile = path.join(__dirname, 'debug_judges.html');
            fs.writeFileSync(htmlFile, html);
            console.log(`HTML saved to ${htmlFile} for inspection`);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
