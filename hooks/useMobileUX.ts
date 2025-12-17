import React, { useCallback, useEffect, useState } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

export const useHaptics = () => {
    const trigger = useCallback((type: HapticType = 'light') => {
        if (typeof navigator === 'undefined' || !navigator.vibrate) return;

        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(40);
                break;
            case 'heavy':
                navigator.vibrate(60);
                break;
            case 'selection':
                navigator.vibrate(15);
                break;
            case 'success':
                navigator.vibrate([30, 40, 30]); // Da-da-da
                break;
            case 'error':
                navigator.vibrate([50, 30, 50, 30, 50]); // Buzz-buzz-buzz
                break;
        }
    }, []);

    return { trigger };
};

export const useSwipe = ({
    onSwipeLeft,
    onSwipeRight,
    threshold = 50
}: {
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    threshold?: number
}) => {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > threshold;
        const isRightSwipe = distance < -threshold;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }

        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};

export const useScrollLock = (isLocked: boolean) => {
    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (isLocked) {
            document.body.style.overflow = 'hidden';
            // Prevent iOS rubber banding
            document.body.style.overscrollBehaviorY = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.overscrollBehaviorY = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.overscrollBehaviorY = '';
        };
    }, [isLocked]);
};
