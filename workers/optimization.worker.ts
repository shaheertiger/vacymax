
import { UserPreferences, OptimizationResult, VacationBlock, OptimizationStrategy, TimeframeType, HolidayInfo, CountryData } from "../types";
import { fetchCountryData } from "../services/holidayData";

const DAILY_VALUE_USD = 460;

// --- INPUT VALIDATION ---
const validatePrefs = (prefs: UserPreferences): UserPreferences => {
    return {
        ptoDays: Math.max(0, Math.min(365, Math.floor(prefs.ptoDays || 0))),
        timeframe: prefs.timeframe || TimeframeType.CALENDAR_2025,
        strategy: prefs.strategy || OptimizationStrategy.BALANCED,
        country: (prefs.country || '').trim(),
        region: (prefs.region || '').trim(),
        hasBuddy: Boolean(prefs.hasBuddy),
        buddyPtoDays: prefs.hasBuddy ? Math.max(0, Math.min(365, Math.floor(prefs.buddyPtoDays || 0))) : 0,
        buddyCountry: prefs.hasBuddy ? (prefs.buddyCountry || '').trim() : '',
        buddyRegion: prefs.hasBuddy ? (prefs.buddyRegion || '').trim() : '',
    };
};

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

const fastDateStr = (year: number, monthZeroIndexed: number, day: number): string => {
    const m = monthZeroIndexed + 1;
    return `${year}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
};

const normalizeToken = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const monthPad = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const dayPad = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const levenshtein = (a: string, b: string): number => {
    const lenA = a.length;
    const lenB = b.length;
    if (lenA === 0) return lenB;
    if (lenB === 0) return lenA;

    let prev = new Uint16Array(lenB + 1);
    let curr = new Uint16Array(lenB + 1);

    for (let j = 0; j <= lenB; j++) prev[j] = j;

    for (let i = 1; i <= lenA; i++) {
        curr[0] = i;
        const ai = a.charCodeAt(i - 1);
        for (let j = 1; j <= lenB; j++) {
            const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
            const deletion = prev[j] + 1;
            const insertion = curr[j - 1] + 1;
            const substitution = prev[j - 1] + cost;
            curr[j] = deletion < insertion ? (deletion < substitution ? deletion : substitution) : (insertion < substitution ? insertion : substitution);
        }
        const swap = prev; prev = curr; curr = swap;
    }

    return prev[lenB];
};

type NormalizedRegions = { entries: { key: string; normalized: string }[]; exactMap: Map<string, string> };
const normalizedRegionCache = new WeakMap<CountryData, NormalizedRegions>();

const getNormalizedRegions = (countryData: CountryData): NormalizedRegions | undefined => {
    if (!countryData.regions) return undefined;

    let cached = normalizedRegionCache.get(countryData);
    if (cached) return cached;

    const entries: { key: string; normalized: string }[] = [];
    const exactMap = new Map<string, string>();
    for (const key of Object.keys(countryData.regions)) {
        const normalized = normalizeToken(key);
        entries.push({ key, normalized });
        if (!exactMap.has(normalized)) {
            exactMap.set(normalized, key);
        }
    }

    cached = { entries, exactMap };
    normalizedRegionCache.set(countryData, cached);
    return cached;
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

    const normalizedRegions = getNormalizedRegions(countryData);
    if (!normalizedRegions) {
        resolvedRegionCache.set(cacheKey, undefined);
        return undefined;
    }

    const exactMatch = normalizedRegions.exactMap.get(cleanInput);
    if (exactMatch) {
        resolvedRegionCache.set(cacheKey, exactMatch);
        return exactMatch;
    }

    for (const { key, normalized } of normalizedRegions.entries) {
        if (normalized.startsWith(cleanInput)) {
            resolvedRegionCache.set(cacheKey, key);
            return key;
        }
    }

    for (const { key, normalized } of normalizedRegions.entries) {
        if (normalized.includes(cleanInput)) {
            resolvedRegionCache.set(cacheKey, key);
            return key;
        }
    }

    let bestMatch: string | undefined;
    let minDistance = Infinity;

    for (const { key, normalized } of normalizedRegions.entries) {
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

    const resolvedRegion = region ? resolveRegion(data, region, country) : undefined;
    for (let y = startYear; y <= endYear; y++) {
        const yStr = y.toString();
        const rawList: string[] = [];

        const federal = data.federal[yStr];
        if (federal && federal.length > 0) rawList.push(...federal);

        if (resolvedRegion) {
            const regionYears = data.regions?.[resolvedRegion]?.[yStr];
            if (regionYears && regionYears.length > 0) rawList.push(...regionYears);
        }

        for (let i = 0; i < rawList.length; i++) {
            const entry = rawList[i];
            const sepIdx = entry.indexOf(':');
            if (sepIdx <= 0 || sepIdx === entry.length - 1) continue;

            const date = entry.slice(0, sepIdx).trim();
            const name = entry.slice(sepIdx + 1).trim();
            if (date && name) map.set(date, name);
        }
    }

    holidaysMapCache.set(cacheKey, map);
    return map;
};

// --- CORE ENGINE ---
const generateVacationPlan = async (rawPrefs: UserPreferences): Promise<OptimizationResult> => {
    // Validate and sanitize inputs
    const prefs = validatePrefs(rawPrefs);

    // Check Cache
    const cacheKey = JSON.stringify(prefs);
    const cachedPlan = planCache.get(cacheKey);
    if (cachedPlan) {
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

    for (let i = 0; i < totalDays; i++) {
        const dString = `${curY}-${monthPad[curM]}-${dayPad[curD - 1]}`;

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

        const nextIdx = i + 1;
        ptoPrefix[nextIdx] = runningPtoCost;
        buddyPtoPrefix[nextIdx] = runningBuddyCost;
        holidayScorePrefix[nextIdx] = runningHolidayScore;
        holidayCountPrefix[nextIdx] = runningHolidayCount;
        jointScorePrefix[nextIdx] = runningJointScore;

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
        switch (prefs.strategy) {
            case OptimizationStrategy.LONG_WEEKENDS: return { min: 3, max: 6, threshold: 2.0 };
            case OptimizationStrategy.MINI_BREAKS: return { min: 3, max: 9, threshold: 1.5 };
            case OptimizationStrategy.WEEK_LONG: return { min: 5, max: 12, threshold: 1.8 };
            case OptimizationStrategy.EXTENDED: return { min: 9, max: 25, threshold: 1.2 };
            case OptimizationStrategy.BALANCED: return { min: 3, max: 18, threshold: 1.4 };
            default: return { min: 3, max: 14, threshold: 1.4 };
        }
    };

    // SoA (Structure of Arrays) container
    class CandidateList {
        startIdx: Int32Array;
        len: Int32Array;
        ptoCost: Int32Array;
        buddyCost: Int32Array;
        efficiency: Float32Array;
        score: Float32Array;
        count: number;
        capacity: number;

        constructor(initialCapacity: number) {
            this.capacity = initialCapacity;
            this.count = 0;
            this.startIdx = new Int32Array(this.capacity);
            this.len = new Int32Array(this.capacity);
            this.ptoCost = new Int32Array(this.capacity);
            this.buddyCost = new Int32Array(this.capacity);
            this.efficiency = new Float32Array(this.capacity);
            this.score = new Float32Array(this.capacity);
        }

        add(startIdx: number, len: number, ptoCost: number, buddyCost: number, efficiency: number, score: number) {
            if (this.count >= this.capacity) this.grow();
            const i = this.count;
            this.startIdx[i] = startIdx;
            this.len[i] = len;
            this.ptoCost[i] = ptoCost;
            this.buddyCost[i] = buddyCost;
            this.efficiency[i] = efficiency;
            this.score[i] = score;
            this.count++;
        }

        grow() {
            this.capacity *= 2;
            const newStart = new Int32Array(this.capacity); newStart.set(this.startIdx); this.startIdx = newStart;
            const newLen = new Int32Array(this.capacity); newLen.set(this.len); this.len = newLen;
            const newPto = new Int32Array(this.capacity); newPto.set(this.ptoCost); this.ptoCost = newPto;
            const newBuddy = new Int32Array(this.capacity); newBuddy.set(this.buddyCost); this.buddyCost = newBuddy;
            const newEff = new Float32Array(this.capacity); newEff.set(this.efficiency); this.efficiency = newEff;
            const newScore = new Float32Array(this.capacity); newScore.set(this.score); this.score = newScore;
        }

        getSortedIndices(): Int32Array {
            const indices = new Int32Array(this.count);
            for (let i = 0; i < this.count; i++) indices[i] = i;
            // Sort by score descending
            indices.sort((a, b) => this.score[b] - this.score[a]);
            return indices;
        }
    }

    const runScan = (isRescue: boolean): CandidateList => {
        const { min, max, threshold } = getStrategyConfig(isRescue);
        const candidates = new CandidateList(1024);
        const hasBuddy = prefs.hasBuddy;
        const gainFactor = hasBuddy ? 2 : 1;
        const effThreshold = (!hasBuddy && !isRescue) ? threshold + 0.2 : threshold;
        const maxStart = totalDays - min;

        for (let i = 0; i <= maxStart; i++) {
            const maxWindow = Math.min(max, totalDays - i);
            const startDay = (startDayOfWeek + i) % 7;

            for (let len = min; len <= maxWindow; len++) {
                const endIdx = i + len;
                const ptoCost = ptoPrefix[endIdx] - ptoPrefix[i];
                const buddyCost = hasBuddy ? (buddyPtoPrefix[endIdx] - buddyPtoPrefix[i]) : 0;
                const combinedCost = ptoCost + buddyCost;

                const gain = len * gainFactor;
                const efficiency = combinedCost === 0 ? 100 : gain / combinedCost;

                if (combinedCost === 0 || efficiency >= effThreshold) {
                    const holidayBonusScore = holidayScorePrefix[endIdx] - holidayScorePrefix[i];
                    const holidayCount = holidayCountPrefix[endIdx] - holidayCountPrefix[i];
                    const jointBonus = jointScorePrefix[endIdx] - jointScorePrefix[i];

                    let score = (efficiency * efficiency) + (efficiency * 5) + holidayBonusScore + jointBonus;

                    if (ptoCost === 0 && (!hasBuddy || buddyCost === 0)) {
                        score += 5000;
                        if (holidayCount > 0) score += 1000;
                    } else if (hasBuddy && (ptoCost === 0 || buddyCost === 0)) {
                        score += 500;
                    }

                    if (prefs.strategy === OptimizationStrategy.LONG_WEEKENDS && len <= 5) score += 50;
                    if (prefs.strategy === OptimizationStrategy.EXTENDED && len >= 9) score += 40;

                    const endDay = (startDay + (len - 1)) % 7;
                    if (startDay === 5) score += 20;
                    if (endDay === 0 || endDay === 1) score += 15;

                    candidates.add(i, len, ptoCost, buddyCost, efficiency, score);
                }
            }
        }
        return candidates;
    };

    let candidates = runScan(false);
    if (candidates.count === 0) {
        candidates = runScan(true);
    }

    // Super rescue: For users with 0 PTO, prioritize finding free blocks only
    // Also helps when holiday data is sparse
    if (prefs.ptoDays === 0) {
        // Filter to only include 0-PTO-cost blocks for 0 PTO users
        const freeCandidates = new CandidateList(256);
        for (let i = 0; i < candidates.count; i++) {
            if (candidates.ptoCost[i] === 0) {
                freeCandidates.add(
                    candidates.startIdx[i],
                    candidates.len[i],
                    candidates.ptoCost[i],
                    candidates.buddyCost[i],
                    candidates.efficiency[i],
                    candidates.score[i]
                );
            }
        }
        // Only use filtered list if it has results
        if (freeCandidates.count > 0) {
            candidates = freeCandidates;
        }
    }

    // --- SELECTION LOGIC (GREEDY KNAPSACK) ---
    const generatePlanFromOrder = (indices: Int32Array): { blocks: VacationBlock[], totalDays: number, totalValue: number } => {
        const selected: VacationBlock[] = [];
        const occupied = new Uint8Array(totalDays);
        let remPto = prefs.ptoDays;
        let remBuddy = prefs.buddyPtoDays || 0;
        let tDays = 0;
        let tVal = 0;

        for (let i = 0; i < candidates.count; i++) {
            if (selected.length >= 40) break;

            const idx = indices[i];
            const cStart = candidates.startIdx[idx];
            const cLen = candidates.len[idx];
            const cPto = candidates.ptoCost[idx];
            const cBuddy = candidates.buddyCost[idx];

            if (cPto > 0 && remPto < cPto) continue;
            if (prefs.hasBuddy && cBuddy > 0 && remBuddy < cBuddy) continue;

            let overlap = false;
            const cEnd = cStart + cLen;
            for (let k = cStart; k < cEnd; k++) {
                if (occupied[k] === 1) { overlap = true; break; }
            }
            if (overlap) continue;

            remPto -= cPto;
            if (prefs.hasBuddy) remBuddy -= cBuddy;
            for (let k = cStart; k < cEnd; k++) occupied[k] = 1;
            tDays += cLen;

            // Hydrate Block Data
            const bStart = new Date(startTs + (cStart * msPerDay));
            const bEnd = new Date(startTs + ((cEnd - 1) * msPerDay));

            const holidaysUsed: HolidayInfo[] = [];
            for (let k = cStart; k < cEnd; k++) {
                const hid = holidayNameIds[k];
                const bid = buddyHolidayNameIds[k];
                if (hid > 0) {
                    const d = new Date(startTs + (k * msPerDay));
                    holidaysUsed.push({ date: fastDateStr(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), name: stringPool.get(hid) });
                } else if (bid > 0) {
                    const d = new Date(startTs + (k * msPerDay));
                    holidaysUsed.push({ date: fastDateStr(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), name: `${stringPool.get(bid)} (Buddy)` });
                }
            }

            let desc = "Vacation";
            const mainHoliday = holidaysUsed.length > 0 ? holidaysUsed[0].name.split(' (')[0].split(':')[0] : null;
            const cEff = candidates.efficiency[idx];

            if (mainHoliday) {
                if (cEff >= 3.5 && cLen >= 9) desc = `${mainHoliday} Mega Bridge`;
                else if (cEff >= 2.5) desc = `${mainHoliday} Super Bridge`;
                else desc = `${mainHoliday} Break`;
            } else {
                if (cLen <= 4) desc = "Long Weekend";
                else if (cLen <= 6) desc = "Mini-Getaway";
                else if (cLen <= 9) desc = "Week-Long Recharge";
                else desc = "Extended Vacation";
            }

            const val = (cLen - cPto) * DAILY_VALUE_USD;
            tVal += val;

            selected.push({
                id: Math.random().toString(36).substr(2, 9),
                startDate: fastDateStr(bStart.getUTCFullYear(), bStart.getUTCMonth(), bStart.getUTCDate()),
                endDate: fastDateStr(bEnd.getUTCFullYear(), bEnd.getUTCMonth(), bEnd.getUTCDate()),
                totalDaysOff: cLen,
                ptoDaysUsed: cPto,
                buddyPtoDaysUsed: prefs.hasBuddy ? cBuddy : undefined,
                publicHolidaysUsed: holidaysUsed,
                description: desc,
                efficiencyScore: cEff,
                monetaryValue: val
            });
        }
        return { blocks: selected, totalDays: tDays, totalValue: tVal };
    };

    // --- STRATEGY TOURNAMENT ---
    // 1. Balanced (Default Score)
    const indicesBalanced = candidates.getSortedIndices(); // Uses internal score

    // 2. Long Haul (Prioritize Duration, then Score)
    const indicesDuration = new Int32Array(candidates.count);
    for (let i = 0; i < candidates.count; i++) indicesDuration[i] = i;
    indicesDuration.sort((a, b) => {
        // Bias heavily towards length, but use score as tiebreaker
        const lenDiff = candidates.len[b] - candidates.len[a];
        if (lenDiff !== 0) return lenDiff;
        return candidates.score[b] - candidates.score[a];
    });

    // 3. Efficiency Max (Prioritize ROI)
    const indicesEfficiency = new Int32Array(candidates.count);
    for (let i = 0; i < candidates.count; i++) indicesEfficiency[i] = i;
    indicesEfficiency.sort((a, b) => candidates.efficiency[b] - candidates.efficiency[a]);

    // Run simulations
    const planBalanced = generatePlanFromOrder(indicesBalanced);
    const planDuration = generatePlanFromOrder(indicesDuration);
    const planEfficiency = generatePlanFromOrder(indicesEfficiency);

    // Pick Winner (Prioritize Total Days Off, then Value)
    let winner = planBalanced;
    let strategyName = "Balanced";

    // Duration strategy wins if it finds more days or equal days with less fragmentation
    if (planDuration.totalDays > winner.totalDays) {
        winner = planDuration;
        strategyName = "Duration-Max";
    }

    // Efficiency strategy wins if it finds significantly more days (rare) or same days with less PTO (higher value)
    if (planEfficiency.totalDays > winner.totalDays) {
        winner = planEfficiency;
        strategyName = "Efficiency-Max";
    }

    const selectedBlocks = winner.blocks;
    selectedBlocks.sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Handle empty results gracefully with better guidance
    if (selectedBlocks.length === 0) {
        let suggestion = 'Try increasing your PTO days or selecting a different strategy.';
        if (prefs.ptoDays === 0) {
            suggestion = 'Add at least 1-2 PTO days to unlock smart bridge opportunities with holidays.';
        } else if (!prefs.country) {
            suggestion = 'Select your country to see public holidays that can extend your vacations.';
        } else if (prefs.ptoDays < 5) {
            suggestion = 'Try the "Long Weekends" strategy for better results with fewer PTO days.';
        }

        const emptyResult: OptimizationResult = {
            planName: "No Opportunities Found",
            targetYear: startYear,
            timelineStartDate: startDate.toISOString(),
            totalPtoUsed: 0,
            totalPtoUsedBuddy: prefs.hasBuddy ? 0 : undefined,
            totalDaysOff: 0,
            totalFreeDays: 0,
            totalValueRecovered: 0,
            vacationBlocks: [],
            summary: suggestion
        };
        planCache.set(cacheKey, emptyResult);
        return emptyResult;
    }

    const totalDaysOff = winner.totalDays;
    const usedPto = selectedBlocks.reduce((sum, b) => sum + b.ptoDaysUsed, 0);
    const usedBuddyPto = prefs.hasBuddy ? selectedBlocks.reduce((sum, b) => sum + (b.buddyPtoDaysUsed || 0), 0) : undefined;
    const freeDays = totalDaysOff - usedPto;

    let planName = `Optimal ${prefs.strategy} Plan`;
    if (strategyName === "Duration-Max") planName = `The "Grand Tour" ${prefs.strategy} Plan`;
    if (selectedBlocks.length > 8 && strategyName === "Balanced") planName = `The "Max Freedom" ${prefs.strategy} Plan`;
    else if (freeDays > usedPto * 2.5) planName = "High-Efficiency Hacker Strategy";
    else if (prefs.hasBuddy) planName = "The Ultimate Couples' Calendar";

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
        summary: `Found ${selectedBlocks.length} optimized blocks using ${strategyName} logic.`
    };

    planCache.set(cacheKey, result);
    return result;
};

// --- WORKER EVENT LISTENER ---
self.onmessage = async (e: MessageEvent) => {
    const { id, prefs } = e.data;
    try {
        const result = await generateVacationPlan(prefs);
        self.postMessage({ id, success: true, result });
    } catch (error) {
        self.postMessage({ id, success: false, error: (error as any).message });
    }
};
