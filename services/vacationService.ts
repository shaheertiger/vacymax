import { UserPreferences, OptimizationResult, VacationBlock, OptimizationStrategy, TimeframeType, HolidayInfo, CountryData } from "../types";
import { fetchCountryData } from "./holidayData";

const DAILY_VALUE_USD = 460;

// --- BITMASKS FOR EFFICIENT STATE TRACKING ---
const FLAG_WEEKEND = 1 << 0;       // 0001
const FLAG_HOLIDAY = 1 << 1;       // 0010
const FLAG_BUDDY_HOLIDAY = 1 << 2; // 0100

// --- CACHING LAYER ---
class LRUCache<K, V> {
    private map: Map<K, V>;
    constructor(private capacity: number) {
        this.map = new Map();
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    get(key: K): V | undefined {
        const value = this.map.get(key);
        if (value === undefined) return undefined;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, value);
        if (this.map.size > this.capacity) {
            const oldestKey = this.map.keys().next().value;
            this.map.delete(oldestKey);
        }
    }
}

const holidaysMapCache = new LRUCache<string, Map<string, string>>(24);
const planCache = new LRUCache<string, OptimizationResult>(32);
const resolvedRegionCache = new LRUCache<string, string | undefined>(128);

// --- STRING POOL FOR ZERO-ALLOCATION LOOKUPS ---
class StringPool {
    private pool: string[] = [""]; // 0 is empty
    private map = new Map<string, number>();

    getId(str: string): number {
        let id = this.map.get(str);
        if (id === undefined) {
            id = this.pool.length;
            this.pool.push(str);
            this.map.set(str, id);
        }
        return id;
    }

    get(id: number): string {
        return this.pool[id] || "";
    }
}

export const getHolidayDescription = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('christmas')) return "Major holiday. Ideal for family.";
    if (n.includes('thanksgiving')) return "Perfect for travel.";
    if (n.includes('easter') || n.includes('good friday')) return "Great spring break.";
    if (n.includes('new year')) return "Fresh start.";
    if (n.includes('labor') || n.includes('labour')) return "End of summer.";
    if (n.includes('memorial') || n.includes('anzac') || n.includes('remembrance')) return "Day of reflection.";
    if (n.includes('independence') || n.includes('canada') || n.includes('australia')) return "National celebration.";
    return "Public Holiday. Extend for a break.";
};

