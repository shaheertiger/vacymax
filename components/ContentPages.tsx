import React, { useEffect } from 'react';

interface ContentPageProps {
    title: string;
    subtitle?: string;
    lastUpdated?: string;
    children: React.ReactNode;
    onBack: () => void;
}

const ContentPageLayout: React.FC<ContentPageProps> = ({ title, subtitle, lastUpdated, children, onBack }) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-light-100 text-gray-600 font-sans selection:bg-rose-100 selection:text-rose-900">
            {/* Header/Nav */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-rose-50 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="group text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        <span>Back to Planner</span>
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto pt-32 pb-24 px-6 relative z-10">
                {/* Title Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-800 mb-4">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xl text-rose-400 font-display italic">
                            {subtitle}
                        </p>
                    )}
                    {lastUpdated && (
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-6 bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                            Last Updated: {lastUpdated}
                        </p>
                    )}
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none 
                    prose-headings:font-display prose-headings:font-bold prose-headings:text-gray-800 
                    prose-p:text-gray-500 prose-p:leading-loose 
                    prose-strong:text-rose-500 prose-strong:font-bold
                    prose-a:text-rose-500 prose-a:no-underline hover:prose-a:underline
                    prose-li:marker:text-rose-300">
                    {children}
                </div>

                {/* Footer Signature */}
                <div className="mt-24 pt-12 border-t border-rose-100 text-center">
                    <p className="font-display italic text-gray-400 text-lg">
                        Designed for your best life.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const AboutPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout
        title="Our Philosophy"
        subtitle="Rest is not a reward. It is essential."
        onBack={onBack}
    >
        <p className="lead text-2xl text-gray-700 font-display italic mb-12">
            We believe the modern work calendar is broken. <span className="text-rose-500 font-bold not-italic">We're here to fix it with grace.</span>
        </p>

        <p>
            For too long, we've accepted the 9-to-5 grind as the default setting of life. We ask for permission to live, we squeeze joy into weekends, and we leave thousands of hours of paid time off on the table every year.
        </p>
        <p>
            <strong>It’s time for a new approach.</strong>
        </p>

        <h3 className="mt-12 mb-6">Our Mission</h3>
        <p>
            DoubleMyHolidays is more than a calendar tool. It is a commitment to <strong>Lifestyle Design</strong>. We use smart algorithms to identify the "hidden pockets" of time in your schedule—the bridges, the long weekends, the optimal dates—so you can reclaim your freedom without asking for more days off.
        </p>

        <div className="grid md:grid-cols-3 gap-8 my-16 not-prose">
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌿</div>
                <h4 className="font-display font-bold text-gray-800 mb-2">Wellness First</h4>
                <p className="text-sm text-gray-500">Prioritize your mental health by scheduling regular breaks.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✨</div>
                <h4 className="font-display font-bold text-gray-800 mb-2">Smart Strategy</h4>
                <p className="text-sm text-gray-500">Use math, not luck, to maximize your time off.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm text-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🌍</div>
                <h4 className="font-display font-bold text-gray-800 mb-2">Experience More</h4>
                <p className="text-sm text-gray-500">Travel, rest, and create memories that last.</p>
            </div>
        </div>
    </ContentPageLayout>
);

