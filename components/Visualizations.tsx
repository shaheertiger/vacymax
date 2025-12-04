import React, { useMemo } from 'react';
import { HolidayInfo, VacationBlock } from '../types';
import { getHolidayDescription } from '../services/vacationService';
import { formatDate, parseDateUTC } from '../services/utils';

export const HolidayTooltip: React.FC<{ holiday: HolidayInfo }> = ({ holiday }) => {
    const desc = getHolidayDescription(holiday.name);
    return (
        <div className="group relative inline-block z-10">
             <span className="cursor-help text-[10px] font-bold bg-brand-violet/20 text-brand-violet border border-brand-violet/20 px-2 py-1 rounded uppercase tracking-wider hover:bg-brand-violet/30 transition-colors">
                {holiday.name}
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 hidden md:group-hover:block group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                <div className="bg-dark-900 border border-white/20 p-3 rounded-lg shadow-xl text-xs text-center backdrop-blur-md">
                    <div className="font-bold text-white mb-1">{formatDate(holiday.date)}</div>
                    <div className="text-slate-400 leading-tight">{desc}</div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-dark-900 border-r border-b border-white/20"></div>
                </div>
            </div>
        </div>
    )
}

export const EfficiencyGauge: React.FC<{ multiplier: number, isJoint?: boolean, isInfinite?: boolean }> = ({ multiplier, isJoint, isInfinite }) => {
    const displayMultiplier = isInfinite ? 10 : multiplier;
    const percentage = Math.min(100, Math.max(0, (displayMultiplier - 1) / 4 * 100));
    
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full min-h-[220px] relative overflow-hidden flex flex-col items-center justify-center text-center">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-lime-accent"></div>
             
             <div className="relative w-32 h-16 mt-4 mb-2 overflow-hidden">
                 <div className="absolute w-32 h-32 rounded-full border-[12px] border-white/10 top-0 left-0 box-border"></div>
                 <div 
                    className="absolute w-32 h-32 rounded-full border-[12px] border-lime-accent border-b-transparent border-r-transparent top-0 left-0 box-border transition-all duration-1000 ease-out origin-center rotate-45"
                    style={{ transform: `rotate(${45 + (percentage * 1.8)}deg)` }}
                 ></div>
             </div>
             
             <div className="relative z-10 -mt-8">
                 <div className="text-4xl font-display font-bold text-white">
                    {isInfinite ? '∞' : `${multiplier.toFixed(1)}x`}
                 </div>
                 <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Smart Multiplier</div>
             </div>
             
             <p className="text-xs text-slate-500 mt-4 max-w-[180px]">
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Total Breakdown</h4>
            
            <div className="flex gap-4 items-end h-32 px-4 pb-2 justify-center">
                <div className="w-16 flex flex-col items-center gap-2 group cursor-help">
                    <span className="text-xs font-bold text-slate-400 opacity-100 transition-opacity">{pto}d</span>
                    <div className="w-full bg-slate-600 rounded-t-lg relative overflow-hidden" style={{ height: `${Math.max(ptoPct, 5)}%` }}>
                         <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Used</span>
                </div>
                
                <div className="w-16 flex flex-col items-center gap-2 group cursor-help">
                     <span className="text-xs font-bold text-lime-accent opacity-100 transition-opacity">+{free}d</span>
                    <div className="w-full bg-lime-accent rounded-t-lg shadow-[0_0_20px_rgba(132,204,22,0.3)] relative overflow-hidden" style={{ height: `100%` }}>
                         <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                    <span className="text-[10px] font-bold text-lime-accent uppercase">Free</span>
                </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-xs">
                 <span className="text-slate-400">Total Bonus:</span>
                 <span className="text-white font-bold">{total > 0 && pto > 0 ? ((free/pto) * 100).toFixed(0) : (free > 0 ? '∞' : 0)}%</span>
            </div>
        </div>
    )
}

// Data structure for rendered month grid
type DayStatus = { type: 'pto' | 'holiday' | 'weekend' | 'locked', name?: string, blockId?: string, isStart?: boolean };
type DayStatusMap = Map<string, DayStatus>; // Key: YYYY-MM-DD

