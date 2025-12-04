import React from 'react';

interface HowItWorksProps {
  onBack: () => void;
  onLaunch: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onLaunch }) => {
  return (
    <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-24 animate-fade-up">
      
      {/* Header - Simple Style */}
      <div className="text-center space-y-6 max-w-4xl mx-auto relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
         <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#0F1014] border border-lime-accent/30 rounded-sm text-lime-accent text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(132,204,22,0.1)]">
            <span className="w-2 h-2 bg-lime-accent animate-pulse"></span>
            Smart Planning
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-[1.1]">
          We do the math. <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">You get the break.</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Our system scans the entire year to find the best dates to take off. We look for "bridges"—days that connect weekends to holidays—to give you maximum time away for minimum cost.
        </p>
      </div>

      {/* The Visualizer */}
      <div className="relative w-full max-w-5xl mx-auto">
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 border border-white/5 rounded-3xl bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          
          <div className="relative z-10 bg-[#050505]/80 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  
                  {/* Left: Simple Breakdown */}
                  <div className="space-y-8">
                      <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-white border-b border-lime-accent/30 pb-2 inline-block">1. We Scan The Year</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                              We look at every single day on the calendar, identifying weekends and workdays.
                          </p>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-white border-b border-lime-accent/30 pb-2 inline-block">2. Add Holidays</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                              We overlay all the public holidays for your specific country and region. These are "free" days off.
                          </p>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-white border-b border-lime-accent/30 pb-2 inline-block">3. Connect The Dots</h3>
                          <p className="text-slate-400 text-sm leading-relaxed">
                              We find the "Bridge Days"—single workdays that are sandwiched between weekends and holidays. Taking these days off gives you huge blocks of vacation time.
                          </p>
                      </div>
                  </div>

                  {/* Right: The Visualizer */}
                  <div className="relative h-[400px] bg-[#0F1014] border border-white/10 rounded-xl flex items-center justify-center p-8 overflow-hidden group">
                      {/* Abstract Node Graph */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity duration-700">
                          <svg width="400" height="300" viewBox="0 0 400 300" className="stroke-white/20">
                              <line x1="50" y1="150" x2="350" y2="150" strokeWidth="2" />
                              <line x1="100" y1="50" x2="100" y2="250" strokeWidth="1" strokeDasharray="5,5" />
                              <line x1="200" y1="50" x2="200" y2="250" strokeWidth="1" strokeDasharray="5,5" />
                              <line x1="300" y1="50" x2="300" y2="250" strokeWidth="1" strokeDasharray="5,5" />
                              <circle cx="50" cy="150" r="4" fill="#334155" />
                              <circle cx="350" cy="150" r="4" fill="#334155" />
                          </svg>
                      </div>

                      {/* Active Calculation Overlay */}
                      <div className="relative z-10 w-full max-w-sm bg-dark-900 border border-lime-accent/30 rounded-lg p-4 font-mono text-xs shadow-[0_0_30px_rgba(132,204,22,0.1)]">
                          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                              <span className="text-lime-accent font-bold">VACATION_PLANNER</span>
                              <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse"></span>
                                  SEARCHING
                              </span>
                          </div>
                          <div className="space-y-1.5 text-slate-400">
                              <div className="flex justify-between">
                                  <span>Checking May 23rd...</span>
                                  <span className="text-red-400">WORKDAY</span>
                              </div>
                              <div className="flex justify-between">
                                  <span>Checking May 24th...</span>
                                  <span className="text-lime-accent">WEEKEND</span>
                              </div>
                              <div className="flex justify-between">
                                  <span>Checking May 26th...</span>
                                  <span className="text-brand-violet">HOLIDAY</span>
                              </div>
                              <div className="border-t border-white/10 pt-2 mt-2 text-lime-accent font-bold">
                                  >> OPPORTUNITY FOUND! TAKE 23rd OFF.
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6">
          {[
              { 
                icon: "⚙️", 
                title: "Smart Matching", 
                desc: "We don't just guess. We use the actual calendar data to find the best dates." 
              },
              { 
                icon: "📈", 
                title: "Value Calculator", 
                desc: "Your time is money. We show you exactly how much your vacation days are worth." 
              },
              { 
                icon: "🔒", 
                title: "Private & Safe", 
                desc: "Your data stays on your device. We don't store your personal information." 
              },
          ].map((item, i) => (
              <div key={i} className="bg-[#0F1014] border border-white/10 p-8 rounded-2xl hover:border-lime-accent/30 transition-colors group">
                  <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3 font-display">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
          ))}
      </div>

      {/* Final CTA */}
      <div className="text-center py-20 bg-white/5 border border-white/5 rounded-[2rem] relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-lime-accent/10 blur-[80px] rounded-full pointer-events-none"></div>
           
           <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8 relative z-10">Stop guessing. Start planning.</h2>
           <button 
                onClick={onLaunch}
                className="relative z-10 px-10 py-5 bg-lime-accent text-dark-900 text-xl font-bold font-display rounded-sm hover:scale-105 hover:shadow-[0_0_40px_rgba(190,242,100,0.4)] transition-all duration-300"
            >
                Start My Plan
            </button>
      </div>

    </div>
  );
};