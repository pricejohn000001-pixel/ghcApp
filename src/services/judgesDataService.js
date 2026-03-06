import AsyncStorage from '@react-native-async-storage/async-storage';

const JUDGES_STORAGE_KEY = '@ghc_judges_data';
const JUDGES_LAST_FETCH_KEY = '@ghc_judges_last_fetch';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Fetch judges data from the GHC website
 * This will parse the HTML and extract judge information
 */
const fetchJudgesFromWebsite = async () => {
    try {
        const response = await fetch('https://ghconline.gov.in/index.php/honble-the-chief-justice-sitting-judges/');
        const html = await response.text();

        // Parse the HTML to extract judges data
        const judges = parseJudgesFromHTML(html);

        return judges;
    } catch (error) {
        console.error('Error fetching judges from website:', error);
        throw error;
    }
};

/**
 * Parse judges data from HTML content
 */
const parseJudgesFromHTML = (html) => {
    const judges = [];

    try {
        // 1. Split HTML into judge blocks using the tmm_member class
        // The structure is <div class="tmm_member" ...> ... </div>
        const judgeBlocks = html.split('<div class="tmm_member"');

        // Skip the first chunk as it's before the first judge
        for (let i = 1; i < judgeBlocks.length; i++) {
            const block = judgeBlocks[i];

            // 2. Extract Name
            const nameMatch = /<span class="tmm_fname">([\s\S]*?)<\/span>/i.exec(block);
            if (!nameMatch) continue;

            // Clean up name (remove newline, tabs, extra spaces)
            let name = nameMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

            // 3. Extract Avatar
            // style="background: url(https://...);"
            const avatarMatch = /background:\s*url\(([^)]+)\)/i.exec(block);
            let avatar = avatarMatch ? avatarMatch[1].replace(/['"]/g, '') : '';

            // Fix relative URLs if any
            if (avatar && !avatar.startsWith('http')) {
                if (avatar.startsWith('/')) {
                    avatar = `https://ghconline.gov.in${avatar}`;
                } else {
                    avatar = `https://ghconline.gov.in/${avatar}`;
                }
            }

            // 4. Extract Bio (Profile tab content)
            // Usually inside first su-tabs-pane
            const bioMatch = /<div class="su-tabs-pane[^"]*"\s*data-title=".*?Profile.*?">([\s\S]*?)<\/div>/i.exec(block);
            let biography = '';
            if (bioMatch) {
                biography = bioMatch[1]
                    .replace(/<[^>]+>/g, ' ') // Remove tags
                    .replace(/\s+/g, ' ')     // Normalize whitespace
                    .trim();
            }

            // 5. Extract Details (Service Details table)
            const details = [];
            const detailsMatch = /<div class="su-tabs-pane[^"]*"\s*data-title=".*?Service Details.*?">([\s\S]*?)<\/div>/i.exec(block);

            if (detailsMatch) {
                const tableHtml = detailsMatch[1];
                // Match table rows
                const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
                let rowMatch;

                while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
                    const rowContent = rowMatch[1];
                    // Extract cells
                    const cells = [];
                    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                    let cellMatch;

                    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                        cells.push(cellMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
                    }

                    if (cells.length >= 2) {
                        const label = cells[0].replace(/:$/, '').trim();
                        const value = cells[1].trim();
                        // Map label to standard format
                        let cleanLabel = label;
                        if (label.includes("Parent High Court")) cleanLabel = "Parent High Court";
                        else if (label.includes("Stream")) cleanLabel = "Stream";
                        else if (label.includes("Date of Birth")) cleanLabel = "Date of Birth";
                        else if (label.includes("Elevation")) cleanLabel = "Date of Elevation";
                        else if (label.includes("Transfer")) cleanLabel = "Date of Transfer";
                        else if (label.includes("Retirement")) cleanLabel = "Date of Retirement";
                        else if (label.includes("Address")) cleanLabel = "Postal Address";
                        else if (label.includes("Stationing")) cleanLabel = "Place of Stationing";
                        else if (label.includes("Telephone")) cleanLabel = "Telephone";

                        details.push({
                            label: cleanLabel,
                            value: value
                        });
                    }
                }
            }

            // Add default details if missing
            const requiredLabels = [
                "Parent High Court", "Stream", "Date of Birth",
                "Date of Elevation", "Date of Transfer", "Date of Retirement",
                "Postal Address", "Place of Stationing", "Telephone"
            ];

            requiredLabels.forEach(reqLabel => {
                if (!details.find(d => d.label === reqLabel)) {
                    details.push({ label: reqLabel, value: "" });
                }
            });

            // Determine title
            const title = name.toLowerCase().includes('chief justice') ? 'Chief Justice' : '';

            judges.push({
                id: generateIdFromName(name),
                name: name,
                title: title,
                avatar: avatar,
                biography: biography,
                details: details
            });
        }

        console.log(`Parsed ${judges.length} judges from HTML`);
    } catch (error) {
        console.error('Error parsing judges HTML:', error);
    }

    return judges;
};

