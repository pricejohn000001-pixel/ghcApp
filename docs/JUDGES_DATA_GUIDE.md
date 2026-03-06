# Judges Data Extraction and Management

This document explains how to extract and manage judges data from the GHC website for the GHC mobile app.

## Overview

The GHC app uses judges data from `src/data.js` which contains comprehensive information about all sitting judges. This data is displayed in the judges slider and portfolio modal throughout the app.

## Current Implementation

### Data Storage
- **Location**: `src/data.js`
- **Export**: `judges` array
- **Structure**: Each judge object contains:
  - `id`: Unique identifier (snake_case)
  - `name`: Full name with honorific
  - `title`: Designation (e.g., "Chief Justice")
  - `avatar`: URL to judge's photo
  - `biography`: Detailed biography
  - `details`: Array of service details (DOB, elevation date, retirement date, etc.)

### Data Usage
The judges data is used in several components:
1. **JudgesSection.js**: Displays judges in a horizontal slider
2. **PortfolioModal.js**: Shows detailed judge information
3. **SearchModal.js**: Allows searching for judges
4. **App.js**: Manages judge selection and navigation

## Data Extraction Methods

### Method 1: Manual Extraction from Website (Recommended)

The GHC website (https://ghconline.gov.in/index.php/honble-the-chief-justice-sitting-judges/) displays all sitting judges with their complete information.

**Steps:**
1. Visit the GHC judges page
2. For each judge, extract:
   - Name
   - Photo URL
   - Biography (from "Profile" tab)
   - Service Details (from "Service Details" tab)
3. Update `src/data.js` with the new information

**Data Format:**
```javascript
{
  id: "judge_name",  // snake_case version of name
  name: "Hon'ble Mr. Justice Full Name",
  title: "Chief Justice" or "",
  avatar: "https://ghconline.gov.in/wp-content/uploads/.../photo.jpg",
  biography: "Full biography text...",
  details: [
    { label: "Parent High Court", value: "Gauhati" },
    { label: "Stream", value: "Bar" or "Service" },
    { label: "Date of Birth", value: "DD.MM.YYYY" },
    { label: "Date of Elevation", value: "DD.MM.YYYY" },
    { label: "Date of Transfer", value: "-" or date },
    { label: "Date of Retirement", value: "DD.MM.YYYY" },
    { label: "Postal Address", value: "Full address" },
    { label: "Place of Stationing", value: "Principal Seat" or bench },
    { label: "Telephone", value: "Phone number or -" }
  ]
}
```

### Method 2: Automated Scraping (Advanced)

A Node.js scraping script is available in `scripts/scrapeJudgesData.js` that can extract judges data from the website.

**Note**: This script may need updates if the website structure changes.

**Usage:**
```bash
node scripts/scrapeJudgesData.js
```

The script will:
1. Fetch the HTML from the GHC website
2. Parse judge information
3. Save to `src/data/scrapedJudges.json`
4. Display a summary in the console

### Method 3: Data Service (Future Enhancement)

A data service is available in `src/services/judgesDataService.js` that can:
- Fetch judges data from the website
- Cache data in AsyncStorage
- Automatically refresh data periodically

**Usage:**
```javascript
import { initializeJudgesData, getJudgesData } from './src/services/judgesDataService';

// Initialize on app start
const judges = await initializeJudgesData();

// Get cached data
const cachedJudges = await getJudgesData();

// Force refresh
const freshJudges = await getJudgesData(true);
```

## Portfolio Management

Judges can be assigned to different portfolios (committees, administrative roles, etc.) using the portfolio mapper utility.

**Location:** `src/utils/judgesPortfolioMapper.js`

**Usage:**
```javascript
import { 
  getJudgePortfolio,
  getJudgesWithPortfolios,
  getJudgesByPortfolio 
} from './src/utils/judgesPortfolioMapper';

// Get portfolio for a specific judge
const portfolio = getJudgePortfolio('ashutosh_kumar');

// Get all judges with their portfolios
const judgesWithPortfolios = getJudgesWithPortfolios(judges);

// Filter judges by portfolio type
const committeeJudges = getJudgesByPortfolio(judges, 'Administrative Committee');
```

**Portfolio Configuration:**
Edit `src/utils/judgesPortfolioMapper.js` to update portfolio assignments:

```javascript
const judgesPortfolios = {
  judge_id: {
    portfolios: [
      'Committee Name 1',
      'Committee Name 2'
    ],
    designation: 'Senior Judge',
    currentlyServing: true
  }
  // ... more judges
};
```

## Data Lifecycle Strategy

### Option 1: Static Data (Current - Recommended)
- Manually update `src/data.js` when judges are appointed or transferred
- Benefits:
  - No network calls or caching complexity
  - Faster app performance
  - Complete control over data
  - No dependency on website availability
- Drawbacks:
  - Requires manual updates
  - App update needed for judge changes

### Option 2: One-Time Fetch on Installation
- Fetch judges data once when the app is first installed
- Cache in AsyncStorage
- Benefits:
  - Always fresh data on first install
  - No manual updates needed
- Drawbacks:
  - Network dependency on first launch
  - Potential for outdated data if website is unavailable

### Option 3: Periodic Sync
- Sync with website weekly/monthly
- Keep local cache as fallback
- Benefits:
  - Always up-to-date data
  - Works offline with cached data
- Drawbacks:
  - More complex implementation
  - Network usage
  - Potential inconsistencies

## Recommended Workflow

**For Production Apps:**
1. Use static data in `src/data.js` (current approach)
2. Monitor the GHC website for changes (new judges, transfers, retirements)
3. Update `src/data.js` manually when changes occur
4. Release app update with new data
5. Use portfolio mapper for dynamic portfolio assignments

**For Development/Testing:**
1. Use the scraping script to extract data: `node scripts/scrapeJudgesData.js`
2. Review the extracted data in `src/data/scrapedJudges.json`
3. Manually merge with existing `src/data.js`
4. Test the app with updated data

## Data Validation

When adding or updating judge data, ensure:
1. ✅ All required fields are present
2. ✅ Image URLs are accessible
3. ✅ Dates are in DD.MM.YYYY format
4. ✅ Judge IDs are unique and in snake_case
5. ✅ Biography text is properly formatted
6. ✅ No HTML tags in text fields

## Internationalization (i18n)

Judge data supports multiple languages through the i18n system. Labels and common values are translated automatically:

**Translated Fields:**
- Service detail labels (e.g., "Date of Birth" → translations)
- Common values (e.g., "Principal Seat" → translations)
- Judge names remain in English

**Files:**
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/as.json` - Assamese translations

## Troubleshooting

### Images Not Loading
- Check if image URLs are accessible
- Verify HTTPS URLs
- Consider hosting images locally if website is unreliable

### Data Structure Mismatch
- Ensure all judges follow the same data structure
- Check for missing fields
- Validate JSON syntax in `data.js`

### Scraping Script Fails
- The website structure may have changed
- Update the parsing logic in `scripts/scrapeJudgesData.js`
- Check the saved HTML in `scripts/debug_judges.html` for inspection

## Future Enhancements

1. **Admin Panel Integration**
   - Build a web-based admin panel to manage judge data
   - Automatic sync with mobile app

2. **CMS Integration**
   - Integrate with GHC website CMS for automatic data sync
   - Real-time updates

3. **Notification System**
   - Notify users when new judges are appointed
   - Alert for judge transfers or retirements

4. **Historical Data**
   - Maintain archive of former judges
   - Track judge career progression

## Support

For questions or issues:
1. Check this documentation
2. Review the code comments in relevant files
3. Test with sample data first
4. Validate data structure before updating production

---

**Last Updated:** February 2026
**Maintained By:** GHC App Development Team
