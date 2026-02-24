import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ParallaxHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const orbLayerRef = useRef<HTMLDivElement>(null);
    const foregroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const background = backgroundRef.current;
        const orbLayer = orbLayerRef.current;
        const foreground = foregroundRef.current;

        if (!container || !background || !orbLayer || !foreground) return;

        // Check if mobile — reduce parallax intensity
        const isMobile = window.innerWidth < 768;
        const bgSpeed = isMobile ? 30 : 80;
        const orbSpeed = isMobile ? 15 : 40;
        const fgSpeed = isMobile ? 50 : 120;

        const ctx = gsap.context(() => {
            // Background layer — moves slowest (creates depth)
            gsap.to(background, {
                y: bgSpeed,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            // Orb layer — drifts even slower
            gsap.to(orbLayer, {
                y: orbSpeed,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            // Foreground (family) — moves fastest (pops forward)
            gsap.to(foreground, {
                y: -fgSpeed,
                ease: 'none',
                scrollTrigger: {
                    trigger: container,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, container);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="parallax-hero relative w-full overflow-hidden"
            style={{ height: 'clamp(200px, 50vw, 600px)' }}
            aria-label="سُبُل - علم يوصل للمستقبل"
        >
            {/* Layer 1: Background — red branded image (moves slowest) */}
            <div
                ref={backgroundRef}
                className="absolute inset-0 will-change-transform"
                style={{ top: '-10%', height: '120%' }}
            >
                <img
                    src="/images/hero-background.webp"
                    alt=""
                    role="presentation"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </div>

            {/* Layer 2: Ambient Orbs — CSS-driven glowing radial gradients */}
            <div
                ref={orbLayerRef}
                className="absolute inset-0 will-change-transform pointer-events-none"
                style={{ top: '-5%', height: '110%' }}
            >
                {/* Orb 1: Large warm glow — left side */}
                <div className="parallax-orb parallax-orb-1" />
                {/* Orb 2: Smaller cool accent — right side */}
                <div className="parallax-orb parallax-orb-2" />
                {/* Orb 3: Subtle center shimmer */}
                <div className="parallax-orb parallax-orb-3" />
            </div>

            {/* Layer 3: Foreground — family group (moves fastest) */}
            <div
                ref={foregroundRef}
                className="absolute inset-0 will-change-transform"
                style={{ top: '-10%', height: '120%' }}
            >
                <img
                    src="/images/hero-foreground.webp"
                    alt="طلاب ومعلم سُبُل"
                    className="w-full h-full object-cover"
                    loading="eager"
                />
            </div>
        </section>
    );
};
