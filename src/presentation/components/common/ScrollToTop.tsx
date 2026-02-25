import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

/**
 * Scrolls to the top of the page on every route change.
 *
 * In a React SPA, navigating between routes does NOT reset scroll position.
 * This component listens to pathname changes and scrolls to (0, 0).
 *
 * It supports both:
 *  - **Lenis** smooth scroll (used via `useLenis` → `lenis.scrollTo(0)`)
 *  - Fallback `window.scrollTo(0, 0)` if Lenis is unavailable
 *
 * Place this inside `<BrowserRouter>` and inside `<ReactLenis>`.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        // Use Lenis API if available (it manages its own scroll position)
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [pathname, lenis]);

    return null;
}
