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
        <div className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 safe-px overflow-hidden bg-light-100 min-h-[auto] md:min-h-[90vh] flex flex-col justify-center">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-light-100 to-light-100 z-0"></div>

            {/* Ambient Glows - Desktop Only */}
            <div className="hidden md:block absolute -top-[10%] left-[10%] w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>
            <div className="hidden md:block absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-lavender-200/20 rounded-full blur-[80px] pointer-events-none animate-pulse-slow"></div>

            {/* Decorative Stickers - Desktop Only */}
            <div className="hidden md:block absolute top-24 left-10 text-4xl opacity-20 rotate-12 animate-float pointer-events-none">✨</div>
            <div className="hidden md:block absolute bottom-20 right-20 text-6xl opacity-10 -rotate-12 animate-float pointer-events-none">🌸</div>

            <div className="max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl w-full mx-auto relative z-10 grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center overflow-hidden px-1 gap-y-8 sm:gap-y-10">
                {/* Left Column: Copy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left"
                >
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-accent text-xs font-bold tracking-widest uppercase shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-accent animate-pulse"></span>
                        The Journey to Freedom 🕊️
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-gray-800 leading-[1.05] mb-3 sm:mb-4 md:mb-6 text-balance hero-title">
                        We Double Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-accent to-peach-accent italic">Holidays.</span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed mb-7 md:mb-10 border-l-4 border-rose-200 pl-4 md:pl-6 text-balance hero-subtitle">
                        Stop wasting your paid time off. <strong className="text-rose-accent">Our algorithm finds the "Bridge Days"</strong> that connect public holidays to weekends.<br className="hidden sm:block" />
                        Turn <span className="font-bold underline decoration-rose-300 decoration-2">10 days of PTO</span> into <span className="font-bold underline decoration-emerald-300 decoration-2">24+ days of freedom</span>. Instantly. 🥂
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 hero-cta-stack w-full">
                        <button
                            onClick={onCta}
                            className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-rose-accent to-peach-accent hover:shadow-lg hover:shadow-rose-accent/40 text-white font-bold text-base sm:text-lg rounded-full hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group active:scale-95 min-h-[56px]"
                        >
                            Unlock My Freedom
                            <span className="group-hover:translate-x-1 transition-transform">🕊️</span>
                        </button>
                        <div className="flex sm:hidden items-center gap-3 px-4 py-3 rounded-full bg-white/80 border border-rose-100 shadow-sm">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-accent">
                                <span className="w-2 h-2 rounded-full bg-lavender-accent animate-pulse"></span>
                                1-Min Wizard
                            </div>
                            <span className="text-gray-500 text-xs">Optimized for one-thumb use</span>
                        </div>
                    </div>

                    {/* Mobile highlight cards */}
                    <div className="mt-5 -mx-2 flex sm:hidden items-stretch gap-3 overflow-x-auto px-2 pb-2" aria-label="Mobile comforts">
                        {[{
                            title: 'Swipe friendly',
                            desc: 'Tap or swipe through 4 steps',
                            icon: '📲'
                        }, {
                            title: 'Lightweight',
                            desc: '<30s to unlock first plan',
                            icon: '⚡'
                        }, {
                            title: 'Save & resume',
                            desc: 'We auto-save your progress',
                            icon: '💾'
                        }].map((item) => (
                            <div
                                key={item.title}
                                className="min-w-[220px] flex-1 bg-white/80 border border-rose-100 rounded-2xl px-4 py-3 shadow-sm backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-lg">
                                        {item.icon}
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Social Proof - Simplified on mobile */}
                    <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-rose-100 flex items-center gap-4 md:gap-6">
                        <div className="flex -space-x-3 md:-space-x-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-rose-100 flex items-center justify-center text-xs shadow-sm overflow-hidden ring-2 ring-rose-50">
                                    <img src={`https://api.dicebear.com/9.x/micah/svg?seed=${i + 40}&backgroundColor=ffe4e6`} className="w-full h-full object-cover" alt={`VacyMax user ${i} avatar`} loading="lazy" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="flex text-rose-400 mb-0.5 text-[10px] md:text-[12px] gap-0.5">
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p className="text-gray-800 font-bold text-sm md:text-base">14,000+ Planning</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Interactive Demo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative max-w-lg sm:max-w-xl mx-auto w-full lg:ml-auto"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 to-lavender-100 rounded-[2.5rem] blur-3xl -z-10 transform rotate-3"></div>
                    <div className="glass-panel rounded-[2.5rem] p-4 sm:p-7 md:p-12 border border-white/60 relative overflow-hidden min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex flex-col shadow-xl bg-white/60 backdrop-blur-xl">

                        {/* Decorative UI Header */}
                        <div className="flex justify-between items-center mb-8 border-b border-rose-100 pb-6">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-rose-200"></span>
                                <span className="w-3 h-3 rounded-full bg-peach-accent/30"></span>
                                <span className="w-3 h-3 rounded-full bg-lavender-accent/30"></span>
                            </div>
                            <div className="text-[10px] text-rose-accent uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full font-bold">
                                ✨ VIBE CHECK
                            </div>
                        </div>

                        {status === 'idle' && (
                            <div className="flex-1 flex flex-col justify-center animate-fade-up">
                                <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Where to next, bestie? 🌍</h3>
                                <p className="text-gray-500 mb-8 text-sm">Select a region to unlock your time off.</p>

                                <div className="space-y-3">
                                    {['United States', 'United Kingdom', 'Canada', 'Australia'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => handleRegionSelect(r)}
                                            className="w-full text-left px-6 py-4 rounded-2xl bg-white hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all flex justify-between items-center group shadow-sm hover:shadow-md"
                                        >
                                            <span className="text-gray-700 font-medium group-hover:text-rose-accent transition-colors">{r}</span>
                                            <span className="text-rose-200 group-hover:text-rose-accent transition-colors">🌸</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {status === 'scanning' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up relative">
                                <div className="absolute inset-0 bg-rose-50 animate-pulse rounded-full blur-3xl opacity-50"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 border-4 border-rose-100 border-t-rose-accent rounded-full animate-spin mb-8"></div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">Manifesting... 🧘‍♀️</h4>
                                    <p className="text-gray-500 mb-8 text-xs uppercase tracking-widest">Checking {region} Vibes</p>
                                    <div className="text-6xl font-display font-bold text-rose-accent tabular-nums">
                                        {scannedDays}
                                    </div>
                                    <p className="text-rose-400 text-sm font-bold mt-2">LONG WEEKENDS FOUND</p>
                                </div>
                            </div>
                        )}

                        {status === 'complete' && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-up">
                                <div className="w-20 h-20 bg-gradient-to-br from-rose-accent to-peach-accent rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg rotate-3 text-white">
                                    💖
                                </div>
                                <h4 className="text-3xl font-display font-bold text-gray-800 mb-4">Glow Up Complete!</h4>
                                <div className="bg-white/50 border border-rose-100 rounded-2xl p-6 mb-8 w-full shadow-inner">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-500 text-xs font-bold uppercase">YOUR INPUT</span>
                                        <span className="text-gray-800 font-bold">10 DAYS PTO</span>
                                    </div>
                                    <div className="w-full h-px bg-rose-100 my-3"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-rose-accent text-xs font-bold uppercase">YOUR REALITY</span>
                                        <span className="text-rose-accent font-bold text-xl">24 DAYS OFF ✨</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onCta}
                                    className="w-full py-4 bg-gray-900 text-white font-bold tracking-wide rounded-xl hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
                                >
                                    Unlock My Best Life
                                </button>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-xs text-rose-400 hover:text-rose-600 uppercase tracking-widest font-bold"
                                >
                                    Check Another Region
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Visual Journey Connector */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-rose-200 hidden md:block"></div>
        </div>
    );
};

// --- PHASE 2: THE AGITATION (Burnout Calculator) ---
export const BurnCalculator = () => {
    const [salary, setSalary] = useState(85000);
    const [daysLeft, setDaysLeft] = useState(8);

    // Calculation used to be money, now framing it as "Self Care Debt"
    const dailyRate = salary / 260;
    const loss = Math.round(dailyRate * daysLeft);

    return (
        <div className="w-full bg-white py-16 md:py-32 relative overflow-hidden">
            <div className="hidden md:block absolute inset-0 bg-[linear-gradient(to_right,#fce7f3_1px,transparent_1px),linear-gradient(to_bottom,#fce7f3_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

            <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 md:gap-20 items-center relative z-10">
                <div className="space-y-6 md:space-y-8">
                    <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 bg-rose-100 rounded-lg text-rose-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        ✨ Optional Snapshot
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-gray-900 leading-[1.1]">
                        See how far <br />
                        <span className="text-rose-400 italic">your days can stretch.</span>
                    </h2>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md">
                        A calm, optional check-in to visualize the value of the PTO you still have left.
                    </p>
                    <p className="text-gray-400 text-sm">This step is optional—hop back to the planner whenever you want.</p>

                    <div className="flex flex-wrap gap-4 md:gap-8">
                        <div>
                            <p className="text-2xl md:text-4xl font-bold text-gray-800">{Math.round((260 - daysLeft) / 260 * 100)}%</p>
                            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-widest mt-1">Life Working</p>
                        </div>
                        <div className="h-12 w-px bg-gray-200 hidden md:block"></div>
                        <div>
                            <p className="text-4xl font-bold text-rose-500">-${loss.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Value Lost</p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel rounded-[2rem] p-10 border border-white relative shadow-2xl bg-white/80 backdrop-blur-xl">
                    <div className="space-y-10">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Annual Salary</label>
                                <span className="text-gray-800 font-mono font-bold">${salary.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="30000"
                                max="300000"
                                step="5000"
                                value={salary}
                                onChange={(e) => setSalary(Number(e.target.value))}
                                className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                aria-label="Annual salary"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unused Days</label>
                                <span className="text-rose-500 font-mono font-bold">{daysLeft} Days</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={daysLeft}
                                onChange={(e) => setDaysLeft(Number(e.target.value))}
                                className="w-full h-2 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                aria-label="Unused vacation days"
                            />
                        </div>

                        <div className="pt-8 border-t border-rose-100">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-widest">Total Value</p>
                                <p className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded">CLAIM IT</p>
                            </div>
                            <div className="text-6xl font-display font-bold tabular-nums text-gray-900 mb-8 tracking-tight">
                                ${loss.toLocaleString()}
                            </div>
                            <button
                                onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="w-full py-5 bg-gradient-to-r from-rose-accent to-peach-accent text-white text-lg rounded-xl transition-all font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-1"
                            >
                                Preview my extra days
                            </button>
                            <p className="text-center mt-4 text-[10px] text-gray-400 uppercase tracking-widest">
                                <span className="inline-block w-2 h-2 bg-rose-400 rounded-full mr-2 animate-pulse"></span> Prioritize yourself
                            </p>
                            <button
                                onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="mt-3 w-full text-sm text-rose-500 font-bold underline underline-offset-4"
                            >
                                Skip to the planner
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PHASE 3: THE SOLUTION (Features) ---
export const SolutionGrid = () => {
    return (
        <div className="w-full bg-light-100 py-32 px-6 relative">
            {/* Connector from above */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-rose-200 to-transparent hidden md:block"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-20 text-center">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">The DoubleMyHolidays<br /><span className="text-rose-400 italic">Journey.</span></h2>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto font-light">
                        We don't just find dates. We architect your year of rest.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white border border-rose-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-display font-bold text-rose-300">01</div>
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mb-6">🗓️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">We Audit Your Year</h3>
                        <p className="text-gray-500 leading-relaxed">We scan every federal holiday and weekend to find the "Hidden Anchors" in your schedule.</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white border border-rose-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg transition-all md:-translate-y-4">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-display font-bold text-rose-300">02</div>
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mb-6">🧠</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">We Find the Bridges</h3>
                        <p className="text-gray-500 leading-relaxed">Our engine identifies the "Bridge Days"—single PTO days that seamlessly connect holidays to weekends.</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white border border-rose-100 rounded-3xl p-8 relative overflow-hidden group hover:shadow-lg transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-display font-bold text-rose-300">03</div>
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl mb-6">✈️</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">You Escape</h3>
                        <p className="text-gray-500 leading-relaxed">Turn 10 days into 24. Export to your calendar and book the flight. You're free.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PHASE 4: SOCIAL PROOF (Marquee) ---
export const BattleTestedMarquee = () => {
    const testimonials = [
        "Turned 12 PTO days into 35 days of travel! ✈️",
        "Finally booked that girl's trip to Tulum! 🌴",
        "My boss asked how I have so much holiday time lol 🤫",
        "Self-care isn't selfish, it's scheduled. 💅",
        "Entering my villain era (holiday mode). 😈",
        "Booked my honeymoon for 2026 already! 💍",
        "The best money I spent on myself this year. 💆‍♀️",
    ];

    return (
        <div className="w-full bg-white border-y border-rose-100 py-12 overflow-hidden relative px-4">
            <div className="flex gap-12 sm:gap-20 animate-scroll w-max hover:[animation-play-state:paused] relative z-10 max-w-screen">
                {[...testimonials, ...testimonials, ...testimonials].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity cursor-default group">
                        <div className="w-2 h-2 rounded-full bg-rose-400 group-hover:scale-150 transition-transform"></div>
                        <span className="text-gray-800 font-bold text-xl whitespace-nowrap font-display tracking-tight">"{text}"</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
