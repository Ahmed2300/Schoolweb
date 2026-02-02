import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { ROUTES } from '../../../shared/constants';

// Lucide Icons
// Lucide Icons

export function AuthNavbar() {
    const { isRTL } = useLanguage();

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-b border-slate-200">
            <nav className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
                <Link to={ROUTES.HOME} className="flex items-center gap-2 hover:scale-105 transition-transform">
                    <img src="/images/subol-red.png" alt="سُبُل" className="w-7 h-7" />
                    <span className="text-xl font-bold text-charcoal">سُبُل</span>
                </Link>


            </nav>
        </header>
    );
}