export const MonthGrid: React.FC<{ year: number, month: number, statusMap: DayStatusMap, holidaysList: {day: number, name: string}[] }> = React.memo(({ year, month, statusMap, holidaysList }) => {
    const date = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const startDay = date.getUTCDay(); // 0 = Sun
    const monthName = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const weekDays = ['S','M','T','W','T','F','S'];

    return (
        <div className="space-y-2 w-[160px] flex-shrink-0 select-none snap-start relative z-10 flex flex-col">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">{monthName}</div>
            
            <div className="grid grid-cols-7 gap-1 mb-1">
                {weekDays.map((d, i) => (
                    <div key={i} className="text-[9px] text-center text-slate-700 font-bold">{d}</div>
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
                    
                    let bgClass = "bg-white/5 border border-white/5";
                    if (status?.type === 'pto') bgClass = "bg-lime-accent border-lime-accent shadow-[0_0_8px_rgba(132,204,22,0.6)] scale-110";
                    if (status?.type === 'holiday') bgClass = "bg-brand-violet border-brand-violet shadow-[0_0_8px_rgba(124,58,237,0.6)] scale-110";
                    if (status?.type === 'weekend') bgClass = "bg-slate-300/20 border-white/10";
                    if (status?.type === 'locked') bgClass = "bg-slate-800 opacity-50 border border-white/10 striped-bg"; 

                    return (
                        <div 
                            key={day} 
                            className={`w-4 h-4 rounded-sm ${bgClass} group relative cursor-default transition-all duration-300 hover:z-[100] active:z-[100]`}
                        >
                            {/* Start Marker */}
                            {status?.isStart && !['locked', 'weekend'].includes(status.type) && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm z-20 ring-2 ring-[#0F1014]"></div>
                            )}

                            {status && !['locked', 'weekend'].includes(status.type) && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[140px] hidden md:group-hover:block pointer-events-none z-[100]">
                                    <div className="bg-dark-900/95 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-xl whitespace-normal text-center relative">
                                        {status.name}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-900/95"></div>
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
                         <div key={i} className="flex items-start gap-1 text-[9px] text-slate-400 leading-tight">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-violet mt-0.5 flex-shrink-0"></div>
                             <span>{h.name}</span>
                         </div>
                    ))}
                </div>
            )}
        </div>
    )
});

export const YearTimeline: React.FC<{ blocks: VacationBlock[], isLocked: boolean, timelineStartDate?: string, targetYear: number, viewMode?: 'joint' | 'solo' }> = ({ blocks, isLocked, timelineStartDate, targetYear, viewMode }) => {
    // Determine the start date object. Use UTC.
    const start = timelineStartDate 
        ? new Date(timelineStartDate) 
        : new Date(Date.UTC(targetYear, 0, 1));
        
    const startMonth = start.getUTCMonth();
    const startYear = start.getUTCFullYear();

    // 1. Generate month sequence
    const months = useMemo(() => Array.from({length: 12}, (_, i) => {
       const d = new Date(Date.UTC(startYear, startMonth + i, 1));
       return { month: d.getUTCMonth(), year: d.getUTCFullYear() };
    }), [startYear, startMonth]);

    // 2. Pre-calculate global status map for ALL visible blocks (Performance Opt)
    const { globalStatusMap, monthHolidays } = useMemo(() => {
        const map: DayStatusMap = new Map();
        const holidaysByMonth: Record<string, {day: number, name: string}[]> = {};

        blocks.forEach((b, idx) => {
            const isBlockLocked = isLocked && idx > 0;
            const start = parseDateUTC(b.startDate);
            const end = parseDateUTC(b.endDate);
            let curr = new Date(start.getTime());
            
            while(curr.getTime() <= end.getTime()) {
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
                        holidaysByMonth[monthKey].push({day, name: isHoliday.name});
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
        <div className="w-full bg-[#0F1014] border border-white/10 rounded-3xl pt-6 pb-2 md:p-8 animate-fade-up relative group">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none rounded-3xl overflow-hidden"></div>
             
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4 relative z-10 px-6 md:px-0">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-lime-accent text-xl">🗓</span> Year at a Glance
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wider">Your Visual Plan ({startYear} - {months[11].year})</p>
                </div>
                
                <div className="flex flex-wrap gap-4 md:gap-6 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm bg-lime-accent shadow-[0_0_5px_rgba(132,204,22,0.8)]"></div>
                        <span className="text-slate-300">Vacation</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm bg-brand-violet shadow-[0_0_5px_rgba(124,58,237,0.8)]"></div>
                        <span className="text-slate-300">Holiday</span>
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
                         />
                     ))}
                 </div>
             </div>
             
             <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-[#0F1014] to-transparent pointer-events-none z-20 md:hidden"></div>
        </div>
    )
}