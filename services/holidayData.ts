import { CountryData } from "../types";

/**
 * STATIC HOLIDAY DATABASE
 * 
 * Structure:
 * - Federal: Holidays that apply to the entire country.
 * - Regions: Specific state/province holidays (additive to federal).
 * - Aliases: Maps user input (e.g. "NY", "Cali") to canonical region keys.
 * 
 * Format: "YYYY-MM-DD:Holiday Name"
 * Dates must be strictly YYYY-MM-DD (padded zeros) for string comparison.
 */

export const HOLIDAY_DB: Record<string, CountryData> = {
  "United States": {
    federal: {
      "2025": [
        "2025-01-01:New Year's Day",
        "2025-01-20:Martin Luther King Jr. Day",
        "2025-02-17:Presidents' Day",
        "2025-05-26:Memorial Day",
        "2025-06-19:Juneteenth",
        "2025-07-04:Independence Day",
        "2025-09-01:Labor Day",
        "2025-10-13:Indigenous Peoples' Day",
        "2025-11-11:Veterans Day",
        "2025-11-27:Thanksgiving Day",
        "2025-12-25:Christmas Day"
      ],
      "2026": [
        "2026-01-01:New Year's Day",
        "2026-01-19:Martin Luther King Jr. Day",
        "2026-02-16:Presidents' Day",
        "2026-05-25:Memorial Day",
        "2026-06-19:Juneteenth",
        "2026-07-03:Independence Day (Observed)",
        "2026-09-07:Labor Day",
        "2026-10-12:Indigenous Peoples' Day",
        "2026-11-11:Veterans Day",
        "2026-11-26:Thanksgiving Day",
        "2026-12-25:Christmas Day"
      ],
      "2027": [
        "2027-01-01:New Year's Day",
        "2027-01-18:Martin Luther King Jr. Day",
        "2027-02-15:Presidents' Day",
        "2027-05-31:Memorial Day",
        "2027-06-18:Juneteenth (Observed)",
        "2027-07-05:Independence Day (Observed)",
        "2027-09-06:Labor Day",
        "2027-10-11:Indigenous Peoples' Day",
        "2027-11-11:Veterans Day",
        "2027-11-25:Thanksgiving Day",
        "2027-12-24:Christmas Day (Observed)"
      ]
    },
    regions: {
      "Massachusetts": {
        "2025": ["2025-04-21:Patriots' Day"],
        "2026": ["2026-04-20:Patriots' Day"],
        "2027": ["2027-04-19:Patriots' Day"]
      },
      "California": {
        "2025": ["2025-03-31:Cesar Chavez Day", "2025-11-28:Day After Thanksgiving"],
        "2026": ["2026-03-31:Cesar Chavez Day", "2026-11-27:Day After Thanksgiving"],
        "2027": ["2027-03-31:Cesar Chavez Day", "2027-11-26:Day After Thanksgiving"]
      },
      "Texas": {
        "2025": ["2025-01-19:Confederate Heroes Day", "2025-03-02:Texas Independence Day", "2025-04-21:San Jacinto Day", "2025-08-27:LBJ Day"],
        "2026": ["2026-01-19:Confederate Heroes Day", "2026-03-02:Texas Independence Day", "2026-04-21:San Jacinto Day", "2026-08-27:LBJ Day"],
        "2027": ["2027-01-19:Confederate Heroes Day", "2027-03-02:Texas Independence Day", "2027-04-21:San Jacinto Day", "2027-08-27:LBJ Day"]
      },
      "Illinois": {
        "2025": ["2025-02-12:Lincoln's Birthday", "2025-03-03:Pulaski Day"],
        "2026": ["2026-02-12:Lincoln's Birthday", "2026-03-02:Pulaski Day"],
        "2027": ["2027-02-12:Lincoln's Birthday", "2027-03-01:Pulaski Day"]
      },
      "New York": {
        "2025": ["2025-02-12:Lincoln's Birthday", "2025-06-19:Juneteenth"],
        "2026": ["2026-02-12:Lincoln's Birthday", "2026-06-19:Juneteenth"],
        "2027": ["2027-02-12:Lincoln's Birthday", "2027-06-19:Juneteenth"]
      }
    },
    regionAliases: {
      "ny": "New York", "nyc": "New York", "new york": "New York",
      "ca": "California", "cali": "California", "california": "California",
      "ma": "Massachusetts", "mass": "Massachusetts", "boston": "Massachusetts",
      "tx": "Texas", "texas": "Texas",
      "il": "Illinois", "illinois": "Illinois", "chicago": "Illinois",
      "dc": "District of Columbia", "wash": "District of Columbia"
    }
  },

  "United Kingdom": {
    federal: {
      "2025": [
        "2025-01-01:New Year's Day",
        "2025-04-18:Good Friday",
        "2025-04-21:Easter Monday",
        "2025-05-05:Early May Bank Holiday",
        "2025-05-26:Spring Bank Holiday",
        "2025-08-25:Summer Bank Holiday",
        "2025-12-25:Christmas Day",
        "2025-12-26:Boxing Day"
      ],
      "2026": [
        "2026-01-01:New Year's Day",
        "2026-04-03:Good Friday",
        "2026-04-06:Easter Monday",
        "2026-05-04:Early May Bank Holiday",
        "2026-05-25:Spring Bank Holiday",
        "2026-08-31:Summer Bank Holiday",
        "2026-12-25:Christmas Day",
        "2026-12-28:Boxing Day (Observed)"
      ],
      "2027": [
        "2027-01-01:New Year's Day",
        "2027-03-26:Good Friday",
        "2027-03-29:Easter Monday",
        "2027-05-03:Early May Bank Holiday",
        "2027-05-31:Spring Bank Holiday",
        "2027-08-30:Summer Bank Holiday",
        "2027-12-27:Christmas Day (Substitute)",
        "2027-12-28:Boxing Day (Substitute)"
      ]
    },
    regions: {
      "Scotland": {
        "2025": ["2025-01-02:2nd January", "2025-08-04:Summer Bank Holiday (Scotland)", "2025-11-30:St Andrew's Day"],
        "2026": ["2026-01-02:2nd January", "2026-08-03:Summer Bank Holiday (Scotland)", "2026-11-30:St Andrew's Day"],
        "2027": ["2027-01-04:2nd January (Substitute)", "2027-08-02:Summer Bank Holiday (Scotland)", "2027-11-30:St Andrew's Day"]
      },
      "Northern Ireland": {
        "2025": ["2025-03-17:St Patrick's Day", "2025-07-12:Battle of the Boyne"],
        "2026": ["2026-03-17:St Patrick's Day", "2026-07-13:Battle of the Boyne (Observed)"],
        "2027": ["2027-03-17:St Patrick's Day", "2027-07-12:Battle of the Boyne"]
      }
    },
    regionAliases: {
      "scotland": "Scotland", "scot": "Scotland", "edinburgh": "Scotland", "glasgow": "Scotland",
      "ni": "Northern Ireland", "northern ireland": "Northern Ireland", "belfast": "Northern Ireland",
      "wales": "Wales", "cymru": "Wales"
    }
  },

  "Canada": {
    federal: {
      "2025": [
        "2025-01-01:New Year's Day",
        "2025-04-18:Good Friday",
        "2025-07-01:Canada Day",
        "2025-09-01:Labour Day",
        "2025-09-30:Truth & Reconciliation Day",
        "2025-10-13:Thanksgiving",
        "2025-11-11:Remembrance Day",
        "2025-12-25:Christmas Day",
        "2025-12-26:Boxing Day"
      ],
      "2026": [
        "2026-01-01:New Year's Day",
        "2026-04-03:Good Friday",
        "2026-07-01:Canada Day",
        "2026-09-07:Labour Day",
        "2026-09-30:Truth & Reconciliation Day",
        "2026-10-12:Thanksgiving",
        "2026-11-11:Remembrance Day",
        "2026-12-25:Christmas Day",
        "2026-12-26:Boxing Day"
      ],
      "2027": [
        "2027-01-01:New Year's Day",
        "2027-03-26:Good Friday",
        "2027-07-01:Canada Day",
        "2027-09-06:Labour Day",
        "2027-09-30:Truth & Reconciliation Day",
        "2027-10-11:Thanksgiving",
        "2027-11-11:Remembrance Day",
        "2027-12-27:Christmas Day (Observed)",
        "2027-12-28:Boxing Day (Observed)"
      ]
    },
    regions: {
      "Ontario": {
        "2025": ["2025-02-17:Family Day", "2025-05-19:Victoria Day", "2025-08-04:Civic Holiday"],
        "2026": ["2026-02-16:Family Day", "2026-05-18:Victoria Day", "2026-08-03:Civic Holiday"],
        "2027": ["2027-02-15:Family Day", "2027-05-24:Victoria Day", "2027-08-02:Civic Holiday"]
      },
      "British Columbia": {
        "2025": ["2025-02-17:Family Day", "2025-05-19:Victoria Day", "2025-08-04:BC Day"],
        "2026": ["2026-02-16:Family Day", "2026-05-18:Victoria Day", "2026-08-03:BC Day"],
        "2027": ["2027-02-15:Family Day", "2027-05-24:Victoria Day", "2027-08-02:BC Day"]
      },
      "Alberta": {
        "2025": ["2025-02-17:Family Day", "2025-05-19:Victoria Day", "2025-08-04:Heritage Day"],
        "2026": ["2026-02-16:Family Day", "2026-05-18:Victoria Day", "2026-08-03:Heritage Day"],
        "2027": ["2027-02-15:Family Day", "2027-05-24:Victoria Day", "2027-08-02:Heritage Day"]
      },
      "Quebec": {
        "2025": ["2025-04-21:Easter Monday", "2025-05-19:National Patriots' Day", "2025-06-24:St-Jean-Baptiste"],
        "2026": ["2026-04-06:Easter Monday", "2026-05-18:National Patriots' Day", "2026-06-24:St-Jean-Baptiste"],
        "2027": ["2027-03-29:Easter Monday", "2027-05-24:National Patriots' Day", "2027-06-24:St-Jean-Baptiste"]
      }
    },
    regionAliases: {
      "on": "Ontario", "ont": "Ontario", "ontario": "Ontario", "toronto": "Ontario",
      "bc": "British Columbia", "british columbia": "British Columbia", "vancouver": "British Columbia",
      "ab": "Alberta", "alberta": "Alberta", "calgary": "Alberta",
      "qc": "Quebec", "quebec": "Quebec", "québec": "Quebec", "montreal": "Quebec"
    }
  },

  "Australia": {
    federal: {
      "2025": [
        "2025-01-01:New Year's Day",
        "2025-01-27:Australia Day (Observed)",
        "2025-04-18:Good Friday",
        "2025-04-21:Easter Monday",
        "2025-04-25:Anzac Day",
        "2025-12-25:Christmas Day",
        "2025-12-26:Boxing Day"
      ],
      "2026": [
        "2026-01-01:New Year's Day",
        "2026-01-26:Australia Day",
        "2026-04-03:Good Friday",
        "2026-04-06:Easter Monday",
        "2026-04-25:Anzac Day",
        "2026-04-27:Anzac Day (Observed)",
        "2026-12-25:Christmas Day",
        "2026-12-26:Boxing Day"
      ],
      "2027": [
        "2027-01-01:New Year's Day",
        "2027-01-26:Australia Day",
        "2027-03-26:Good Friday",
        "2027-03-29:Easter Monday",
        "2027-04-26:Anzac Day (Observed)",
        "2027-12-27:Christmas Day (Observed)",
        "2027-12-28:Boxing Day (Observed)"
      ]
    },
    regions: {
      "New South Wales": {
        "2025": ["2025-06-09:King's Birthday", "2025-10-06:Labour Day"],
        "2026": ["2026-06-08:King's Birthday", "2026-10-05:Labour Day"],
        "2027": ["2027-06-14:King's Birthday", "2027-10-04:Labour Day"]
      },
      "Victoria": {
        "2025": ["2025-03-10:Labour Day", "2025-04-19:Saturday before Easter", "2025-04-20:Easter Sunday", "2025-06-09:King's Birthday", "2025-09-26:AFL Grand Final Friday", "2025-11-04:Melbourne Cup"],
        "2026": ["2026-03-09:Labour Day", "2026-04-04:Saturday before Easter", "2026-04-05:Easter Sunday", "2026-06-08:King's Birthday", "2026-09-25:AFL Grand Final Friday (Est)", "2026-11-03:Melbourne Cup"],
        "2027": ["2027-03-08:Labour Day", "2027-03-27:Saturday before Easter", "2027-03-28:Easter Sunday", "2027-06-14:King's Birthday", "2027-09-24:AFL Grand Final Friday (Est)", "2027-11-02:Melbourne Cup"]
      },
      "Queensland": {
        "2025": ["2025-05-05:Labour Day", "2025-10-06:King's Birthday"],
        "2026": ["2026-05-04:Labour Day", "2026-10-05:King's Birthday"],
        "2027": ["2027-05-03:Labour Day", "2027-10-04:King's Birthday"]
      },
      "Western Australia": {
        "2025": ["2025-03-03:Labour Day", "2025-06-02:Western Australia Day", "2025-09-29:King's Birthday"],
        "2026": ["2026-03-02:Labour Day", "2026-06-01:Western Australia Day", "2026-09-28:King's Birthday"],
        "2027": ["2027-03-01:Labour Day", "2027-06-07:Western Australia Day", "2027-09-27:King's Birthday"]
      }
    },
    regionAliases: {
      "nsw": "New South Wales", "new south wales": "New South Wales", "sydney": "New South Wales",
      "vic": "Victoria", "victoria": "Victoria", "melbourne": "Victoria",
      "qld": "Queensland", "queensland": "Queensland", "brisbane": "Queensland",
      "wa": "Western Australia", "western australia": "Western Australia", "perth": "Western Australia",
      "sa": "South Australia", "south australia": "South Australia", "adelaide": "South Australia"
    }
  }
};

/**
 * Simulates an async fetch to a database or API.
 * In a real-world scenario, you could use dynamic imports here to split code:
 * e.g., const data = await import(`./holidays/${countryCode}.json`);
 */
export const fetchCountryData = async (country: string): Promise<CountryData | null> => {
    // Simulate network latency or file read time
    // await new Promise(resolve => setTimeout(resolve, 50));
    
    if (HOLIDAY_DB[country]) {
        return HOLIDAY_DB[country];
    }
    return null;
}