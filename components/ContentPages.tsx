import React from 'react';

interface ContentPageProps {
    title: string;
    lastUpdated?: string;
    children: React.ReactNode;
    onBack: () => void;
}

const ContentPageLayout: React.FC<ContentPageProps> = ({ title, lastUpdated, children, onBack }) => {
    return (
        <div className="min-h-screen bg-black text-slate-300 pt-32 pb-20 px-6 font-mono selection:bg-lime-accent selection:text-black">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <button
                    onClick={onBack}
                    className="group mb-12 text-xs font-bold text-lime-accent hover:text-white transition-colors flex items-center gap-3 uppercase tracking-widest"
                >
                    <span className="w-8 h-px bg-lime-accent group-hover:w-16 transition-all duration-300"></span>
                    [ Return_To_Base ]
                </button>

                <div className="border-l-2 border-lime-accent/30 pl-4 md:pl-8 mb-16 relative">
                    <div className="absolute -left-[5px] -top-1 w-2 h-2 bg-lime-accent"></div>
                    <div className="text-xs text-slate-500 uppercase tracking-[0.3em] mb-4">Designation: System_File</div>
                    <h1 className="text-4xl md:text-7xl font-display font-black text-white uppercase tracking-tighter leading-none mb-2 break-words">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className="block">{word}</span>
                        ))}
                    </h1>
                </div>

                {lastUpdated && (
                    <div className="flex items-center gap-4 text-[10px] text-lime-accent/60 uppercase tracking-widest mb-16 font-bold">
                        <span className="w-2 h-2 rounded-full bg-lime-accent/50 animate-pulse"></span>
                        Version_Date: {lastUpdated}
                    </div>
                )}

                <div className="prose prose-invert prose-lg max-w-none 
                    prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-white 
                    prose-p:text-slate-400 prose-p:font-sans prose-p:leading-relaxed 
                    prose-strong:text-lime-accent prose-strong:font-mono prose-strong:font-normal
                    prose-ul:list-none prose-ul:pl-0
                    prose-li:border-l prose-li:border-white/10 prose-li:pl-6 prose-li:mb-4
                    prose-a:text-lime-accent prose-a:no-underline hover:prose-a:underline">
                    {children}
                </div>

                <div className="mt-20 pt-8 border-t border-dashed border-white/10 text-[10px] text-slate-600 uppercase tracking-[0.2em] flex justify-between">
                    <span>End_Of_File</span>
                    <span>Encrypted_Connection_Secure</span>
                </div>
            </div>
        </div>
    );
};

export const AboutPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="Identity Manifesto" onBack={onBack}>
        <p className="lead text-2xl text-white font-display uppercase tracking-wide mb-8">
            The 9-to-5 is a relic. <span className="text-lime-accent">We are the glitch in the system.</span>
        </p>

        <p>
            For too long, the corporate calendar has dictated the rhythm of human life. We accept standard holidays, we beg for approval, and we leave thousands of hours of paid liberty on the table.
        </p>
        <p>
            <strong>This ends now.</strong>
        </p>

        <h3 className="text-3xl mt-12 mb-6">Our Directive</h3>
        <p>
            VacyMax is not a "calendar app". It is a strategic weapon designed to reclaim time. We exploit the inefficiencies of the standard work-week algorithm to maximize personal freedom.
        </p>

        <ul className="my-12 space-y-8">
            <li className="relative">
                <span className="absolute -left-[33px] top-0 text-lime-accent font-mono text-xl">01</span>
                <strong className="block text-white text-xl mb-2 font-display">Time is Non-Refundable</strong>
                Every hour you don't claim is a donation to the machine. We stop the bleeding.
            </li>
            <li className="relative">
                <span className="absolute -left-[33px] top-0 text-lime-accent font-mono text-xl">02</span>
                <strong className="block text-white text-xl mb-2 font-display">Work Smarter, Rest Harder</strong>
                Productivity is meaningless without regeneration. We optimize for high-impact rest.
            </li>
            <li className="relative">
                <span className="absolute -left-[33px] top-0 text-lime-accent font-mono text-xl">03</span>
                <strong className="block text-white text-xl mb-2 font-display">The Weekend is a Launchpad</strong>
                Saturdays and Sundays are not "off days". They are strategic assets to be leveraged for extended campaigns of leisure.
            </li>
        </ul>

        <p className="text-sm font-mono text-lime-accent border border-lime-accent/20 bg-lime-accent/5 p-6 rounded mt-12">
            // STATUS: RECRUITING<br />
            // TARGET: 1,000,000 DAYS RECLAIMED<br />
            // JOIN THE RESISTANCE.
        </p>
    </ContentPageLayout>
);

export const AlgorithmPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="The Algorithm" onBack={onBack}>
        <p className="lead text-xl text-slate-200">
            How we turn 10 days into 24.
        </p>
        <h3>1. Graph Traversal</h3>
        <p>
            We model the calendar as a directed acyclic graph (DAG). Each day is a node, and edges represent potential connections. We weight "work days" as a cost and "vacation days" as a reward.
        </p>
        <h3>2. Bridge Identification</h3>
        <p>
            The system scans for "bridge nodes"—single days that, if removed (booked), connect two larger components of non-working days (weekends + holidays).
        </p>
        <h3>3. Efficiency Scoring</h3>
        <p>
            We assign an ROI score to every possible date range.
            <code>Score = (Total Consecutive Days Off) / (PTO Days Used)</code>.
            Only ranges with a score &gt; 2.0 make it into our recommendations.
        </p>
    </ContentPageLayout>
);

export const PrivacyPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="Privacy Shield" lastUpdated="2025.1.0" onBack={onBack}>
        <p>
            We take a radical approach to privacy: <strong>we don't want your data.</strong>
        </p>
        <h3>Data Collection</h3>
        <p>
            VacationMax operates as a client-side application. The optimization calculations happen right in your browser.
        </p>
        <ul>
            <li>We do not store your name, email, or salary on our servers.</li>
            <li>We do not track your specific vacation plans.</li>
            <li>We do not sell your data to travel agencies.</li>
        </ul>
        <h3>Local Storage</h3>
        <p>
            We use your browser's `localStorage` to save your preferences so you don't have to re-enter them if you refresh the page. You can clear this at any time.
        </p>
    </ContentPageLayout>
);

export const TermsPage = ({ onBack }: { onBack: () => void }) => (
    <ContentPageLayout title="Operational Terms" lastUpdated="2025.1.0" onBack={onBack}>
        <p>
            By using VacationMax, you agree to the following terms.
        </p>
        <h3>1. No Guarantee</h3>
        <p>
            VacationMax provides optimization suggestions based on public holiday data. Verification of actual holiday dates with your employer is your responsibility. We are not liable for booked flights or denied leave.
        </p>
        <h3>2. Fair Use</h3>
        <p>
            You may use this tool for personal planning. Automated scraping or commercial resale of our optimization data is prohibited.
        </p>
    </ContentPageLayout>
);

export const RegionPage = ({ region, onBack }: { region: string, onBack: () => void }) => (
    <ContentPageLayout title={`Region: ${region}`} onBack={onBack}>
        <p className="lead text-xl text-slate-200">
            Specific optimization strategies for professionals working in {region}.
        </p>
        <h3>Public Holiday Structure</h3>
        <p>
            {region} offers unique opportunities due to its specific bank holidays and observance rules. Our calculator is tuned to the local holiday calendar of {region} for 2025 and 2026.
        </p>
        <p>
            Use the main calculator to see exact dates for the upcoming year.
        </p>
    </ContentPageLayout>
);
