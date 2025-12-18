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
    <section className="w-full bg-white border-t border-gray-100 py-10 sm:py-16 md:py-24 px-4 sm:px-6" id="trust">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 md:space-y-16">

        {/* Header - Clean and simple */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-gray-800 mb-2 sm:mb-3">
            Your Privacy Matters
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
            Data stays in your browser. Nothing stored on our servers.
          </p>
        </div>

        {/* Simple Trust Indicators - Horizontal on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">Local Processing</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">No Data Stored</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700 font-medium">Calendar Export</span>
          </div>
        </div>

        {/* Testimonials - Hidden on small mobile, show only 1 on medium */}
        <div className="hidden sm:block">
          <p className="text-center text-xs text-gray-400 uppercase tracking-wider mb-4">Trusted by 14,000+ users</p>
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-4">
            {wallOfLove.slice(0, 3).map((post, index) => (
              <div
                key={post.handle}
                className={`bg-gray-50 rounded-xl p-4 ${index > 0 ? 'hidden md:block' : ''}`}
              >
                <p className="text-gray-600 text-sm italic mb-3">"{post.quote}"</p>
                <div className="flex items-center gap-2">
                  <img src={post.avatar} alt="" className="w-8 h-8 rounded-full" loading="lazy" />
                  <div>
                    <p className="text-xs font-medium text-gray-800">{post.handle}</p>
                    <p className="text-xs text-gray-400">{post.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories Section - Desktop only */}
        <div className="hidden md:block space-y-6 md:space-y-8">
          <div className="text-center max-w-2xl mx-auto px-2">
            <span className="inline-block bg-gradient-to-r from-rose-100 to-lavender-100 text-rose-accent px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
              Real Results
            </span>
            <h3 className="text-xl sm:text-2xl md:text-4xl font-display font-bold text-gray-800 mb-2 sm:mb-3">
              See How Others Maximized Their Time Off
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm md:text-base">
              Real stories from people who transformed their work-life balance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-rose-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-50" />

                <div className="relative z-10">
                  {/* Stats badges - stack on very small screens */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex-1 min-w-[70px]">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">PTO Used</p>
                      <p className="text-sm sm:text-lg font-bold text-rose-accent">{story.ptoUsed} days</p>
                    </div>
                    <div className="bg-lavender-50 border border-lavender-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex-1 min-w-[70px]">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Days Off</p>
                      <p className="text-sm sm:text-lg font-bold text-lavender-accent">{story.daysOff} days</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 flex-1 min-w-[70px]">
                      <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider">Efficiency</p>
                      <p className="text-sm sm:text-lg font-bold text-green-600">+{Math.round((story.daysOff / story.ptoUsed - 1) * 100)}%</p>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    "{story.story}"
                  </p>

                  {/* Highlight */}
                  <div className="bg-gradient-to-r from-rose-50 to-lavender-50 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs font-bold text-rose-accent flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">🎯</span>
                      {story.highlight}
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-rose-50">
                    <img
                      src={story.avatar}
                      alt={`${story.name} profile`}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-rose-100"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-xs sm:text-sm">{story.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{story.location}</p>
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
