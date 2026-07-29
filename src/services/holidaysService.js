/**
 * Determines the holiday category based on the holiday name.
 * Default is "Public".
 */
const getCategoryInfo = (name) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("working saturday") || 
      lowerName.includes("1st saturday") || 
      lowerName.includes("3rd saturday") || 
      lowerName.includes("5th saturday")) {
    return { badge: "Working Saturday", type: "working" };
  }
  
  // Restricted holidays keywords - these will be used for filtering out
  const restrictedKeywords = ["silpi divas", "netaji", "busu dima", "restricted"];
  if (restrictedKeywords.some(k => lowerName.includes(k))) {
    return { badge: "Restricted", type: "restricted" };
  }

  return { badge: "Holiday", type: "public" };
};

/**
 * Formats holiday date string from API to display label.
 */
const formatHolidayLabel = (holiday) => {
  const date = new Date(holiday.holidaydate);
  const day = date.getDate();
  
  const j = day % 10, k = day % 100;
  let suffix = "th";
  if (j === 1 && k !== 11) suffix = "st";
  if (j === 2 && k !== 12) suffix = "nd";
  if (j === 3 && k !== 13) suffix = "rd";
  
  return `${day}${suffix} ${holiday.holidayname}`;
};

/**
 * Fetches holidays for a specific year and maps them to the app's internal format.
 */
export const fetchHolidaysData = async (year = new Date().getFullYear()) => {
  try {
    const response = await fetch(`https://ghcservices.assam.gov.in/cis-api/api/v1/system/holidays?year=${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.status}`);
    }

    const json = await response.json();
    const data = json.data || [];

    // Deduplicate: Group by date and prioritize real holidays over Working Saturdays
    const groupedByDate = {};
    data.forEach(h => {
      const dateKey = h.holidaydate.split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(h);
    });

    const dedupedData = Object.values(groupedByDate).map(entries => {
      if (entries.length === 1) return entries[0];
      
      const realHolidays = entries.filter(e => {
        const name = e.holidayname.toLowerCase();
        return !name.includes("saturday") && !name.includes("sunday");
      });
      
      return realHolidays.length > 0 ? realHolidays[0] : entries[0];
    });

    // Map to app's holiday format and filter out Restricted and Sundays
    const mappedHolidays = [];
    dedupedData.forEach(h => {
      const name = h.holidayname.toLowerCase();
      if (name.includes("sunday")) return;
      
      const categoryInfo = getCategoryInfo(h.holidayname);
      if (categoryInfo.badge === "Restricted") return; // Remove restricted holidays

      const date = new Date(h.holidaydate);
      mappedHolidays.push({
        label: formatHolidayLabel(h),
        name: h.holidayname,
        badge: categoryInfo.badge,
        month: date.getMonth(),
        year: date.getFullYear(),
        day: date.getDate(),
        type: categoryInfo.type
      });
    });

    // Generate Calendar Singles mapping for CalendarGrid
    const calendarConfig = {};
    dedupedData.forEach(h => {
      const date = new Date(h.holidaydate);
      const m = date.getMonth();
      const d = date.getDate();
      const categoryInfo = getCategoryInfo(h.holidayname);
      
      if (categoryInfo.badge === "Restricted") return; // Don't show restricted on calendar

      if (!calendarConfig[m]) {
        calendarConfig[m] = { singles: [], satPolicy: "2nd_4th_holiday" };
      }
      
      if (!h.holidayname.toLowerCase().includes("sunday")) {
        calendarConfig[m].singles.push({
          day: d,
          type: categoryInfo.type
        });
      }
    });

    return {
      holidays: mappedHolidays,
      calendarConfig: calendarConfig
    };
  } catch (error) {
    console.error("Error in fetchHolidaysData:", error);
    return null;
  }
};
