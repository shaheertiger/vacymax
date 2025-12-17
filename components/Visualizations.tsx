import React, { useMemo, useState } from 'react';
import { HolidayInfo, VacationBlock } from '../types';
import { getHolidayDescription } from '../services/vacationService';
import { formatDate, parseDateUTC } from '../services/utils';

export const HolidayTooltip: React.FC<{ holiday: HolidayInfo }> = ({ holiday }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [clickedOpen, setClickedOpen] = useState(false);
    const desc = getHolidayDescription(holiday.name);

    const handleClick = () => {
        if (isOpen && clickedOpen) {
            setIsOpen(false);
            setClickedOpen(false);
        } else {
            setIsOpen(true);
            setClickedOpen(true);
        }
    };

    const handleMouseEnter = () => {
        if (!clickedOpen) setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (!clickedOpen) setIsOpen(false);
    };

    return (
        <div
            className={`group relative inline-block transition-all ${isOpen ? 'z-[200]' : 'z-10'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            <span className="cursor-help text-[10px] font-bold bg-lavender-50 text-lavender-accent border border-lavender-100 px-2 py-1 rounded uppercase tracking-wider hover:bg-lavender-100 transition-colors shadow-sm">
                {holiday.name}
            </span>
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 transition-all duration-200 pointer-events-none ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                <div className="bg-white border border-rose-100 p-3 rounded-lg shadow-xl text-xs text-center backdrop-blur-md relative z-50">
                    <div className="font-bold text-gray-800 mb-1">{formatDate(holiday.date)}</div>
                    <div className="text-gray-500 leading-tight">{desc}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-rose-100"></div>
                </div>
            </div>
        </div>
    )
}

export const EfficiencyGauge: React.FC<{ multiplier: number, isJoint?: boolean, isInfinite?: boolean }> = ({ multiplier, isJoint, isInfinite }) => {
    const displayMultiplier = isInfinite ? 10 : multiplier;
    const percentage = Math.min(100, Math.max(0, (displayMultiplier - 1) / 4 * 100));

    return (
        <div className="bg-white border border-rose-100 rounded-2xl p-6 h-full min-h-[220px] relative overflow-hidden flex flex-col items-center justify-center text-center shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-peach-accent via-rose-accent to-lavender-accent"></div>

            <div className="relative w-32 h-16 mt-4 mb-2 overflow-hidden">
                <div className="absolute w-32 h-32 rounded-full border-[12px] border-rose-50 top-0 left-0 box-border"></div>
                <div
                    className="absolute w-32 h-32 rounded-full border-[12px] border-rose-accent border-b-transparent border-r-transparent top-0 left-0 box-border transition-all duration-1000 ease-out origin-center"
                    style={{ transform: `rotate(${45 + (percentage * 1.8)}deg)` }}
                ></div>
            </div>

            <div className="relative z-10 -mt-8">
                <div className="text-4xl font-display font-bold text-gray-800">
                    {isInfinite ? '∞' : `${multiplier.toFixed(1)}x`}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Smart Multiplier</div>
            </div>

            <p className="text-xs text-gray-500 mt-4 max-w-[180px]">
                {isJoint
                    ? 'Total combined efficiency.'
                    : isInfinite
                        ? 'Free vacation! No PTO days used.'
                        : `For every 1 day of PTO, you get ${multiplier.toFixed(1)} days of vacation.`
                }
            </p>
        </div>
    )
}

export const DistributionChart: React.FC<{ pto: number, free: number }> = ({ pto, free }) => {
    const total = pto + free;
    const ptoPct = total > 0 ? (pto / total) * 100 : 0;

    return (
        <div className="bg-white border border-rose-100 rounded-2xl p-6 h-full flex flex-col justify-between shadow-sm">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Total Breakdown</h4>

            <div className="flex gap-4 items-end h-32 px-4 pb-2 justify-center">
                <div className="w-16 flex flex-col items-center gap-2 group cursor-help">
                    <span className="text-xs font-bold text-gray-400 opacity-100 transition-opacity">{pto}d</span>
                    <div className="w-full bg-gray-200 rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max(ptoPct, 5)}%` }}>
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Used</span>
                </div>

                <div className="w-16 flex flex-col items-center gap-2 group cursor-help">
                    <span className="text-xs font-bold text-rose-accent opacity-100 transition-opacity">+{free}d</span>
                    <div className="w-full bg-rose-accent rounded-t-lg shadow-[0_0_20px_rgba(244,63,94,0.3)] relative overflow-hidden" style={{ height: `100%` }}>
                        <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-accent uppercase">Free</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-rose-50 flex justify-between text-xs">
                <span className="text-gray-400">Total Bonus:</span>
                <span className="text-gray-800 font-bold">{total > 0 && pto > 0 ? ((free / pto) * 100).toFixed(0) : (free > 0 ? '∞' : 0)}%</span>
            </div>
        </div>
    )
}