export const AlgorithmPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="How It Works" subtitle="Your Secret Weapon for Doubling Time Off" onBack={onBack}>
        <p className="lead text-2xl text-gray-700 font-display italic mb-12">
            Here's exactly how we turn <span className="text-rose-500 font-bold not-italic">10 days of PTO</span> into <span className="text-emerald-500 font-bold not-italic">24+ days of freedom</span>. No magic required—just smart strategy.
        </p>

        <div className="not-prose bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-12">
            <h4 className="font-display font-bold text-gray-800 text-lg mb-2">💡 The Big Idea</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
                Most people waste PTO by taking random days off. We find the <strong className="text-rose-500">"Bridge Days"</strong>—strategic single days that connect weekends to public holidays, instantly creating long vacation blocks.
            </p>
        </div>

        <h3 className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-rose-500 to-peach-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</span>
            We Scan Your Calendar Year
        </h3>
        <p>
            Our algorithm analyzes <strong>every weekend and public holiday</strong> in your country for the entire year. We identify natural "anchor points"—holidays that fall close to weekends but aren't quite touching them.
        </p>
        <p className="text-sm text-gray-500 italic">
            Example: If a public holiday falls on Thursday, we spot the opportunity—take Friday off and boom, you've got a 4-day weekend.
        </p>

        <h3 className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-rose-500 to-peach-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</span>
            We Find Your Bridge Days
        </h3>
        <p>
            We identify those <strong className="text-rose-500">single working days</strong> stuck between holidays and weekends. These are your "Bridge Days"—the highest-value PTO days you can take.
        </p>
        <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Without Strategy</div>
                <div className="text-2xl font-bold text-gray-400">1 PTO Day = 1 Day Off</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-peach-50 p-4 rounded-xl border border-rose-200">
                <div className="text-xs text-rose-500 uppercase tracking-wider mb-2">With Bridge Days</div>
                <div className="text-2xl font-bold text-rose-500">1 PTO Day = 4-5 Days Off ✨</div>
            </div>
        </div>

        <h3 className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-rose-500 to-peach-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</span>
            We Calculate Your ROI
        </h3>
        <p>
            Not all vacation days are equal. We score every possible trip using our <strong>Efficiency Formula</strong>:
        </p>
        <div className="not-prose bg-gray-50 p-6 rounded-xl border border-gray-200 my-6 font-mono text-center">
            <div className="text-sm text-gray-500 mb-2">Efficiency Score =</div>
            <div className="text-xl font-bold text-gray-800">
                Total Days Off ÷ PTO Days Used
            </div>
        </div>
        <p>
            <strong className="text-rose-500">We only recommend trips with a 2x ROI or better.</strong> That means for every PTO day you spend, you get at least 2 full days of freedom.
        </p>

        <h3 className="flex items-center gap-3">
            <span className="bg-gradient-to-br from-rose-500 to-peach-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">4</span>
            You Choose Your Vibe
        </h3>
        <p>
            Want one epic 2-week trip or sprinkled long weekends all year? We customize the plan based on your energy style:
        </p>
        <ul className="space-y-2">
            <li><strong>🥂 Socialite:</strong> Frequent mini-breaks for maximum events</li>
            <li><strong>✈️ Jetsetter:</strong> Long blocks for international travel</li>
            <li><strong>🧘‍♀️ Wellness:</strong> Consistent rest intervals all year</li>
            <li><strong>✨ CEO Schedule:</strong> Balanced mix for ultimate flexibility</li>
        </ul>

        <div className="not-prose bg-gradient-to-br from-rose-50 to-transparent border-l-4 border-rose-400 p-6 rounded-r-xl my-12">
            <h4 className="font-display font-bold text-gray-800 text-xl mb-2">The Result?</h4>
            <p className="text-gray-600 leading-relaxed">
                A personalized vacation calendar that <strong className="text-rose-500">doubles your time off</strong> without asking your boss for extra days. It's not about working the system—it's about working <em>smarter</em>.
            </p>
        </div>
    </ContentPageLayout>
);

export const PrivacyPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="Your Privacy" lastUpdated="January 2025" onBack={onBack}>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-8 not-prose flex items-start gap-4">
            <div className="text-3xl">🔒</div>
            <div>
                <h4 className="font-bold text-gray-800 text-lg mb-1">Local-First Promise</h4>
                <p className="text-gray-600 text-sm">Your calendar data stays on your device. We do not store your personal schedule on our servers.</p>
            </div>
        </div>

        <h3>Data Collection</h3>
        <p>
            DoubleMyHolidays operates primarily as a client-side application. The optimization magic happens right in your secure browser memory.
        </p>
        <ul>
            <li>We do not store your name, email, or salary on our servers.</li>
            <li>We do not track your specific vacation plans.</li>
            <li>We do not sell your data to travel agencies.</li>
        </ul>

        <h3>Local Storage</h3>
        <p>
            We use your browser's local storage to save your preferences (like your selected region) so you don't have to re-enter them every time. You can clear this at any time in your browser settings.
        </p>
    </ContentPageLayout>
);

export const TermsPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="Terms of Service" lastUpdated="January 2025" onBack={onBack}>
        <p>
            By using DoubleMyHolidays, you agree to the following simple terms.
        </p>
        <h3>1. Planning Tool Only</h3>
        <p>
            DoubleMyHolidays is a planning aid. While we strive for 100% accuracy with public holiday dates, we recommend verifying specific dates with your employer before booking non-refundable travel. We are not liable for any costs associated with booked trips or denied leave requests.
        </p>
        <h3>2. Fair Use</h3>
        <p>
            This tool is for personal use. We put a lot of love into our algorithms and design. Please respect our work by not using automated scrapers or attempting to resell our optimization data.
        </p>
        <h3>3. Payment & Refunds</h3>
        <p>
            Our "Unlock Full Plan" is a one-time purchase. If you are not satisfied with the value provided, please contact our support team.
        </p>
    </ContentPageLayout>
);

export const RegionPage = ({ region, onBack }: { region: string, onBack: () => void }) => (
    <ContentPageLayout title={`Region: ${region}`} onBack={onBack}>
        <p className="lead text-xl text-gray-600 italic">
            Tailored optimization strategies for {region}.
        </p>
        <h3>Public Holiday Structure</h3>
        <p>
            {region} offers unique opportunities due to its specific bank holidays and observance rules. Our calculator is tuned to the local holiday calendar of {region} for 2025 and 2026.
        </p>
        <p>
            Use the main planner to see exact dates for the upcoming year and discover your best opportunities for rest.
        </p>
    </ContentPageLayout>
);

// StrategiesPage removed in favor of StrategyDemosPage
