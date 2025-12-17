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

    // Draw the graphic directly to canvas for reliable mobile rendering
    const drawGraphicToCanvas = useCallback(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Set canvas size (2x for retina)
        const scale = 2;
        const width = 400;
        const height = 500;
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.scale(scale, scale);

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#F43F5E'); // rose-500
        gradient.addColorStop(0.5, '#FB7185'); // rose-400
        gradient.addColorStop(1, '#FF9B7A'); // peach-accent

        // Rounded rectangle background
        const radius = 24;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(width - radius, 0);
        ctx.quadraticCurveTo(width, 0, width, radius);
        ctx.lineTo(width, height - radius);
        ctx.quadraticCurveTo(width, height, width - radius, height);
        ctx.lineTo(radius, height);
        ctx.quadraticCurveTo(0, height, 0, height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw decorative circles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(width - 40, 40, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(40, height - 40, 50, 0, Math.PI * 2);
        ctx.fill();

        // Logo and brand name
        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('🌴 DoubleMyHolidays', 30, 50);

        // "I'm getting" text
        ctx.font = '18px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText("I'm getting", 30, 120);

        // Main days off number
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${result.totalDaysOff}`, 30, 200);

        // "days off" text
        ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('days off', 30 + ctx.measureText(`${result.totalDaysOff}`).width + 15, 200);

        // Stats boxes
        const boxY = 260;
        const boxHeight = 70;
        const boxWidth = 100;
        const boxGap = 20;
        const boxes = [
            { label: 'PTO Used', value: `${result.totalPtoUsed}` },
            { label: 'Efficiency', value: `+${efficiency}%` },
            { label: 'Trips', value: `${result.vacationBlocks.length}` }
        ];

        boxes.forEach((box, i) => {
            const boxX = 30 + (boxWidth + boxGap) * i;

            // Draw box background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
            ctx.fill();

            // Label
            ctx.font = '12px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(box.label, boxX + 12, boxY + 22);

            // Value
            ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(box.value, boxX + 12, boxY + 52);
        });

        // Bottom divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 360);
        ctx.lineTo(width - 30, 360);
        ctx.stroke();

        // Footer text
        ctx.font = '14px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Plan your perfect year at', 30, 400);

        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('doublemyholidays.com', 30, 425);

        return canvas;
    }, [result, efficiency]);

    const handleDownload = useCallback(async () => {
        setIsGenerating(true);

        let clonedCard: HTMLDivElement | null = null;
        let captureShell: HTMLDivElement | null = null;

        try {
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            // Use canvas-drawn graphic for reliable mobile rendering
            const canvas = drawGraphicToCanvas();

            if (!canvas) {
                throw new Error('Failed to create canvas');
            }

            const imageData = canvas.toDataURL('image/png');

            // For iOS Safari, open in new tab for users to save
            if (isIOS) {
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <title>Save Your Vacation Plan</title>
                            <style>
                                body { margin: 0; display: flex; flex-direction: column; align-items: center; background: #f5f5f5; padding: 20px; font-family: system-ui; }
                                p { color: #333; margin-bottom: 16px; text-align: center; font-size: 14px; }
                                img { max-width: 100%; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                            </style>
                        </head>
                        <body>
                            <p>Press and hold the image, then tap "Save Image"</p>
                            <img src="${imageData}" alt="My Vacation Plan"/>
                        </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
                    // If popup blocked, try blob download
                    throw new Error('Popup blocked');
                }
            } else {
                // Standard download for other browsers
                const link = document.createElement('a');
                link.download = 'my-vacation-plan.png';
                link.href = imageData;
                link.click();
            }
        } catch (error) {
            console.error('Failed to generate image:', error);
            // Fallback to text copy
            const text = `I'm getting ${result.totalDaysOff} days off with only ${result.totalPtoUsed} PTO days (+${efficiency}% efficiency)! Plan your perfect year at doublemyholidays.com`;
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                // If clipboard fails too, show alert
                alert('Unable to download. Please take a screenshot instead!');
            }
        } finally {
            if (captureShell?.parentNode) {
                captureShell.parentNode.removeChild(captureShell);
            }
            setIsGenerating(false);
        }
    }, [result, efficiency, drawGraphicToCanvas]);

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
