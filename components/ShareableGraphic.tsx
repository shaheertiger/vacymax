import React, { useRef, useState, useCallback } from 'react';
import { OptimizationResult } from '../types';

interface ShareableGraphicProps {
    result: OptimizationResult;
    onClose: () => void;
}

export const ShareableGraphic: React.FC<ShareableGraphicProps> = ({ result, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const efficiency = result.totalPtoUsed > 0
        ? ((result.totalDaysOff / result.totalPtoUsed - 1) * 100).toFixed(0)
        : '∞';

    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;

        setIsGenerating(true);

        let clonedCard: HTMLDivElement | null = null;
        let captureShell: HTMLDivElement | null = null;

        try {
            // Use html2canvas if available, otherwise use a simple approach
            const { default: html2canvas } = await import('html2canvas').catch(() => ({ default: null }));

            if (html2canvas) {
                const cardNode = cardRef.current;
                const rect = cardNode.getBoundingClientRect();
                const width = Math.ceil(rect.width);
                const height = Math.ceil(rect.height);
                const padding = 24;
                const pixelRatio = Math.min(window.devicePixelRatio || 2, 3);

                // Clone the card into a padded shell so shadows/rounding aren't clipped on mobile captures
                clonedCard = cardNode.cloneNode(true) as HTMLDivElement;
                Object.assign(clonedCard.style, {
                    position: 'relative',
                    width: `${width}px`,
                    height: `${height}px`,
                });

                captureShell = document.createElement('div');
                Object.assign(captureShell.style, {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: `${width + padding * 2}px`,
                    height: `${height + padding * 2}px`,
                    padding: `${padding}px`,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    opacity: '0',
                    zIndex: '-1',
                    transform: 'translateZ(0)',
                    background: '#fdf2f8',
                });
                captureShell.appendChild(clonedCard);
                document.body.appendChild(captureShell);

                // Allow fonts/gradients to settle for mobile captures
                await document.fonts.ready.catch(() => Promise.resolve());
                await new Promise((resolve) => requestAnimationFrame(resolve));
                await new Promise((resolve) => requestAnimationFrame(resolve));

                const canvas = await html2canvas(captureShell, {
                    backgroundColor: '#fdf2f8',
                    scale: pixelRatio,
                    width: width + padding * 2,
                    height: height + padding * 2,
                    scrollX: 0,
                    scrollY: 0,
                    useCORS: true,
                });

                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1));

                if (!blob) {
                    throw new Error('Unable to create image blob');
                }

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'my-vacation-plan.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            } else {
                // Fallback: Copy text to clipboard
                const text = `I'm getting ${result.totalDaysOff} days off with only ${result.totalPtoUsed} PTO days (+${efficiency}% efficiency)! Plan your perfect year at doublemyholidays.com`;
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error('Failed to generate image:', error);
            // Fallback to text copy
            const text = `I'm getting ${result.totalDaysOff} days off with only ${result.totalPtoUsed} PTO days (+${efficiency}% efficiency)! Plan your perfect year at doublemyholidays.com`;
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } finally {
            if (captureShell?.parentNode) {
                captureShell.parentNode.removeChild(captureShell);
            }
            setIsGenerating(false);
        }
    }, [result, efficiency]);

    const handleShare = useCallback(async () => {
        const shareData = {
            title: 'My Vacation Plan',
            text: `I'm getting ${result.totalDaysOff} days off with only ${result.totalPtoUsed} PTO days (+${efficiency}% efficiency)!`,
            url: 'https://doublemyholidays.com',
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [result, efficiency]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-dark-surface rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Share Your Results</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Shareable Card Preview */}
                <div className="p-6">
                    <div
                        ref={cardRef}
                        className="relative bg-gradient-to-br from-rose-500 via-rose-400 to-peach-accent rounded-2xl p-6 text-white overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🌴</span>
                                <span className="text-sm font-bold opacity-90">DoubleMyHolidays</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-white/80 text-sm mb-1">I'm getting</p>
                                    <p className="text-5xl font-bold font-display">
                                        {result.totalDaysOff}
                                        <span className="text-2xl ml-2">days off</span>
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 rounded-xl px-4 py-2">
                                        <p className="text-xs opacity-80">PTO Used</p>
                                        <p className="text-2xl font-bold">{result.totalPtoUsed}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl px-4 py-2">
                                        <p className="text-xs opacity-80">Efficiency</p>
                                        <p className="text-2xl font-bold">+{efficiency}%</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl px-4 py-2">
                                        <p className="text-xs opacity-80">Trips</p>
                                        <p className="text-2xl font-bold">{result.vacationBlocks.length}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/20">
                                    <p className="text-sm opacity-80">
                                        Plan your perfect year at <span className="font-bold">doublemyholidays.com</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        )}
                        {copied ? 'Copied!' : 'Download'}
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-rose-accent to-peach-accent text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
};
