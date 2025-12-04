import React, { useState } from 'react';
import { OptimizationResult } from '../types';
import { PaymentModal, getRegionalPrice } from './PaymentModal';
import { formatDate, formatCurrency, generateGoogleCalendarLink, downloadICS } from '../services/utils';
import { HolidayTooltip, EfficiencyGauge, DistributionChart, YearTimeline } from './Visualizations';

interface ResultsViewProps {
  result: OptimizationResult;
  onReset: () => void;
  onUnlock: () => void;
  isLocked: boolean;
  userCountry?: string;
  prefs: any; 
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, onUnlock, isLocked, userCountry, prefs }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // NEW: View Mode Toggle (Joint vs Solo)
  const hasBuddy = result.totalPtoUsedBuddy !== undefined;
  const [viewMode, setViewMode] = useState<'joint' | 'solo'>('joint');

  const visibleBlocks = isLocked ? result.vacationBlocks.slice(0, 1) : result.vacationBlocks;
  const hiddenBlocks = result.vacationBlocks.slice(1);
  const hiddenCount = hiddenBlocks.length;
  const hiddenValue = hiddenBlocks.reduce((acc, b) => acc + b.monetaryValue, 0);
  
  const bestHiddenBlock = hiddenBlocks.reduce((prev, current) => {
      return (prev.totalDaysOff > current.totalDaysOff) ? prev : current;
  }, hiddenBlocks[0] || null);

  const price = getRegionalPrice(userCountry);

  // --- DYNAMIC STATS CALCULATION ---
  let displayedPtoUsed = result.totalPtoUsed;
  let displayedFreeDays = result.totalFreeDays;
  let multiplier = 0;
  let isInfiniteEfficiency = false;

  if (viewMode === 'solo' || !hasBuddy) {
      displayedPtoUsed = result.totalPtoUsed;
      displayedFreeDays = result.totalFreeDays;
      if (displayedPtoUsed === 0 && result.totalDaysOff > 0) {
          isInfiniteEfficiency = true;
      } else if (displayedPtoUsed > 0) {
          multiplier = result.totalDaysOff / displayedPtoUsed;
      }
  } else {
      const combinedPto = result.totalPtoUsed + (result.totalPtoUsedBuddy || 0);
      const combinedGain = result.totalDaysOff * 2;
      displayedPtoUsed = combinedPto;
      displayedFreeDays = combinedGain - combinedPto;
      if (combinedPto === 0 && combinedGain > 0) {
          isInfiniteEfficiency = true;
      } else if (combinedPto > 0) {
          multiplier = combinedGain / combinedPto;
      }
  }

  const planStats = {
      totalDays: result.totalDaysOff,
      efficiency: multiplier,
      ptoUsed: result.totalPtoUsed
  };

  const handleUnlockClick = () => setShowPaymentModal(true);
  const handlePaymentSuccess = () => { setShowPaymentModal(false); onUnlock(); };

  if (!result.vacationBlocks || result.vacationBlocks.length === 0) {
      return (
        <div className="max-w-4xl mx-auto pt-12 text-center animate-enter">
            <h2 className="text-2xl font-bold text-white mb-4">No optimal blocks found.</h2>
            <p className="text-slate-400 mb-8">Try adjusting your preferences.</p>
            <button onClick={onReset} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-all active:scale-95">Start Over</button>
        </div>
      )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32">
      
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        savedValue={hiddenValue}
        userCountry={userCountry}
        prefs={prefs}
        planStats={planStats}
      />

      {/* Header Cards with Staggered Entrance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Main Stat Card - Glassmorphism */}
          <div className="lg:col-span-7 md:col-span-2 glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden group animate-enter">
              {/* Animated Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime-accent/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-lime-accent/20 transition-colors duration-700"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                      <div className="flex justify-between items-start mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-accent/10 border border-lime-accent/20 text-lime-accent text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(190,242,100,0.1)]">
                              <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse"></span>
                              {result.planName || "Optimal Plan Found"}
                          </div>

                          {/* Interactive Toggle */}
                          {hasBuddy && (
                              <div className="flex bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
                                  <button 
                                    onClick={() => setViewMode('joint')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'joint' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                  >
                                      Joint
                                  </button>
                                  <button 
                                    onClick={() => setViewMode('solo')}
                                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full transition-all duration-300 ${viewMode === 'solo' ? 'bg-lime-accent text-dark-900 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                  >
                                      Solo
                                  </button>
                              </div>
                          )}
                      </div>

                      <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                          {result.totalDaysOff} Days Off
                      </h2>
                      
                      <div className="text-slate-400 text-sm md:text-base min-h-[48px]">
                          {viewMode === 'joint' ? (
                              <>Joint plan using <strong className="text-white">{result.totalPtoUsed}</strong> of your days and <strong className="text-white">{result.totalPtoUsedBuddy}</strong> buddy days.</>
                          ) : (
                              <>Viewing your personal impact: <strong className="text-white">{result.totalPtoUsed} PTO days</strong> used.</>
                          )}
                      </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Value Recovered</p>
                          <p className="text-2xl font-bold text-white tracking-tight">{formatCurrency(result.totalValueRecovered)}</p>
                      </div>
                      <div>
                          <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">
                              {viewMode === 'joint' ? 'Joint Efficiency' : 'Your Efficiency'}
                          </p>
                          <p className="text-2xl font-bold text-lime-accent tracking-tight drop-shadow-[0_0_10px_rgba(190,242,100,0.3)]">
                            {isInfiniteEfficiency ? '∞' : `+${((multiplier - 1) * 100).toFixed(0)}%`}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Sub Stats - Staggered Entry */}
          <div className="lg:col-span-3 md:col-span-1 animate-enter delay-100">
              <EfficiencyGauge multiplier={multiplier} isJoint={viewMode === 'joint'} isInfinite={isInfiniteEfficiency} />
          </div>
          <div className="lg:col-span-2 md:col-span-1 animate-enter delay-200">
              <DistributionChart pto={displayedPtoUsed} free={displayedFreeDays} />
          </div>
      </div>

      <div className="animate-enter delay-300">
        <YearTimeline 
            blocks={visibleBlocks} 
            isLocked={isLocked} 
            timelineStartDate={result.timelineStartDate} 
            targetYear={result.targetYear} 
            viewMode={viewMode}
        />
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between px-2 animate-enter delay-400">
              <h3 className="text-xl font-bold text-white">Your Schedule</h3>
              <div className="flex gap-2">
                  <button 
                    onClick={() => downloadICS(visibleBlocks)} 
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 transition-all hover:scale-105 active:scale-95"
                  >
                      Download .ICS
                  </button>
              </div>
          </div>

          <div className="grid gap-4">
              {visibleBlocks.map((block, i) => (
                  <div 
                    key={block.id} 
                    className="glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 transition-all duration-300 group relative overflow-hidden animate-enter"
                    style={{ animationDelay: `${500 + (i * 100)}ms` }} // Staggered list items
                  >
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                       
                       <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between relative z-10">
                           <div>
                               <div className="flex items-center gap-3 mb-1">
                                   <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wider">
                                       Block {i + 1}
                                   </span>
                                   {block.efficiencyScore > 3 && (
                                       <span className="text-[10px] font-bold bg-lime-accent/10 text-lime-accent border border-lime-accent/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(190,242,100,0.2)]">
                                           ★ Super Bridge
                                       </span>
                                   )}
                                   {/* View Mode Logic for Tags */}
                                   {viewMode === 'joint' && block.buddyPtoDaysUsed === 0 && block.ptoDaysUsed === 0 && (
                                       <span className="text-[10px] font-bold bg-brand-violet/10 text-brand-violet border border-brand-violet/20 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(124,58,237,0.2)]">
                                           ♥ Joint Freebie
                                       </span>
                                   )}
                               </div>
                               <h4 className="text-lg font-bold text-white tracking-tight">{block.description}</h4>
                               <div className="text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                   <span className="flex items-center gap-1.5">
                                       📅 {formatDate(block.startDate)} — {formatDate(block.endDate)}
                                   </span>
                                   <span className="flex items-center gap-1.5 text-slate-500">
                                       ⏱ {block.totalDaysOff} Days Off
                                   </span>
                               </div>
                           </div>

                           <div className="flex items-center gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <div className="text-right hidden md:block">
                                    <div className="text-xs text-slate-500 uppercase tracking-widest">Cost</div>
                                    <div className="font-bold text-white text-sm">
                                        You: <span className={block.ptoDaysUsed === 0 ? "text-lime-accent" : ""}>{block.ptoDaysUsed}d</span>
                                        {viewMode === 'joint' && hasBuddy && (
                                            <span className="ml-2 text-slate-400">| Buddy: <span className={block.buddyPtoDaysUsed === 0 ? "text-brand-violet" : ""}>{block.buddyPtoDaysUsed}d</span></span>
                                        )}
                                    </div>
                                </div>
                                <a 
                                    href={generateGoogleCalendarLink(block)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs font-bold rounded-lg border border-white/10 transition-all active:scale-95 whitespace-nowrap"
                                >
                                    Add to Calendar
                                </a>
                           </div>
                       </div>
                       
                       {block.publicHolidaysUsed.length > 0 && (
                           <div className="mt-4 flex flex-wrap gap-2">
                               {block.publicHolidaysUsed.map((h, hi) => (
                                   <HolidayTooltip key={hi} holiday={h} />
                               ))}
                           </div>
                       )}
                  </div>
              ))}
          </div>
      </div>
      
      {isLocked && hiddenCount > 0 && (
          <div className="relative mt-8 group cursor-pointer animate-enter delay-500" onClick={handleUnlockClick}>
              {/* Premium Gradient Border Animation */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-lime-accent via-emerald-500 to-lime-accent rounded-[25px] opacity-75 blur-sm group-hover:opacity-100 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>
              
              <div className="absolute inset-0 z-10 backdrop-blur-xl bg-[#020617]/80 flex items-center justify-center rounded-3xl border border-white/10">
                   <div className="text-center p-6 md:p-8 max-w-lg mx-auto relative w-full">
                       
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lime-accent to-emerald-400 text-dark-900 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(190,242,100,0.4)] z-20 whitespace-nowrap transform group-hover:-translate-y-1 transition-transform">
                            Best Deal: Unlock {formatCurrency(hiddenValue)} Value
                       </div>

                       <div className="w-16 h-16 bg-lime-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(132,204,22,0.4)] relative mt-2 group-hover:scale-110 transition-transform duration-500">
                           <svg className="w-8 h-8 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                           <div className="absolute -inset-1 bg-lime-accent/50 rounded-2xl blur-lg -z-10 animate-pulse"></div>
                       </div>
                       
                       <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight">
                           {bestHiddenBlock 
                             ? `Unlock your ${bestHiddenBlock.totalDaysOff}-Day ${bestHiddenBlock.description.split(':')[0]} Bridge`
                             : `Reveal ${hiddenCount} More Trips`
                           }
                       </h3>
                       
                       <p className="text-slate-300 mb-8 leading-relaxed text-sm md:text-base">
                           See exactly when to book to get <strong className="text-white">{hiddenCount} more vacations</strong> worth <strong>{formatCurrency(hiddenValue)}</strong>.
                       </p>
                       
                       <button className="w-full py-4 bg-white text-dark-900 font-bold text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-xl active:scale-95 flex items-center justify-center gap-2 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                           <span>Unlock Full Schedule</span>
                           <span className="text-slate-400 font-medium line-through decoration-slate-400/50">$49</span>
                           <span className="bg-lime-accent/20 text-dark-900 px-2 py-0.5 rounded text-sm">
                               {price.symbol}{price.amount.toFixed(2)}
                           </span>
                       </button>
                       <div className="flex flex-wrap items-center justify-center gap-4 mt-6 opacity-80">
                           <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                               <svg className="w-3 h-3 text-lime-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                               <span className="text-[10px] text-slate-300 uppercase tracking-wide font-bold">Secure Stripe Checkout</span>
                           </div>
                           <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                               <svg className="w-3 h-3 text-lime-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                               <span className="text-[10px] text-slate-300 uppercase tracking-wide font-bold">100% Money-back Guarantee</span>
                           </div>
                       </div>
                   </div>
              </div>

              {/* Placeholder Card Blur */}
              <div className="opacity-30 pointer-events-none select-none blur-sm" aria-hidden="true">
                  <div className="space-y-4">
                      {[1,2,3].map(i => (
                          <div key={i} className="glass-panel rounded-2xl p-6 h-32 flex items-center justify-between">
                              <div className="space-y-2">
                                  <div className="h-4 w-32 bg-slate-700 rounded animate-pulse"></div>
                                  <div className="h-3 w-48 bg-slate-800 rounded"></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <div className="text-center pt-8 pb-4 animate-enter delay-500">
          <button onClick={onReset} className="text-slate-500 hover:text-white text-sm font-bold transition-colors underline decoration-slate-700 hover:decoration-white underline-offset-4">
              Start Over
          </button>
      </div>
    </div>
  );
};