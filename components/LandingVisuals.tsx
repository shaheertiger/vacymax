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
                    
                    <p className="text-xl text-slate-300 max-w-3xl leading-relaxed mb-8 space-y-4">
                        <span className="block">Stop losing paid time to chaos meetings and HR fine print. VacationMax turns <strong className="text-white">3 PTO days into 9-day breaks</strong> by stitching holidays, weekends, and your odd shifts together.</span>
                        <span className="block">Built for high-intent visitors: launch the optimizer instantly, see the gain in cash terms, and export a real plan without creating an account.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                        <button
                            onClick={onCta}
                            className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden hover:scale-105 transition-transform"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Launch My Optimizer
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </span>
                        </button>
                        <div className="text-sm text-slate-400 space-y-1">
                            <p className="font-semibold text-white/90">No account required • Privacy-first • Under 60 seconds</p>
                            <p>Start free, export-ready, and read-only so you can decide fast without committing your calendar.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-left">
                        {["Read-only calendar sync", "Optimizes around holidays automatically", "Keeps your weekends intact"].map((item) => (
                            <div key={item} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-200">
                                <span className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center text-red-300 font-bold">✓</span>
                                <span className="leading-snug">{item}</span>
                            </div>
                        ))}
                    </div>
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
                
                <div className="space-y-6">
                    <h2 className="text-4xl font-display font-bold text-white">Do The Math. <br/>It Hurts.</h2>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Most people think unused PTO just "rolls over" or "disappears." No. <strong className="text-white">It is wage theft.</strong>
                        This is the cash value of donating your days back to the company.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-200">
                        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <span className="w-8 h-8 rounded-full bg-lime-accent/15 text-lime-accent flex items-center justify-center font-bold">✓</span>
                            <span className="leading-relaxed">See the loss per day, then auto-sequence the exact PTO days that erase it.</span>
                        </div>
                        <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <span className="w-8 h-8 rounded-full bg-lime-accent/15 text-lime-accent flex items-center justify-center font-bold">✓</span>
                            <span className="leading-relaxed">No account walls or credit card forms—jump straight into the optimizer when you are ready.</span>
                        </div>
                    </div>
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

                <div className="lg:col-span-2 mt-8 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-3 max-w-3xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Conversion Ready</p>
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white">See what you recover before you connect anything.</h3>
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed">Preview savings immediately, then switch to read-only calendar sync when you are convinced. No card. No sales call. Just reclaimed days.</p>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
                            {["Local-only calculations", "Weekend protection by default", "Google/Outlook/iCal ready", "Exports your exact dates"].map((item) => (
                                <span key={item} className="px-3 py-2 rounded-full bg-white/5 border border-white/10">{item}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                            onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-6 py-4 rounded-2xl bg-lime-accent text-dark-900 font-bold text-base shadow-[0_0_30px_rgba(190,242,100,0.25)] hover:shadow-[0_0_40px_rgba(190,242,100,0.35)] transition-transform active:scale-95"
                        >
                            Start Free Optimization
                        </button>
                        <p className="text-xs text-slate-400 font-semibold">No account. Read-only preview until you are ready to sync.</p>
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
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Built for the schedule you actually run.</h2>
                    <p className="text-teal-200/80 text-xl max-w-2xl mx-auto">
                        Every capability shown here ships today: holiday stacking, weekend protection, export-ready plans, and read-only syncing so you can trust the math before you commit.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* 1. Holiday Stack Engine */}
                    <div className="md:col-span-2 bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Holiday Stack Engine</h3>
                            <p className="text-teal-100/70 text-lg">
                                Automatically stacks PTO against public holidays to turn 1-3 days off into full-week escapes without burning extra balance.
                            </p>
                        </div>
                    </div>

                    {/* 2. Weekend Protector */}
                    <div className="bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🛡️</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Weekend Protector</h3>
                            <p className="text-teal-100/70">
                                Locks weekends into every block so you never waste days on stray Tuesdays. Default guardrails keep your balance focused on meaningful breaks.
                            </p>
                        </div>
                    </div>

                    {/* 3. Export-Ready Plans */}
                    <div className="bg-teal-900/40 border border-teal-500/20 rounded-3xl p-10 flex flex-col justify-between hover:bg-teal-900/60 transition-colors group">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📤</div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Export-Ready Plans</h3>
                            <p className="text-teal-100/70">
                                Download .ICS files or push read-only links to Google, Outlook, and iCal after previewing the math—no account or card required.
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

                <div className="mt-12 bg-teal-900/50 border border-teal-500/30 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2 max-w-3xl">
                        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-teal-200/70">CRO-focused assurance</p>
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-white">Proof-first planning with exportable outputs.</h3>
                        <p className="text-teal-100/80 text-sm md:text-base leading-relaxed">Run the optimizer instantly, review the stacked breaks, then export to .ICS or push a read-only sync once you are satisfied. No account or payment wall in the way.</p>
                        <div className="flex flex-wrap gap-3 text-sm text-teal-50/90">
                            {['Preview before connecting', 'Read-only Google/Outlook/iCal sync', 'Weekend + holiday protection', 'One-click .ICS export'].map((item) => (
                                <span key={item} className="px-3 py-2 rounded-full bg-white/5 border border-white/10">{item}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                            onClick={() => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-6 py-4 rounded-2xl bg-white text-dark-900 font-bold text-base shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.35)] transition-transform active:scale-95"
                        >
                            Launch Optimizer Now
                        </button>
                        <p className="text-xs text-teal-100/80 font-semibold">See your longest break in under 60 seconds.</p>
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
