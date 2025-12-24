import { useLanguage } from '../../hooks';
import './HomePage.css';

export function HomePage() {
    const { t, isRTL } = useLanguage();

    return (
        <div className={`home-page ${isRTL ? 'rtl' : ''}`}>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        {isRTL ? (
                            <>مرحباً بك في <span className="highlight">المنصة التعليمية</span></>
                        ) : (
                            <>Welcome to <span className="highlight">Educational Platform</span></>
                        )}
                    </h1>
                    <p className="hero-description">
                        {isRTL
                            ? 'اكتشف أفضل الكورسات والمواد الدراسية مع مدرسين متميزين'
                            : 'Discover the best courses and study materials with outstanding teachers'
                        }
                    </p>
                    <div className="hero-actions">
                        <a href="/courses" className="btn btn-primary">{t('nav.courses')}</a>
                        <a href="/register" className="btn btn-secondary">{t('auth.register')}</a>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card card-1">📚</div>
                    <div className="hero-card card-2">🎓</div>
                    <div className="hero-card card-3">💡</div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <h2 className="section-title">
                    {isRTL ? 'مميزات المنصة' : 'Platform Features'}
                </h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📹</div>
                        <h3>{isRTL ? 'فيديوهات محمية' : 'Protected Videos'}</h3>
                        <p>{isRTL ? 'محتوى فيديو آمن مع حماية من التسجيل' : 'Secure video content with recording protection'}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📅</div>
                        <h3>{isRTL ? 'حصص مباشرة' : 'Live Sessions'}</h3>
                        <p>{isRTL ? 'حصص مباشرة مع المدرسين عبر Zoom' : 'Live sessions with teachers via Zoom'}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>{isRTL ? 'اختبارات تفاعلية' : 'Interactive Quizzes'}</h3>
                        <p>{isRTL ? 'اختبارات MCQ وتصحيح يدوي' : 'MCQ quizzes and manual grading'}</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👨‍👩‍👧‍👦</div>
                        <h3>{isRTL ? 'متابعة أولياء الأمور' : 'Parent Monitoring'}</h3>
                        <p>{isRTL ? 'متابعة تقدم الأبناء والدرجات' : 'Track children progress and grades'}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="cta-content">
                    <h2>{isRTL ? 'ابدأ رحلتك التعليمية اليوم' : 'Start Your Learning Journey Today'}</h2>
                    <p>{isRTL ? 'سجل الآن واحصل على وصول فوري للمحتوى' : 'Register now and get instant access to content'}</p>
                    <a href="/register" className="btn btn-primary btn-lg">{t('auth.registerNow')}</a>
                </div>
            </section>
        </div>
    );
}
