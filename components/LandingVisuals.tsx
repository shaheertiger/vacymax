import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- PHASE 1: THE PAIN (Anti-Hero) ---
export const PainHero = ({ onCta }: { onCta: () => void }) => {
    const [wastedSeconds, setWastedSeconds] = useState(4520);

    useEffect(() => {
        const interval = setInterval(() => {
            setWastedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative pt-32 pb-24 px-6 md:px-12 overflow-hidden bg-[#020617]">
            {/* Dark, oppressive background gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-[#020617] to-[#020617] z-0"></div>
            
            {/* Ticking Clock visual element - subtle anxiety trigger */}
            <div className="absolute top-20 right-10 md:right-32 font-mono text-[120px] md:text-[200px] leading-none font-bold text-white/[0.03] select-none pointer-events-none z-0">
                {wastedSeconds}
            </div>

            <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono font-bold uppercase tracking-widest mb-8">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Wake Up Call
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter text-white leading-[1] mb-8">
                        Your Company Loves It <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">When You Waste PTO.</span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
                        Every year, you leave <strong className="text-white">40% of your potential leisure time</strong> on the table. 
                        That is thousands of dollars you are voluntarily donating back to your boss.
                        <br/><br/>
                        <span className="text-white border-b border-red-500/50">Stop being the "nice guy" who burns out.</span>
                    </p>

                    <button 
                        onClick={onCta}
                        className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden hover:scale-105 transition-transform"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Reclaim My Time
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

// --- PHASE 2: THE AGITATION (Burn Calculator) ---
export const BurnCalculator = () => {
    const [salary, setSalary] = useState(85000);
    const [daysLeft, setDaysLeft] = useState(5);
    
    // Calculation: (Salary / 260 working days) * Days Left
    const dailyRate = salary / 260;
    const loss = Math.round(dailyRate * daysLeft);
    
    const isHighLoss = loss > 2000;

    return (
        <div className="w-full bg-[#050505] border-y border-white/5 py-24 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                
                <div className="space-y-8">
                    <h2 className="text-4xl font-display font-bold text-white">Do The Math. <br/>It Hurts.</h2>
                    <p className="text-slate-400 text-lg">
                        Most people think unused PTO just "rolls over" or "disappears." 
                        <br/>No. <strong className="text-white">It is wage theft.</strong>
                        <br/><br/>
                        Use the calculator to see exactly how much money you are setting on fire by not optimizing your calendar.
                    </p>
                </div>

                <div className="bg-[#0F1014] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative">
                    {/* Background Warning Glow */}
                    <motion.div 
                        animate={{ opacity: isHighLoss ? 0.2 : 0 }}
                        className="absolute inset-0 bg-red-600 blur-[100px] pointer-events-none"
                    />

                    <div className="relative z-10 space-y-8">
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
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unoptimized Days Left</label>
                                <span className="text-white font-mono font-bold">{daysLeft} Days</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="30" 
                                value={daysLeft}
                                onChange={(e) => setDaysLeft(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-2">*Days you typically let expire or use on random Wednesdays.</p>
                        </div>

                        <div className="pt-8 border-t border-white/10 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Value Donated To Your Boss</p>
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={loss}
                                    initial={{ scale: 0.9 }}
                                    animate={isHighLoss ? { 
                                        scale: 1.1, 
                                        x: [0, -5, 5, -5, 5, 0],
                                        color: "#ef4444"
                                    } : { 
                                        scale: 1, 
                                        color: "#ffffff"
                                    }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="text-6xl md:text-7xl font-display font-bold tabular-nums"
                                >
                                    ${loss.toLocaleString()}
                                </motion.div>
                            </AnimatePresence>
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
        <div className="w-full bg-[#042f2e] py-32 px-6 relative overflow-hidden transition-colors duration-700">
            {/* Gradient Overlay to transition from Black to Teal */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-10"></div>
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-20">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Built for Real Life.<br/>Not just 9-to-5s.</h2>
                    <p className="text-teal-200/80 text-xl max-w-2xl mx-auto">
                        Reddit hates generic vacation planners. So we built the specific features you actually asked for.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    
                    {/* 1. Flex Schedule Engine */}
                    <div className="md:col-span-2 bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⏰</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Flex-Schedule Engine</h3>
                            <p className="text-teal-100/70 text-lg">
                                Work 4/10s? Rotating shifts? Nursing roster? We optimize your specific schedule, not a generic Monday-Friday calendar.
                            </p>
                        </div>
                    </div>

                    {/* 2. Parent Mode */}
                    <div className="bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎒</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Parent Mode</h3>
                            <p className="text-teal-100/70">
                                Filter results to align perfectly with school district breaks.
                            </p>
                        </div>
                    </div>

                    {/* 3. Unlimited PTO Zone */}
                    <div className="bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">The "HR Safe Zone"</h3>
                            <p className="text-teal-100/70">
                                Unlimited PTO anxiety? We calculate the industry-standard "safe max" so you can rest without flagging HR.
                            </p>
                        </div>
                    </div>

                    {/* 4. Rollover Rescue */}
                    <div className="md:col-span-2 bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⏳</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Rollover Rescue</h3>
                            <p className="text-teal-100/70 text-lg">
                                Fiscal year ends in March? Use it or lose it. We prioritize burning expiring days before you lose them forever.
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
        "Finally an app that understands my 4-day work week!",
        "My boss didn't even notice I was gone for 10 days.",
        "Saved me $4,500 in wasted PTO time.",
        "The only planner that handles rotating nursing shifts.",
        "I used to feel guilty taking leave. Now I feel smart.",
        "Unlimited PTO is a trap, this tool helped me actually use it.",
        "Turned 3 days into a 9-day Japan trip.",
    ];

    return (
        <div className="w-full bg-[#020617] border-y border-white/10 py-12 overflow-hidden">
            <div className="flex gap-12 animate-scroll w-max hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <span className="text-lime-accent text-xl">★</span>
                        <span className="text-white font-medium text-lg whitespace-nowrap font-display">"{text}"</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Also export TrustedByStrip for legacy/fallback support if needed
export const TrustedByStrip = () => (
    <div className="w-full border-y border-white/5 bg-[#0F1014]/30 backdrop-blur-sm py-6 md:py-8 my-12 animate-fade-up relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                Trusted by smart professionals at
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 hover:opacity-80 transition-opacity duration-500">
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">GOOGLE</span>
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">META</span>
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">NETFLIX</span>
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">SHOPIFY</span>
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">SPOTIFY</span>
                <span className="text-base md:text-lg font-bold text-white font-display tracking-tight">MICROSOFT</span>
            </div>
        </div>
    </div>
);
