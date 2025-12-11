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
    <ContentPageLayout title="How It Works" subtitle="The Magic Behind the Math" onBack={onBack}>
        <p className="lead text-xl text-gray-600">
            How do we turn 10 days of PTO into 24 days of freedom?
        </p>

        <h3 className="flex items-center gap-3">
            <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Smart Analysis
        </h3>
        <p>
            We look at the year as a whole, mapping out every weekend and public holiday in your region. Think of it as finding the "anchors" in your calendar.
        </p>

        <h3 className="flex items-center gap-3">
            <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Bridge Strategy
        </h3>
        <p>
            We identify the "bridge days"—single working days that are stuck between a holiday and a weekend. By taking just that one day off, you effectively unlock a 4 or 5-day mini-vacation.
        </p>

        <h3 className="flex items-center gap-3">
            <span className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Efficiency Scoring
        </h3>
        <p>
            Not all vacation days are created equal. We calculate an "Efficiency Score" for every possible trip.
            <br />
            <code>Score = (Total Days Off) / (PTO Days Used)</code>
        </p>
        <p>
            We only recommend trips that give you at least double the value (2x ROI) for your time.
        </p>
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
