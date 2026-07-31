const ASSAMESE_DIGITS = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

const HOLIDAY_NAME_TRANSLATIONS_AS = {
  "new year holiday": "নৱবৰ্ষৰ বন্ধ",
  "new years day": "নৱবৰ্ষ দিৱস",
  "new years holiday": "নৱবৰ্ষৰ বন্ধ",
  "magh bihu and tusu puja": "মাঘ বিহু আৰু টুচু পূজা",
  "netajis birthday": "নেতাজীৰ জন্মদিন",
  "republic day": "গণতন্ত্ৰ দিৱস",
  "me dam me phi": "মে-ডাম-মে-ফি",
  "medam mephi": "মে-ডাম-মে-ফি",
  "bir chilarai divas": "বীৰ ছিলাৰায় দিৱস",
  "bir chilaray divas": "বীৰ ছিলাৰায় দিৱস",
  "siva ratri": "শিৱ ৰাত্ৰী",
  "maha shivratri": "মহা শিৱৰাত্ৰি",
  "dol jatra": "দৌল যাত্ৰা",
  "dol jatra holi": "দৌল যাত্ৰা / হোলী",
  "holi": "হোলী",
  "id ul fitre": "ঈদ-উল-ফিতৰ",
  "id ul fitr": "ঈদ-উল-ফিতৰ",
  "good friday": "গুড ফ্ৰাইডে",
  "bihu vacation": "বিহু বন্ধ",
  "bohag bihu": "বহাগ বিহু",
  "rongali bihu": "ৰঙালী বিহু",
  "dr b r ambedkars birth day": "ডঃ বি. আৰ. আম্বেদকৰৰ জন্মদিন",
  "dr br ambedkar jayanti": "ডঃ বি. আৰ. আম্বেদকৰ জয়ন্তী",
  "day after bohag bihu": "বহাগ বিহুৰ পিছৰ দিন",
  "tithi of damodar deva": "দামোদৰ দেৱৰ তিথি",
  "sati sadhini divas": "সতী সাধিনী দিৱস",
  "may day": "মে' দিৱস",
  "may day and buddha purnima": "মে' দিৱস আৰু বুদ্ধ পূৰ্ণিমা",
  "may day labour day": "মে' দিৱস / শ্ৰম দিৱস",
  "labour day": "শ্ৰম দিৱস",
  "buddha purnima": "বুদ্ধ পূৰ্ণিমা",
  "id uz zoha": "ঈদ-উজ-জোহা",
  "id ul zuha": "ঈদ-উল-জুহা",
  "bakrid": "বকৰা ঈদ",
  "janmotsava of sri sri madhab dev": "শ্ৰীশ্ৰী মাধৱ দেৱৰ জন্মোৎসৱ",
  "janmotsav of sri sri madhabdeva": "শ্ৰীশ্ৰী মাধৱদেৱৰ জন্মোৎসৱ",
  "janmotsava of sri sri madhabdeva": "শ্ৰীশ্ৰী মাধৱদেৱৰ জন্মোৎসৱ",
  "muharram": "মহৰম",
  "muharram ashura": "মহৰম / আশুৰা",
  "independence day": "স্বাধীনতা দিৱস",
  "fateha dwaj daham": "ফাতেহা-দ্বাজ-দহম",
  "milad un nabi": "মিলাদ-উন-নবী",
  "id e milad": "ঈদ-এ-মিলাদ",
  "tithi of sri sri madhab dev": "শ্ৰীশ্ৰী মাধৱ দেৱৰ তিথি",
  "tirubhav tithi of sri sri madhabdeva": "শ্ৰীশ্ৰী মাধৱদেৱৰ তিৰোভাৱ তিথি",
  "janmastami": "জন্মাষ্টমী",
  "janmashtami": "জন্মাষ্টমী",
  "tithi of srimanta sankar dev": "শ্ৰীমন্ত শংকৰদেৱৰ তিথি",
  "tirubhav tithi of srimanta sankardeva": "শ্ৰীমন্ত শংকৰদেৱৰ তিৰোভাৱ তিথি",
  "janmotsava of srimanta sankar dev": "শ্ৰীমন্ত শংকৰদেৱৰ জন্মোৎসৱ",
  "janmotsav of srimanta sankardeva": "শ্ৰীমন্ত শংকৰদেৱৰ জন্মোৎসৱ",
  "birthday of mahatma gandhi": "মহাত্মা গান্ধীৰ জন্মদিন",
  "mahatma gandhi jayanti": "মহাত্মা গান্ধী জয়ন্তী",
  "long vacation": "দীঘলীয়া বন্ধ",
  "kati bihu and durga puja": "কাতি বিহু আৰু দুৰ্গা পূজা",
  "durga puja and vijaya dashomi": "দুৰ্গা পূজা আৰু বিজয়া দশমী",
  "durga puja": "দুৰ্গা পূজা",
  "vijaya dashomi": "বিজয়া দশমী",
  "kali puja diwali": "কালী পূজা / দীপাৱলী",
  "kali puja and diwali": "কালী পূজা / দীপাৱলী",
  "diwali": "দীপাৱলী",
  "guru nanaks birthday": "গুৰু নানকৰ জন্মদিন",
  "guru nanak jayanti": "গুৰু নানক জয়ন্তী",
  "lachit divas": "লাচিত দিৱস",
  "asom divas": "অসম দিৱস",
  "asom divas su ka pha divas": "অসম দিৱস (চু-কা-ফা দিৱস)",
  "christmas holiday": "খ্ৰীষ্টমাছৰ বন্ধ",
  "christmas day": "খ্ৰীষ্টমাছ দিৱস",
  "working saturday": "কৰ্মৰত শনিবাৰ",
  "1st saturday": "১ম শনিবাৰ",
  "2nd saturday": "২য় শনিবাৰ",
  "3rd saturday": "৩য় শনিবাৰ",
  "4th saturday": "৪ৰ্থ শনিবাৰ",
  "5th saturday": "৫ম শনিবাৰ",
};

const normalizeHolidayName = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’'`.]/g, "")
    .replace(/&/g, " and ")
    .replace(/[()/,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const formatLocalizedNumber = (value, language = "en") => {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);
  if (language !== "as") return stringValue;

  return stringValue.replace(/\d/g, (digit) => ASSAMESE_DIGITS[digit] || digit);
};

export const localizeDigitsInText = (value, language = "en") => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\d+/g, (match) => formatLocalizedNumber(match, language));
};

export const getLocalizedHolidayName = (name, language = "en") => {
  if (!name) return "";
  if (language !== "as") return name;

  const normalized = normalizeHolidayName(name);
  return HOLIDAY_NAME_TRANSLATIONS_AS[normalized] || name;
};
