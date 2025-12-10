import React from 'react';

interface HowItWorksProps {
    onBack: () => void;
    onLaunch: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onBack, onLaunch }) => {
    return (
        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-24 animate-fade-up bg-light-100 min-h-screen">

            {/* Header - Simple Style */}
            <div className="text-center space-y-6 max-w-4xl mx-auto relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-rose-100 rounded-full text-rose-500 text-xs font-bold uppercase tracking-widest shadow-sm">
                    <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></span>
                    The Philosophy
                </div>
                <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-800 tracking-tight leading-[1.1]">
                    3 Steps to <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-peach-400">Your Dream Year.</span>
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
                    We don't just "show you a calendar". We analyze every opportunity to turn single days off into extended vacations, maximizing your freedom without sacrificing your career.
                </p>
            </div>

            {/* The Visualizer */}
            <div className="relative w-full max-w-5xl mx-auto">
                <div className="relative z-10 bg-white border border-rose-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: Simple Breakdown */}
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-4 font-display">
                                    <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-lg shadow-sm">1</span>
                                    Identify Anchors
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed pl-14">
                                    We map out every weekend and public holiday in your region. These are your "Anchors"—the foundation of your restoration.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-4 font-display">
                                    <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-lg shadow-sm">2</span>
                                    Bridge The Gaps
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed pl-14">
                                    We find the single working days stuck between a holiday and a weekend. By taking just this one day off, you unlock a 4-day mini-vacation.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-4 font-display">
                                    <span className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-lg shadow-sm">3</span>
                                    Maximize Joy
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed pl-14">
                                    We calculate the "Efficiency Score" of every trip. We only suggest dates that give you double the time off for every PTO day used.
                                </p>
                            </div>
                        </div>

                        {/* Right: The Visualizer */}
                        <div className="relative h-[400px] bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-3xl flex items-center justify-center p-8 overflow-hidden group shadow-inner">
                            {/* Abstract Visuals */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-40 transition-opacity duration-700">
                                <div className="w-64 h-64 bg-rose-200/20 rounded-full blur-3xl absolute top-10 left-10 animate-float"></div>
                                <div className="w-64 h-64 bg-peach-200/20 rounded-full blur-3xl absolute bottom-10 right-10 animate-float" style={{ animationDelay: '2s' }}></div>
                            </div>

                            {/* Active Calculation Overlay */}
                            <div className="relative z-10 w-full max-w-sm bg-white/90 backdrop-blur-md border border-rose-100 rounded-2xl p-6 shadow-lg">
                                <div className="flex justify-between items-center border-b border-rose-50 pb-3 mb-4">
                                    <span className="text-gray-800 font-bold text-xs uppercase tracking-widest">Optimization Engine</span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                                        <span className="text-[10px] text-rose-400 font-bold">ACTIVE</span>
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Checking May 23rd...</span>
                                        <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Workday</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Checking May 24th...</span>
                                        <span className="text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Weekend</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Checking May 26th...</span>
                                        <span className="text-lavender-500 bg-lavender-50 px-2 py-0.5 rounded-full font-bold">Holiday</span>
                                    </div>

                                    <div className="bg-rose-50 rounded-xl p-3 mt-4 border border-rose-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-4 h-4 rounded-full bg-rose-400 flex items-center justify-center text-white text-[8px]">✨</div>
                                            <span className="text-xs font-bold text-gray-800">Opportunity Found!</span>
                                        </div>
                                        <div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-400 w-3/4 rounded-full"></div>
                                        </div>
                                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-500 font-medium">
                                            <span>Efficiency Score</span>
                                            <span className="text-rose-500 font-bold">400% ROI</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[
                    {
                        icon: "⚙️",
                        title: "Smart Matching",
                        desc: "We use actual calendar data to find the best dates, tailored to you."
                    },
                    {
                        icon: "📈",
                        title: "Value Calculator",
                        desc: "Your time is precious. We show you exactly how much your vacation days are worth."
                    },
                    {
                        icon: "🔒",
                        title: "Private & Safe",
                        desc: "Your data stays on your device. We do not store your personal information."
                    },
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-rose-50 p-8 rounded-3xl hover:shadow-lg transition-all group hover:-translate-y-1">
                        <div className="text-4xl mb-6 bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 font-display">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Final CTA */}
            <div className="text-center py-20 relative overflow-hidden max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-8 relative z-10">Stop guessing. Start living.</h2>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                    <button
                        onClick={onLaunch}
                        className="px-10 py-5 bg-gradient-to-r from-rose-400 to-peach-400 text-white text-xl font-bold shadow-lg shadow-rose-200 rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300"
                    >
                        Design My Year
                    </button>
                    <button
                        onClick={() => onBack()}
                        className="px-8 py-5 text-gray-500 font-bold hover:text-rose-500 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>

        </div>
    );
};