// Data structure for rendered month grid
type DayStatus = { type: 'pto' | 'holiday' | 'weekend' | 'locked', name?: string, blockId?: string, isStart?: boolean };
type DayStatusMap = Map<string, DayStatus>; // Key: YYYY-MM-DD

export const MonthGrid: React.FC<{ year: number, month: number, statusMap: DayStatusMap, holidaysList: { day: number, name: string }[], hideDates?: boolean }> = React.memo(({ year, month, statusMap, holidaysList, hideDates }) => {
    const [activeDay, setActiveDay] = useState<number | null>(null);
    const [clickedDay, setClickedDay] = useState<number | null>(null);

    const date = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const startDay = date.getUTCDay(); // 0 = Sun
    const monthName = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const handleDayClick = (day: number) => {
        if (activeDay === day && clickedDay === day) {
            setActiveDay(null);
            setClickedDay(null);
        } else {
            setActiveDay(day);
            setClickedDay(day);
        }
    };

    const handleDayMouseEnter = (day: number) => {
        if (clickedDay === null) {
            setActiveDay(day);
        }
    };

    const handleDayMouseLeave = () => {
        if (clickedDay === null) {
            setActiveDay(null);
        }
    };

    return (
        <div className="space-y-2 w-[160px] flex-shrink-0 select-none snap-start relative z-10 flex flex-col">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-rose-100 pb-1">{monthName}</div>

            <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((d, i) => (
                    <div key={i} className="text-[9px] text-center text-gray-400 font-bold">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-4 h-4"></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const status = statusMap.get(dateStr);
                    const isHovered = activeDay === day;

                    let bgClass = "bg-gray-100 border border-transparent";
                    if (status?.type === 'pto') bgClass = "bg-rose-accent border-rose-accent shadow-md scale-110 ring-1 ring-rose-200";
                    if (status?.type === 'holiday') bgClass = "bg-lavender-accent border-lavender-accent shadow-md scale-110 ring-1 ring-lavender-200";
                    if (status?.type === 'weekend') bgClass = "bg-rose-50/50 border-transparent";
                    if (status?.type === 'locked') bgClass = "bg-gray-200 opacity-50 border border-gray-300 striped-bg";

                    return (
                        <div
                            key={day}
                            onMouseEnter={() => handleDayMouseEnter(day)}
                            onMouseLeave={handleDayMouseLeave}
                            onClick={() => handleDayClick(day)}
                            className={`w-4 h-4 rounded-full ${bgClass} group relative cursor-default transition-all duration-300 ${isHovered ? 'z-[200] scale-125' : 'hover:z-[100] active:z-[100]'}`}
                        >
                            {/* Start Marker */}
                            {status?.isStart && !['locked', 'weekend'].includes(status.type) && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm z-20 ring-1 ring-gray-200"></div>
                            )}

                            {status && !['locked', 'weekend'].includes(status.type) && isHovered && !hideDates && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[140px] pointer-events-none z-[200] animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-rose-100 shadow-xl whitespace-normal text-center relative">
                                        {status.name}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-rose-100"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {holidaysList.length > 0 && (
                <div className="mt-auto pt-2 space-y-1">
                    {holidaysList.slice(0, 2).map((h, i) => (
                        <div key={i} className="flex items-start gap-1 text-[9px] text-gray-400 leading-tight">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-accent mt-0.5 flex-shrink-0"></div>
                            <span>{hideDates ? 'Public Holiday' : h.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
});

export const YearTimeline: React.FC<{ blocks: VacationBlock[], isLocked: boolean, timelineStartDate?: string, targetYear: number, viewMode?: 'joint' | 'solo', hideDates?: boolean }> = ({ blocks, isLocked, timelineStartDate, targetYear, viewMode, hideDates }) => {
    // Determine the start date object. Use UTC.
    const start = timelineStartDate
        ? new Date(timelineStartDate)
        : new Date(Date.UTC(targetYear, 0, 1));

    const startMonth = start.getUTCMonth();
    const startYear = start.getUTCFullYear();

    // 1. Generate month sequence
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => {
        const d = new Date(Date.UTC(startYear, startMonth + i, 1));
        return { month: d.getUTCMonth(), year: d.getUTCFullYear() };
    }), [startYear, startMonth]);

    // 2. Pre-calculate global status map for ALL visible blocks (Performance Opt)
    const { globalStatusMap, monthHolidays } = useMemo(() => {
        const map: DayStatusMap = new Map();
        const holidaysByMonth: Record<string, { day: number, name: string }[]> = {};

        blocks.forEach((b, idx) => {
            const isBlockLocked = isLocked && idx > 0;
            const start = parseDateUTC(b.startDate);
            const end = parseDateUTC(b.endDate);
            let curr = new Date(start.getTime());

            while (curr.getTime() <= end.getTime()) {
                const year = curr.getUTCFullYear();
                const month = curr.getUTCMonth();
                const day = curr.getUTCDate();
                const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const monthKey = `${year}-${month}`;

                const isHoliday = b.publicHolidaysUsed.find(h => h.date === dateStr);
                const isWeekend = curr.getUTCDay() === 0 || curr.getUTCDay() === 6;

                let type: 'pto' | 'holiday' | 'weekend' | 'locked' = 'pto';

                if (isBlockLocked) {
                    type = 'locked';
                } else if (isHoliday) {
                    type = 'holiday';
                    if (!holidaysByMonth[monthKey]) holidaysByMonth[monthKey] = [];
                    // Avoid duplicates
                    if (!holidaysByMonth[monthKey].some(h => h.day === day)) {
                        holidaysByMonth[monthKey].push({ day, name: isHoliday.name });
                    }
                } else if (isWeekend) {
                    type = 'weekend';
                }

                map.set(dateStr, {
                    type,
                    name: isHoliday ? isHoliday.name : (type === 'pto' ? 'PTO Day' : 'Weekend'),
                    blockId: b.id,
                    isStart: dateStr === b.startDate
                });

                curr.setUTCDate(curr.getUTCDate() + 1);
            }
        });
        return { globalStatusMap: map, monthHolidays: holidaysByMonth };
    }, [blocks, isLocked]);

    return (
        <div className="w-full bg-light-100 border border-rose-100 rounded-3xl pt-6 pb-2 md:p-8 animate-fade-up relative group shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4 relative z-10 px-6 md:px-0">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-rose-accent text-xl">🗓</span> Year at a Glance
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">
                        {hideDates ? 'Sample Distribution (Dates vary by region)' : `Your Visual Plan (${startYear} - ${months[11].year})`}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold uppercase tracking-wider bg-white px-4 py-2 rounded-full border border-rose-50 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-accent shadow-sm"></div>
                        <span className="text-gray-500">Vacation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-lavender-accent shadow-sm"></div>
                        <span className="text-gray-500">Holiday</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex overflow-x-auto overscroll-x-contain gap-6 md:gap-8 px-6 md:px-0 pb-6 pt-20 scrollbar-hide w-full snap-x snap-mandatory pr-12 -mt-12 items-stretch min-h-[300px]">
                    {months.map((m) => (
                        <MonthGrid
                            key={`${m.year}-${m.month}`}
                            year={m.year}
                            month={m.month}
                            statusMap={globalStatusMap}
                            holidaysList={monthHolidays[`${m.year}-${m.month}`] || []}
                            hideDates={hideDates}
                        />
                    ))}
                </div>
            </div>

            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-light-100 to-transparent pointer-events-none z-20 md:hidden"></div>
        </div>
    )
}