const fastDateStr = (year: number, monthZeroIndexed: number, day: number): string => {
    const m = monthZeroIndexed + 1;
    return `${year}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
};

const normalizeToken = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const monthPad = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const dayPad = Array.from({length: 31}, (_, i) => (i+1).toString().padStart(2, '0'));

const levenshtein = (a: string, b: string): number => {
    const matrix = Array.from({ length: a.length + 1 }, () => []);
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      
                matrix[i][j - 1] + 1,      
                matrix[i - 1][j - 1] + cost 
            );
        }
    }
    return matrix[a.length][b.length];
};

const resolveRegion = (countryData: CountryData, inputRegion: string, countryName: string): string | undefined => {
    if (!inputRegion || !countryData.regions) return undefined;

    const cacheKey = `${countryName}:${inputRegion}`;
    const cachedRegion = resolvedRegionCache.get(cacheKey);
    if (cachedRegion !== undefined || resolvedRegionCache.has(cacheKey)) {
        return cachedRegion;
    }

    const cleanInput = normalizeToken(inputRegion);
    if (!cleanInput) {
        resolvedRegionCache.set(cacheKey, undefined);
        return undefined;
    }

    if (countryData.regionAliases) {
        const rawLower = inputRegion.toLowerCase().trim();
        const aliasMatch = countryData.regionAliases[rawLower] || countryData.regionAliases[cleanInput];
        if (aliasMatch) {
            resolvedRegionCache.set(cacheKey, aliasMatch);
            return aliasMatch;
        }
    }

    const regionKeys = Object.keys(countryData.regions);
    const normalizedRegions = regionKeys.map((key) => ({ key, normalized: normalizeToken(key) }));

    const exactMatch = normalizedRegions.find(({ normalized }) => normalized === cleanInput);
    if (exactMatch) {
        resolvedRegionCache.set(cacheKey, exactMatch.key);
        return exactMatch.key;
    }

    const prefixMatch = normalizedRegions.find(({ normalized }) => normalized.startsWith(cleanInput));
    if (prefixMatch) {
        resolvedRegionCache.set(cacheKey, prefixMatch.key);
        return prefixMatch.key;
    }

    const subMatch = normalizedRegions.find(({ normalized }) => normalized.includes(cleanInput));
    if (subMatch) {
        resolvedRegionCache.set(cacheKey, subMatch.key);
        return subMatch.key;
    }

    let bestMatch: string | undefined;
    let minDistance = Infinity;

    for (const { key, normalized } of normalizedRegions) {
        const dist = levenshtein(cleanInput, normalized);
        const threshold = cleanInput.length > 4 ? 3 : 2;

        if (dist <= threshold && dist < minDistance) {
            minDistance = dist;
            bestMatch = key;
        }
    }

    resolvedRegionCache.set(cacheKey, bestMatch);
    return bestMatch;
};

// Cached Holiday Map Fetcher
const getHolidaysMap = async (country: string, region: string, startYear: number, endYear: number): Promise<Map<string, string>> => {
    const cacheKey = `${country}|${region}|${startYear}|${endYear}`;
    const cached = holidaysMapCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const map = new Map<string, string>();
    if (!country) return map;

    const data = await fetchCountryData(country);
    if (!data) return map;

    for (let y = startYear; y <= endYear; y++) {
        const yStr = y.toString();
        const rawList = [...(data.federal[yStr] || [])];
        
        if (region) {
            const resolved = resolveRegion(data, region, country);
            if (resolved && data.regions && data.regions[resolved] && data.regions[resolved][yStr]) {
                rawList.push(...data.regions[resolved][yStr]);
            }
        }

        for (let i = 0; i < rawList.length; i++) {
            const parts = rawList[i].split(':');
            if (parts.length >= 2) {
                map.set(parts[0].trim(), parts[1].trim());
            }
        }
    }
    
    holidaysMapCache.set(cacheKey, map);
    return map;
};

// --- CORE ENGINE ---
export const generateVacationPlan = async (prefs: UserPreferences): Promise<OptimizationResult> => {
    // Check Cache
    const cacheKey = JSON.stringify(prefs);
    const cachedPlan = planCache.get(cacheKey);
    if (cachedPlan) {
        console.log("Serving plan from cache");
        return cachedPlan;
    }

    const now = new Date();
    let startYear = 2025;
    if (prefs.timeframe === TimeframeType.CALENDAR_2026) startYear = 2026;
    if (prefs.timeframe === TimeframeType.ROLLING_12) startYear = now.getFullYear();

    let startDate: Date, endDate: Date;
    if (prefs.timeframe === TimeframeType.ROLLING_12) {
        startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        endDate = new Date(startDate);
        endDate.setUTCDate(endDate.getUTCDate() + 365);
    } else {
        startDate = new Date(Date.UTC(startYear, 0, 1));
        endDate = new Date(Date.UTC(startYear, 11, 31));
    }

    const endYear = endDate.getUTCFullYear();
    const [holidays, buddyHolidays] = await Promise.all([
        getHolidaysMap(prefs.country, prefs.region, startYear, endYear),
        (prefs.hasBuddy && prefs.buddyCountry) 
            ? getHolidaysMap(prefs.buddyCountry, prefs.buddyRegion || '', startYear, endYear) 
            : Promise.resolve(null)
    ]);

    const msPerDay = 86400000;
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;
    
    const calendarFlags = new Uint8Array(totalDays);
    const holidayNameIds = new Uint16Array(totalDays);
    const buddyHolidayNameIds = new Uint16Array(totalDays);
    
    const ptoPrefix = new Uint16Array(totalDays + 1);
    const buddyPtoPrefix = new Uint16Array(totalDays + 1);
    const holidayScorePrefix = new Uint16Array(totalDays + 1);
    const holidayCountPrefix = new Uint16Array(totalDays + 1);
    const jointScorePrefix = new Uint16Array(totalDays + 1);
    
    const stringPool = new StringPool();

    const startTs = startDate.getTime();
    const startDayOfWeek = startDate.getUTCDay(); 

    let runningPtoCost = 0;
    let runningBuddyCost = 0;
    let runningHolidayScore = 0;
    let runningHolidayCount = 0;
    let runningJointScore = 0;

    let curY = startDate.getUTCFullYear();
    let curM = startDate.getUTCMonth(); 
    let curD = startDate.getUTCDate(); 

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

    // Optimized loop using manual date tracking to avoid Date creation overhead
    // Pre-allocate string padding arrays for faster concatenation
    for (let i = 0; i < totalDays; i++) {
        // Optimized date string generation (avoid multiple string concatenations)
        const dString = `${curY}-${monthPad[curM]}-${dayPad[curD-1]}`;

        const dayOfWeek = (startDayOfWeek + i) % 7;
        const isWknd = dayOfWeek === 0 || dayOfWeek === 6;

        let flags = 0;
        if (isWknd) flags |= FLAG_WEEKEND;

        const hName = holidays.get(dString);
        if (hName) {
            flags |= FLAG_HOLIDAY;
            holidayNameIds[i] = stringPool.getId(hName);
        }

        if (buddyHolidays) {
            const bName = buddyHolidays.get(dString);
            if (bName) {
                flags |= FLAG_BUDDY_HOLIDAY;
                buddyHolidayNameIds[i] = stringPool.getId(bName);
            }
        }

        calendarFlags[i] = flags;

        // Prefix Updates (optimized to minimize branches)
        const hasHoliday = !!(flags & FLAG_HOLIDAY);
        const hasBuddyHoliday = !!(flags & FLAG_BUDDY_HOLIDAY);

        if (!isWknd && !hasHoliday) runningPtoCost++;
        if (prefs.hasBuddy && !isWknd && !hasBuddyHoliday) runningBuddyCost++;

        if (hasHoliday || hasBuddyHoliday) {
            runningHolidayCount++;
            runningHolidayScore += 20;
        }

        if (hasHoliday && hasBuddyHoliday) {
            runningJointScore += 30;
        }

        // Batch prefix array writes (reduce memory bandwidth usage)
        const nextIdx = i + 1;
        ptoPrefix[nextIdx] = runningPtoCost;
        buddyPtoPrefix[nextIdx] = runningBuddyCost;
        holidayScorePrefix[nextIdx] = runningHolidayScore;
        holidayCountPrefix[nextIdx] = runningHolidayCount;
        jointScorePrefix[nextIdx] = runningJointScore;

        // Advance date
        const dim = curM === 1 && isLeap(curY) ? 29 : daysInMonth[curM];
        curD++;
        if (curD > dim) {
            curD = 1;
            curM++;
            if (curM > 11) {
                curM = 0;
                curY++;
            }
        }
    }

    const getStrategyConfig = (isRescue: boolean) => {
        if (isRescue) return { min: 2, max: 6, threshold: 0.0 };
        switch(prefs.strategy) {
            case OptimizationStrategy.LONG_WEEKENDS: return { min: 3, max: 6, threshold: 2.0 };
            case OptimizationStrategy.MINI_BREAKS: return { min: 3, max: 9, threshold: 1.5 };
            case OptimizationStrategy.WEEK_LONG: return { min: 5, max: 12, threshold: 1.8 };
            case OptimizationStrategy.EXTENDED: return { min: 9, max: 25, threshold: 1.2 };
            case OptimizationStrategy.BALANCED: return { min: 3, max: 18, threshold: 1.4 };
            default: return { min: 3, max: 14, threshold: 1.4 };
        }
    };

    interface Candidate {
        startIdx: number;
        len: number;
        ptoCost: number;
        buddyCost: number;
        efficiency: number;
        score: number;
    }

    const runScan = (isRescue: boolean): Candidate[] => {
        const { min, max, threshold } = getStrategyConfig(isRescue);
        const candidates: Candidate[] = [];
        const effThreshold = (!prefs.hasBuddy && !isRescue) ? threshold + 0.2 : threshold;

        for (let i = 0; i <= totalDays - min; i++) {
            for (let len = min; len <= max; len++) {
                const endIdx = i + len;
                if (endIdx > totalDays) break;

                const ptoCost = ptoPrefix[endIdx] - ptoPrefix[i];
                const buddyCost = prefs.hasBuddy ? (buddyPtoPrefix[endIdx] - buddyPtoPrefix[i]) : 0;

                const combinedCost = ptoCost + buddyCost;
                const gain = len * (prefs.hasBuddy ? 2 : 1);
                const efficiency = combinedCost === 0 ? 100 : gain / combinedCost;

                if (combinedCost === 0 || efficiency >= effThreshold) {
                    const holidayBonusScore = holidayScorePrefix[endIdx] - holidayScorePrefix[i];
                    const holidayCount = holidayCountPrefix[endIdx] - holidayCountPrefix[i];
                    const jointBonus = jointScorePrefix[endIdx] - jointScorePrefix[i];

                    let score = (efficiency * efficiency) + (efficiency * 5) + holidayBonusScore + jointBonus;
                    
                    if (ptoCost === 0 && (!prefs.hasBuddy || buddyCost === 0)) {
                        score += 5000; 
                        if (holidayCount > 0) score += 1000;
                    } else if (prefs.hasBuddy && (ptoCost === 0 || buddyCost === 0)) {
                        score += 500;
                    }

                    if (prefs.strategy === OptimizationStrategy.LONG_WEEKENDS && len <= 5) score += 50;
                    if (prefs.strategy === OptimizationStrategy.EXTENDED && len >= 9) score += 40;

                    const startDay = (startDayOfWeek + i) % 7;
                    const endDay = (startDayOfWeek + (endIdx - 1)) % 7;
                    if (startDay === 5) score += 20; 
                    if (endDay === 0 || endDay === 1) score += 15;

                    candidates.push({ startIdx: i, len, ptoCost, buddyCost, efficiency, score });
                }
            }
        }
        return candidates;
    };

    let candidates = runScan(false);
    if (candidates.length === 0) {
        console.log("No optimal blocks found, running rescue pass...");
        candidates = runScan(true);
    }

    candidates.sort((a, b) => b.score - a.score);

    const selectedBlocks: VacationBlock[] = [];
    const occupied = new Uint8Array(totalDays); 
    let remainingPto = prefs.ptoDays;
    let remainingBuddyPto = prefs.buddyPtoDays || 0;

    const MAX_BLOCKS = 40; 
    let blockCount = 0;

    for (const cand of candidates) {
        if (blockCount >= MAX_BLOCKS) break;
        
        if (cand.ptoCost > 0 && remainingPto < cand.ptoCost) continue;
        if (prefs.hasBuddy && cand.buddyCost > 0 && remainingBuddyPto < cand.buddyCost) continue;

        let overlap = false;
        const endIdx = cand.startIdx + cand.len;
        for (let k = cand.startIdx; k < endIdx; k++) {
            if (occupied[k] === 1) { overlap = true; break; }
        }
        if (overlap) continue;

        remainingPto -= cand.ptoCost;
        if (prefs.hasBuddy) remainingBuddyPto -= cand.buddyCost;
        for (let k = cand.startIdx; k < endIdx; k++) occupied[k] = 1;

        const bStart = new Date(startTs + (cand.startIdx * msPerDay));
        const bEnd = new Date(startTs + ((endIdx - 1) * msPerDay));

        const holidaysUsed: HolidayInfo[] = [];
        for (let k = cand.startIdx; k < endIdx; k++) {
            const hid = holidayNameIds[k];
            const bid = buddyHolidayNameIds[k];
            
            if (hid > 0) {
                const d = new Date(startTs + (k * msPerDay));
                holidaysUsed.push({ 
                    date: fastDateStr(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), 
                    name: stringPool.get(hid) 
                });
            } else if (bid > 0) {
                const d = new Date(startTs + (k * msPerDay));
                holidaysUsed.push({ 
                    date: fastDateStr(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), 
                    name: `${stringPool.get(bid)} (Buddy)` 
                });
            }
        }

        let desc = "Vacation";
        const mainHoliday = holidaysUsed.length > 0 ? holidaysUsed[0].name.split(' (')[0].split(':')[0] : null;
        
        if (mainHoliday) {
            if (cand.efficiency >= 3.5 && cand.len >= 9) desc = `${mainHoliday} Mega Bridge`;
            else if (cand.efficiency >= 2.5) desc = `${mainHoliday} Super Bridge`;
            else desc = `${mainHoliday} Break`;
        } else {
            if (cand.len <= 4) desc = "Long Weekend";
            else if (cand.len <= 6) desc = "Mini-Getaway";
            else if (cand.len <= 9) desc = "Week-Long Recharge";
            else desc = "Extended Vacation";
        }

        selectedBlocks.push({
            id: Math.random().toString(36).substr(2, 9),
            startDate: fastDateStr(bStart.getUTCFullYear(), bStart.getUTCMonth(), bStart.getUTCDate()),
            endDate: fastDateStr(bEnd.getUTCFullYear(), bEnd.getUTCMonth(), bEnd.getUTCDate()),
            totalDaysOff: cand.len,
            ptoDaysUsed: cand.ptoCost,
            buddyPtoDaysUsed: prefs.hasBuddy ? cand.buddyCost : undefined,
            publicHolidaysUsed: holidaysUsed,
            description: desc,
            efficiencyScore: cand.efficiency,
            monetaryValue: (cand.len - cand.ptoCost) * DAILY_VALUE_USD
        });
        
        blockCount++;
    }

    selectedBlocks.sort((a, b) => a.startDate.localeCompare(b.startDate));

    const totalDaysOff = selectedBlocks.reduce((sum, b) => sum + b.totalDaysOff, 0);
    const usedPto = prefs.ptoDays - remainingPto;
    const usedBuddyPto = prefs.hasBuddy ? (prefs.buddyPtoDays! - remainingBuddyPto) : undefined;
    const freeDays = totalDaysOff - usedPto;

    let planName = `Optimal ${prefs.strategy} Plan`;
    if (selectedBlocks.length > 8) {
        planName = `The "Max Freedom" ${prefs.strategy} Plan`;
    } else if (selectedBlocks.length > 0 && freeDays > usedPto * 2) {
        planName = "High-Efficiency Vacation Strategy";
    } else if (prefs.hasBuddy) {
        planName = "The Ultimate Couples' Calendar";
    } else if (prefs.strategy === OptimizationStrategy.LONG_WEEKENDS) {
        planName = `${selectedBlocks.length}-Trip Recharge Plan`;
    }

    const result = {
        planName,
        targetYear: startYear,
        timelineStartDate: startDate.toISOString(),
        totalPtoUsed: usedPto,
        totalPtoUsedBuddy: usedBuddyPto,
        totalDaysOff,
        totalFreeDays: freeDays,
        totalValueRecovered: freeDays * DAILY_VALUE_USD,
        vacationBlocks: selectedBlocks,
        summary: `Found ${selectedBlocks.length} optimized blocks.`
    };

    // Store in Cache
    planCache.set(cacheKey, result);
    return result;
};