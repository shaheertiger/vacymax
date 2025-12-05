import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const integrations = [
  {
    name: 'Google Calendar',
    initials: 'G',
    color: '#4285F4',
    accent: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
  },
  {
    name: 'Outlook',
    initials: 'O',
    color: '#0A64AD',
    accent: 'linear-gradient(135deg, #0A64AD 0%, #50B5FF 100%)',
  },
  { name: 'iCal', initials: '', color: '#A2AAAD', accent: '#ffffff' },
];

const wallOfLove = [
  {
    handle: '@shipyarddev',
    role: 'Staff Engineer',
    quote: 'Finally, a PTO tool that does the math for me. Stacked 3 days into a 9-day trip. 🤯',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=dev',
  },
  {
    handle: '@nomadloop',
    role: 'Remote PM & Nomad',
    quote: 'Essential for maximizing remote work travel in 2025. The new AI features are legit.',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=nomad',
  },
  {
    handle: '@opsfocus',
    role: 'Platform Lead',
    quote: 'Read-only calendar ingest plus on-device math = instant trust. Team adopted in one sprint.',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=ops',
  }
];

// --- BEHAVIORAL TRIGGER: LIVE ACTIVITY FEED ---
const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([
    { user: 'Sarah (UK)', action: 'optimized 12 days into 34 days off' },
    { user: 'James (USA)', action: 'found 3 long weekends' },
    { user: 'Marcus (Canada)', action: 'saved $2,400 in lost PTO' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate activities to simulate live feed
      setActivities(prev => {
        const first = prev[0];
        return [...prev.slice(1), first];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 right-0 p-6 hidden md:block pointer-events-none overflow-hidden h-[200px] w-[300px]">
      <AnimatePresence mode='popLayout'>
        {activities.slice(0, 2).map((activity, i) => (
          <motion.div
            key={`${activity.user}-${i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-3 flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl"
          >
            <div className="w-2 h-2 rounded-full bg-lime-accent animate-pulse"></div>
            <p className="text-xs text-slate-300">
              <span className="font-bold text-white">{activity.user}</span> {activity.action}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const TrustSection: React.FC = () => {
  return (
    <section className="w-full bg-[#05070F] border-y border-white/5 py-24 px-6 relative" id="trust">
      <div className="max-w-6xl mx-auto space-y-24 relative z-10">

        {/* Header with Live Feed */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white">Trust is our currency.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              We stay read-only while syncing next to your calendar stack so you can test the optimizer without committing.
            </p>
          </div>
          <LiveActivityFeed />
        </div>

        {/* Integration Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                Seamless Integration
                <span className="bg-lime-accent/10 border border-lime-accent/20 text-lime-accent text-[10px] px-2 py-0.5 rounded-full">142x ROI</span>
              </h3>
              <p className="text-slate-400 text-sm">Connects with your existing tools in seconds.</p>
            </div>
            <div className="mt-8 flex gap-4">
              {integrations.map((item) => (
                <div key={item.name} className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-white/5 border border-white/10 grayscale hover:grayscale-0 transition-all cursor-pointer" style={{ color: item.color }}>
                  {item.initials}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden flex flex-col justify-center">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-lime-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span className="font-bold tracking-widest uppercase text-xs">Bank-Grade Security</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Your Data Stays Yours</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We use a local-first architecture. Your calendar events are processed in your browser memory and never stored on our servers.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg className="w-40 h-40 text-lime-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Wall of Love */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px] bg-lime-accent"></div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 font-bold">14,000+ Happy Planners</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {wallOfLove.map((post) => (
              <motion.div
                key={post.handle}
                whileHover={{ y: -5 }}
                className="glass-panel glass-panel-hover rounded-3xl p-8 border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={post.avatar} alt={post.handle} className="w-12 h-12 rounded-full border-2 border-white/10" />
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold">
                        <span>{post.handle}</span>
                        <span className="text-blue-400 text-[10px]">Verified</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{post.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-base italic">"{post.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
