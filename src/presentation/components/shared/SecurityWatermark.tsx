import { useAuthStore } from '../../store';

/**
 * Security Watermark Component
 * 
 * Overlays the current user's identity (Name, ID, Email) on top of content
 * to deter screen recording and unauthorized sharing.
 * 
 * Features:
 * - Floating grid layout
 * - Color shifting animation (White <-> Black) for visibility on any background
 * - Pointer events disabled to allow interaction with underlying content
 * - Low opacity to minimize distraction
 */
export function SecurityWatermark() {
    const { user } = useAuthStore();

    if (!user) return null;

    return (
        <div
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center opacity-[0.08] overflow-hidden"
            aria-hidden="true"
        >
            {/* Define keyframes for color animation locally scoped */}
            <style>
                {`
                    @keyframes watermarkColorShift {
                        0%, 100% { color: rgba(255, 255, 255, 0.9); text-shadow: 0 0 2px rgba(0,0,0,0.5); }
                        50% { color: rgba(0, 0, 0, 0.9); text-shadow: 0 0 2px rgba(255,255,255,0.5); }
                    }
                `}
            </style>

            <div className="grid grid-cols-2 gap-32 transform -rotate-12 select-none w-[150%] h-[150%] flex-shrink-0 items-center justify-center">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="text-2xl font-bold whitespace-nowrap text-center"
                        style={{
                            animation: 'watermarkColorShift 8s infinite ease-in-out',
                        }}
                    >
                        <p>{user.name}</p>
                        <p className="text-lg" dir="ltr">{user.id} - {user.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
