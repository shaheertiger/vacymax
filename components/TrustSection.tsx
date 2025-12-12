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
  { name: 'iCal', initials: '', color: '#666666', accent: '#ffffff' },
];

const wallOfLove = [
  {
    handle: '@sarah_travels',
    role: 'Digital Nomad',
    quote: 'Finally planned a 3-week Bali trip without using all my PTO. This tool is magic! ✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=ffd5dc',
  },
  {
    handle: '@jess_designs',
    role: 'Creative Director',
    quote: 'I used to burn out every Q4. Now I have regular long weekends scheduled automatically.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jess&backgroundColor=e0e7ff',
  },
  {
    handle: '@mindful_mia',
    role: 'Wellness Coach',
    quote: 'Privacy was my main concern. I love that it doesn\'t store my calendar data. 10/10.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia&backgroundColor=ffedd5',
  }
];

// Success stories with specific stats
const successStories = [
  {
    name: 'Emily R.',
    location: 'New York, USA',
    ptoUsed: 12,
    daysOff: 28,
    story: 'I turned my standard 2 weeks into almost a month off! The tool found hidden long weekends I never would have noticed.',
    highlight: 'Took a 10-day Europe trip using only 5 PTO days',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily&backgroundColor=ffd5dc',
  },
  {
    name: 'James T.',
    location: 'London, UK',
    ptoUsed: 15,
    daysOff: 35,
    story: 'As a new parent, time off is precious. This helped me plan quality family time without burning through all my leave.',
    highlight: 'Spent 2 extra weeks with my newborn',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=c7d2fe',
  },
  {
    name: 'Sophie L.',
    location: 'Sydney, Australia',
    ptoUsed: 10,
    daysOff: 24,
    story: 'I was skeptical at first, but the efficiency gains are real. Now I recommend it to everyone at work!',
    highlight: 'Saved 8 PTO days for emergencies',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie&backgroundColor=fef3c7',
  },
];

// --- BEHAVIORAL TRIGGER: LIVE ACTIVITY FEED ---
const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([
    { user: 'Sarah (UK)', action: 'planned her Bali retreat 🌸' },
    { user: 'Emma (USA)', action: 'found 4 long weekends' },
    { user: 'Olivia (Canada)', action: 'reclaimed 12 days of joy' },
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
            className="mb-3 flex items-center gap-3 bg-white/70 backdrop-blur-md border border-rose-100 p-3 rounded-xl shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-rose-accent animate-pulse"></div>
            <p className="text-xs text-gray-500">
              <span className="font-bold text-gray-800">{activity.user}</span> {activity.action}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const TrustSection: React.FC = () => {
  return (
    <section className="w-full bg-gradient-to-b from-white to-light-200 border-t border-rose-50 py-16 md:py-24 px-4 md:px-6 relative" id="trust">
      <div className="max-w-6xl mx-auto space-y-12 md:space-y-24 relative z-10">

        {/* Header with Live Feed */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 relative">
          <div className="space-y-2 md:space-y-4 max-w-2xl">
            <h2 className="text-2xl md:text-5xl font-display font-bold text-gray-800">Your Privacy, Our Priority.</h2>
            <p className="text-gray-500 text-sm md:text-lg leading-relaxed">
              Your data never leaves your browser. Local-first architecture.
            </p>
          </div>
          <LiveActivityFeed />
        </div>

        {/* Integration Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-rose-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                Seamless Integration
                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Instant</span>
              </h3>
              <p className="text-gray-500 text-xs md:text-sm">Works with your existing calendar tools.</p>
            </div>
            <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
              {integrations.map((item) => (
                <div key={item.name} className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl font-bold bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-rose-200 hover:bg-white transition-all cursor-pointer shadow-sm">
                  {item.initials}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-rose-100 shadow-sm relative overflow-hidden flex flex-col justify-center hover:shadow-md transition-shadow">
            <div className="relative z-10">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-rose-accent">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                <span className="font-bold tracking-widest uppercase text-[10px] md:text-xs">Secure & Private</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Your Data Stays Yours</h3>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                Processed in your browser. Never stored on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Wall of Love - Horizontal scroll on mobile */}
        <div className="space-y-6 md:space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 md:w-10 h-[2px] bg-rose-accent"></div>
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400 font-bold">14,000+ Happy Planners</p>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory">
            {wallOfLove.map((post) => (
              <motion.div
                key={post.handle}
                whileHover={{ y: -5 }}
                className="flex-shrink-0 w-[280px] md:w-auto bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-rose-100 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all snap-center"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <img src={post.avatar} alt={`${post.role} profile picture`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-rose-100" loading="lazy" />
                    <div>
                      <div className="flex items-center gap-2 text-gray-800 font-bold text-sm md:text-base">
                        <span>{post.handle}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium">{post.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base italic">"{post.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="space-y-6 md:space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block bg-gradient-to-r from-rose-100 to-lavender-100 text-rose-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Real Results
            </span>
            <h3 className="text-2xl md:text-4xl font-display font-bold text-gray-800 mb-3">
              See How Others Maximized Their Time Off
            </h3>
            <p className="text-gray-500 text-sm md:text-base">
              Real stories from people who transformed their work-life balance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 md:p-8 border border-rose-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-50" />

                <div className="relative z-10">
                  {/* Stats badges */}
                  <div className="flex gap-2 mb-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">PTO Used</p>
                      <p className="text-lg font-bold text-rose-accent">{story.ptoUsed} days</p>
                    </div>
                    <div className="bg-lavender-50 border border-lavender-100 rounded-lg px-3 py-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Days Off</p>
                      <p className="text-lg font-bold text-lavender-accent">{story.daysOff} days</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Efficiency</p>
                      <p className="text-lg font-bold text-green-600">+{Math.round((story.daysOff / story.ptoUsed - 1) * 100)}%</p>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    "{story.story}"
                  </p>

                  {/* Highlight */}
                  <div className="bg-gradient-to-r from-rose-50 to-lavender-50 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-rose-accent flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      {story.highlight}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-rose-50">
                    <img
                      src={story.avatar}
                      alt={`${story.name} profile`}
                      className="w-10 h-10 rounded-full border-2 border-rose-100"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{story.name}</p>
                      <p className="text-xs text-gray-400">{story.location}</p>
                    </div>
                  </div>
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