/**
 * Generate a unique ID from judge name
 */
const generateIdFromName = (name) => {
    return name
        .toLowerCase()
        .replace(/hon'ble|mr\.|mrs\.|justice/gi, '')
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^a-z_]/g, '');
};

/**
 * Save judges data to local storage
 */
const saveJudgesData = async (judges) => {
    try {
        await AsyncStorage.setItem(JUDGES_STORAGE_KEY, JSON.stringify(judges));
        await AsyncStorage.setItem(JUDGES_LAST_FETCH_KEY, Date.now().toString());
        console.log('Judges data saved successfully');
    } catch (error) {
        console.error('Error saving judges data:', error);
        throw error;
    }
};

/**
 * Load judges data from local storage
 */
const loadJudgesData = async () => {
    try {
        const data = await AsyncStorage.getItem(JUDGES_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading judges data:', error);
        return null;
    }
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = async () => {
    try {
        const lastFetch = await AsyncStorage.getItem(JUDGES_LAST_FETCH_KEY);
        if (!lastFetch) return false;

        const lastFetchTime = parseInt(lastFetch, 10);
        const now = Date.now();

        return (now - lastFetchTime) < CACHE_DURATION;
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
};

/**
 * Get judges data - will fetch from cache or website
 * This is the main function to use in your app
 */
export const getJudgesData = async (forceRefresh = false) => {
    try {
        // Check if we have valid cached data
        if (!forceRefresh) {
            const isValid = await isCacheValid();
            if (isValid) {
                const cachedData = await loadJudgesData();
                if (cachedData && cachedData.length > 0) {
                    console.log('Using cached judges data');
                    return cachedData;
                }
            }
        }

        // Fetch fresh data from website
        console.log('Fetching fresh judges data from website...');
        const judges = await fetchJudgesFromWebsite();

        // Save to cache
        if (judges && judges.length > 0) {
            await saveJudgesData(judges);
        }

        return judges;
    } catch (error) {
        console.error('Error getting judges data:', error);

        // Fallback to cached data even if expired
        const cachedData = await loadJudgesData();
        if (cachedData && cachedData.length > 0) {
            console.log('Using cached judges data as fallback');
            return cachedData;
        }

        // If all fails, return empty array
        return [];
    }
};

/**
 * Clear cached judges data
 */
export const clearJudgesCache = async () => {
    try {
        await AsyncStorage.removeItem(JUDGES_STORAGE_KEY);
        await AsyncStorage.removeItem(JUDGES_LAST_FETCH_KEY);
        console.log('Judges cache cleared');
    } catch (error) {
        console.error('Error clearing judges cache:', error);
    }
};

/**
 * Initialize judges data on app start
 * This should be called once when the app starts
 */
export const initializeJudgesData = async () => {
    try {
        console.log('Initializing judges data...');
        const judges = await getJudgesData();
        console.log(`Judges data initialized with ${judges.length} judges`);
        return judges;
    } catch (error) {
        console.error('Error initializing judges data:', error);
        return [];
    }
};
