import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PHASE 1: THE HOOK (Interactive Hero) ---
export const PainHero = ({ onCta }: { onCta: () => void }) => {
    const [region, setRegion] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [scannedDays, setScannedDays] = useState(0);

    const handleRegionSelect = (r: string) => {
        setRegion(r);
        setStatus('scanning');

        // Simulated scan effect
        let count = 0;
        const interval = setInterval(() => {
            count += 1;
            setScannedDays(count);
            if (count >= 14) {
                clearInterval(interval);
                setStatus('complete');
            }
        }, 100);
    };

    return (
        <div className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden bg-[#020617] min-h-[90vh] flex flex-col justify-center">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617] z-0"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.04] z-[1]"></div>

            {/* Ambient Glows */}
            <div className="absolute -top-[20%] left-[20%] w-[500px] h-[500px] bg-lime-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Copy */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left"
                >
                    <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-lime-accent/20 bg-lime-accent/5 text-lime-accent text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_-5px_rgba(132,204,22,0.3)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse"></span>
                        Algorithm Updated: 2026 Ready
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-white leading-[1] mb-8">
                        Hack Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">Time Off</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-10 font-light border-l border-white/10 pl-6">
                        Don't just take vacation. <strong className="text-white font-medium">Engineer it.</strong><br />
                        Our algorithm aligns your PTO with public holidays to turn <span className="text-white">10 days</span> of leave into <span className="text-white">24 days</span> of freedom.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="flex flex-col items-center sm:items-start gap-3 w-full sm:w-auto">
                            <button
                                onClick={onCta}
                                className="w-full sm:w-auto px-10 py-5 bg-lime-accent hover:bg-lime-400 text-dark-900 font-bold text-lg rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(190,242,100,0.3)] flex items-center justify-center gap-3 group"
                            >
                                Hack My 2026 Calendar
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </button>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <svg className="w-3 h-3 text-lime-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                No credit card required to start
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-6">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-xs">
                                    <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${i + 20}`} className="w-full h-full rounded-full bg-slate-700" alt="avatar" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="flex text-yellow-500 mb-0.5 text-[10px] gap-0.5">
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p className="text-white font-bold">14,203 Planners</p>
                            <p className="text-slate-500">Optimizing 2026 right now</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Interactive Demo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-lime-accent/10 to-transparent rounded-[2.5rem] blur-3xl -z-10 transform rotate-6"></div>
                    <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden min-h-[500px] flex flex-col shadow-2xl bg-[#08080A]/80 backdrop-blur-xl">

                        {/* Decorative UI Header */}
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
                                <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
                                <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
                            </div>
                            <div className="font-mono text-[10px] text-lime-accent uppercase tracking-widest bg-lime-accent/5 px-3 py-1 rounded">
                                SYSTEM SCANNER V2.0
                            </div>
                        </div>

                        {status === 'idle' && (
                            <div className="flex-1 flex flex-col justify-center animate-fade-up">
                                <h3 className="text-xl font-bold text-white mb-2">Select Region to Test</h3>
                                <p className="text-slate-400 mb-6 text-sm">See how many "Bridge Days" exist in your calendar.</p>

                                <div className="space-y-3">
                                    {['United States', 'United Kingdom', 'Canada', 'Australia'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleRegionSelect(r)}
                                            className="w-full text-left px-6 py-5 rounded-xl bg-white/5 hover:bg-lime-accent/10 border border-white/5 hover:border-lime-accent/40 transition-all flex justify-between items-center group"
                                        >
                                            <span className="text-white font-semibold group-hover:text-lime-accent transition-colors">{r}</span>
                                            <span className="text-slate-600 group-hover:text-lime-accent transition-colors">→</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {status === 'scanning' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up relative">
                                <div className="absolute inset-0 bg-lime-accent/5 animate-pulse rounded-full blur-3xl"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 border-4 border-lime-accent/20 border-t-lime-accent rounded-full animate-spin mb-8"></div>
                                    <h4 className="text-2xl font-bold text-white mb-2">Analyzing 2026 Calendar...</h4>
                                    <p className="text-slate-400 mb-8 font-mono text-xs uppercase tracking-widest">Scanning {region} Holidays</p>
                                    <div className="text-6xl font-display font-bold text-white tabular-nums">
                                        {scannedDays}
                                    </div>
                                    <p className="text-lime-accent text-sm font-bold mt-2">OPPORTUNITIES FOUND</p>
                                </div>
                            </div>
                        )}

                        {status === 'complete' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up">
                                <div className="w-20 h-20 bg-gradient-to-br from-lime-accent to-emerald-500 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-[0_0_50px_rgba(16,185,129,0.4)] rotate-3">
                                    🔓
                                </div>
                                <h4 className="text-3xl font-bold text-white mb-4">Optimization Complete</h4>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 w-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-400 text-sm font-bold">INPUT</span>
                                        <span className="text-white font-mono">10 DAYS PTO</span>
                                    </div>
                                    <div className="w-full h-px bg-white/10 my-3"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lime-accent text-sm font-bold">OUTPUT</span>
                                        <span className="text-lime-accent font-mono font-bold text-xl">24 DAYS OFF</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onCta}
                                    className="w-full py-4 bg-white text-dark-900 font-bold font-display tracking-wide rounded-xl hover:bg-slate-200 transition-colors shadow-lg"
                                >
                                    UNLOCK REAL SCHEDULE
                                </button>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-xs text-slate-500 hover:text-white uppercase tracking-widest font-bold"
                                >
                                    Try Another Region
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- PHASE 2: THE AGITATION (Burn Calculator) ---
export const BurnCalculator = () => {
    const [salary, setSalary] = useState(85000);
    const [daysLeft, setDaysLeft] = useState(8);

    // Calculation: (Salary / 260 working days) * Days Left
    const dailyRate = salary / 260;
    const loss = Math.round(dailyRate * daysLeft);

    return (
        <div className="w-full bg-[#050505] border-y border-white/5 py-32 relative overflow-hidden">
            {/* Abstract Grid Line Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

            <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div className="space-y-10">
                    <div className="inline-block px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-widest">
                        ⚠️ Fiscal Year Ending
                    </div>
                    <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-[1.1]">
                        You are paying<br />
                        <span className="text-slate-600">to work.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                        Unused PTO is a voluntary donation to your employer. Calculate your loss below.
                    </p>

                    <div className="flex gap-8">
                        <div>
                            <p className="text-3xl font-bold text-white">{Math.round((260 - daysLeft) / 260 * 100)}%</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Year Worked</p>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div>
                            <p className="text-3xl font-bold text-red-500">-${loss.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Value Lost</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-[2rem] p-10 border border-white/10 relative shadow-2xl bg-[#08080A]">
                    <div className="space-y-10">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Annual Salary</label>
                                <span className="text-white font-mono font-bold">${salary.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="30000"
                                max="300000"
                                step="5000"
                                value={salary}
                                onChange={(e) => setSalary(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-lime-accent"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unused Days</label>
                                <span className="text-white font-mono font-bold text-red-400">{daysLeft} Days</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={daysLeft}
                                onChange={(e) => setDaysLeft(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-sm font-bold text-white uppercase tracking-widest">Total Donation</p>
                                <p className="text-xs text-red-400 font-mono bg-red-500/10 px-2 py-1 rounded border border-red-500/20">IRREVERSIBLE</p>
                            </div>
                            <div className="text-6xl font-display font-bold tabular-nums text-white mb-8 tracking-tighter">
                                ${loss.toLocaleString()}
                            </div>
                            <button
                                onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-5 bg-white text-black text-lg rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:bg-slate-200"
                            >
                                Stop Losing Money
                            </button>
                            <p className="text-center mt-3 text-[10px] text-slate-600 uppercase tracking-widest">
                                <span className="text-red-500 font-bold animate-pulse">●</span> Only 8 days left to plan
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PHASE 3: THE SOLUTION (Bento Grid) ---
export const SolutionGrid = () => {
    return (
        <div className="w-full bg-[#020617] py-32 px-6 relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-violet/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Cheat Mode for<br /><span className="text-slate-600">Your Calendar.</span></h2>
                    <p className="text-slate-400 text-xl max-w-2xl font-light">
                        We reversed engineered the calendar so you don't have to. Here is the tech stack for your vacation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Feature: Multiplier (Large Left) */}
                    <div className="md:col-span-2 bg-[#0F1014] hover:bg-[#131419] border border-white/5 hover:border-lime-accent/20 transition-all duration-500 rounded-3xl p-12 flex flex-col justify-between group relative overflow-hidden min-h-[400px]">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                            <div className="text-9xl grayscale">🗓️</div>
                        </div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-lime-accent/10 rounded-2xl flex items-center justify-center text-4xl mb-8 text-lime-accent border border-lime-accent/20">⚡</div>
                            <h3 className="text-3xl font-display font-bold text-white mb-4">The Bridge Day Protocol</h3>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                                Our core algorithm identifies "orphaned working days" sandwiched between weekends and holidays. Booking 1 of these can unlock 4 consecutive days off.
                            </p>
                        </div>
                    </div>

                    {/* 2. Feature: Weekend Protection (Right Stack Top) */}
                    <div className="md:col-span-1 bg-[#0F1014] hover:bg-[#131419] border border-white/5 hover:border-white/10 transition-colors rounded-3xl p-8 flex flex-col justify-center gap-6 group">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl text-white">🛡️</div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Weekend Shield</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Never waste PTO on a Saturday. We anchor every trip around existing weekends.
                            </p>
                        </div>
                    </div>

                    {/* 3. Feature: Export (Right Stack Bottom) */}
                    <div className="md:col-span-1 bg-[#0F1014] hover:bg-[#131419] border border-white/5 hover:border-white/10 transition-colors rounded-3xl p-8 flex flex-col justify-center gap-6 group">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl text-white">📥</div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Instant Sync</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                One-click export to Google, Outlook, or Apple Calendar.
                            </p>
                        </div>
                    </div>

                    {/* 4. Use it or Lose it (Bottom Wide) */}
                    <div className="md:col-span-2 bg-[#0F1014] hover:bg-[#131419] border border-white/5 hover:border-white/10 transition-colors rounded-3xl p-12 flex items-center gap-8 group relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-lime-accent/5 rounded-full blur-3xl group-hover:bg-lime-accent/10 transition-colors"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-3">Rollover Rescue Engine</h3>
                            <p className="text-slate-400 leading-relaxed max-w-md">
                                Fiscal year ending soon? We prioritize "use-it-or-lose-it" days before they expire, ensuring $0 waste.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PHASE 4: SOCIAL PROOF (Marquee) ---
export const BattleTestedMarquee = () => {
    const testimonials = [
        "Turned 12 PTO days into 35 days off. Insane.",
        "My boss thinks I quit. I just used VacyMax.",
        "Hacked the 2026 calendar already. Booked Tokyo.",
        "Why is no one else doing this?",
        "Simple. Effective. Essential.",
        "I will never book random dates again.",
        "Actually works for UK Bank Holidays perfectly.",
    ];

    return (
        <div className="w-full bg-[#020617] border-y border-white/5 py-12 overflow-hidden relative">
            <div className="absolute inset-0 bg-lime-accent/5 z-0"></div>
            <div className="flex gap-20 animate-scroll w-max hover:[animation-play-state:paused] relative z-10">
                {[...testimonials, ...testimonials, ...testimonials].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity cursor-default">
                        <div className="w-2 h-2 rounded-full bg-lime-accent"></div>
                        <span className="text-white font-bold text-xl whitespace-nowrap font-display tracking-tight">"{text}"</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
