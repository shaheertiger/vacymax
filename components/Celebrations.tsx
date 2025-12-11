import React, { useEffect, useState } from 'react';

interface ConfettiProps {
    active: boolean;
    duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ active, duration = 3000 }) => {
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number; delay: number }>>([]);

    useEffect(() => {
        if (active) {
            const colors = ['#F43F5E', '#FB923C', '#A78BFA', '#EC4899', '#F472B6', '#FBBF24'];
            const newParticles = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: -10,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                delay: Math.random() * 300
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [active, duration]);

    if (!active && particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute w-3 h-3 animate-confetti"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: particle.color,
                        transform: `rotate(${particle.rotation}deg)`,
                        animationDelay: `${particle.delay}ms`,
                        animationDuration: `${2000 + Math.random() * 1000}ms`
                    }}
                />
            ))}
        </div>
    );
};

interface CelebrationOverlayProps {
    show: boolean;
    onComplete: () => void;
    title?: string;
    subtitle?: string;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
    show,
    onComplete,
    title = "You're a Genius! 🎉",
    subtitle = "Your dream year is ready"
}) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onComplete, 2500);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <>
            {/* <Confetti active={show} /> */}
            <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-rose-500/20 backdrop-blur-sm animate-fade-in">
                <div className="text-center space-y-4 animate-scale-in px-6">
                    <div className="text-7xl mb-4 animate-bounce">✨</div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-rose-accent via-peach-accent to-rose-accent bg-clip-text text-transparent animate-gradient">
                        {title}
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-700 font-medium">
                        {subtitle}
                    </p>
                </div>
            </div>
        </>
    );
};

interface ProgressMilestoneProps {
    step: number;
    totalSteps: number;
    show: boolean;
}

export const ProgressMilestone: React.FC<ProgressMilestoneProps> = ({ step, totalSteps, show }) => {
    const milestones = [
        { step: 1, emoji: '💰', message: 'Great start!' },
        { step: 2, emoji: '📅', message: 'Love that for you!' },
        { step: 3, emoji: '✨', message: 'You\'re crushing it!' },
        { step: 4, emoji: '🌸', message: 'Almost there, babe!' }
    ];

    const milestone = milestones.find(m => m.step === step);

    if (!show || !milestone) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
            <div className="bg-gradient-to-r from-rose-accent to-peach-accent text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/30">
                <span className="text-2xl">{milestone.emoji}</span>
                <span className="font-bold text-lg">{milestone.message}</span>
            </div>
        </div>
    );
};

interface CountUpNumberProps {
    end: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
    onComplete?: () => void;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
    end,
    duration = 2000,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
    onComplete
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);

            // Easing function for smooth deceleration
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = end * easeOutQuart;

            setCount(current);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                onComplete?.();
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, onComplete]);

    return (
        <span className={className}>
            {prefix}{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{suffix}
        </span>
    );
};

interface SuccessBadgeProps {
    show: boolean;
    label: string;
    icon?: string;
}

export const SuccessBadge: React.FC<SuccessBadgeProps> = ({ show, label, icon = '✓' }) => {
    if (!show) return null;

    return (
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-full font-bold text-sm animate-scale-in shadow-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                {icon}
            </span>
            {label}
        </div>
    );
};
