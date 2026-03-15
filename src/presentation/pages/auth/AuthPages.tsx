import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../hooks';
import { useAuth } from '../../hooks';
import { ROUTES } from '../../../shared/constants';
import './AuthPages.css';

export function LoginPage() {
    const { t, isRTL } = useLanguage();
    const { login, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
    });

    const [showForceLogin, setShowForceLogin] = useState(false);

    const getDeviceFingerprint = () => {
        let fp = localStorage.getItem('device_fingerprint');
        if (!fp) {
            fp = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID() 
                : Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('device_fingerprint', fp);
        }
        return fp;
    };

    const handleSubmit = async (e: React.FormEvent, force = false) => {
        e.preventDefault();
        try {
            await login({ 
                ...formData, 
                device_fingerprint: getDeviceFingerprint(),
                force_login: force 
            });
            navigate(ROUTES.DASHBOARD);
        } catch (err: any) {
            // Check for 409 Conflict (Active Session)
            if (err?.response?.status === 409 || err?.response?.data?.error_code === 'ACTIVE_SESSION') {
                setShowForceLogin(true);
            } else if (err?.response?.data?.error_code === 'email_not_verified') {
                navigate(ROUTES.VERIFY_EMAIL, {
                    state: {
                        email: formData.emailOrPhone,
                        userType: 'student'
                    }
                });
            }
        }
    };

    return (
        <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{t('auth.login')}</h1>
                        <p>{isRTL ? 'مرحباً بعودتك!' : 'Welcome back!'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="emailOrPhone">{t('auth.email')} / {t('auth.phone')}</label>
                            <input
                                type="text"
                                id="emailOrPhone"
                                value={formData.emailOrPhone}
                                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                                placeholder={isRTL ? 'البريد الإلكتروني أو رقم الهاتف' : 'Email or phone number'}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t('auth.password')}</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">
                            {t('auth.forgotPassword')}
                        </Link>

                        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                            {isLoading ? t('common.loading') : t('auth.login')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.noAccount')}{' '}
                            <Link to={ROUTES.REGISTER}>{t('auth.registerNow')}</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Force Login Modal */}
            {showForceLogin && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isRTL ? 'جلسة نشطة' : 'Active Session'}</h2>
                        <p style={{ margin: '15px 0' }}>
                            {isRTL 
                                ? 'لديك جلسة نشطة على جهاز آخر. هل تريد تسجيل الخروج من الجهاز الآخر وتسجيل الدخول هنا؟' 
                                : 'You have an active session on another device. Do you want to log out from the other device and log in here?'}
                        </p>
                        <div className="modal-actions" style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => setShowForceLogin(false)}
                                disabled={isLoading}
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={isLoading}
                            >
                                {isLoading ? t('common.loading') : (isRTL ? 'تسجيل الدخول' : 'Force Login')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function RegisterPage() {
    const { t, isRTL } = useLanguage();
    const { register, isLoading, error } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return;
        }
        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });
            navigate(ROUTES.DASHBOARD);
        } catch {
            // Error is handled in the hook
        }
    };

    return (
        <div className={`auth-page ${isRTL ? 'rtl' : ''}`}>
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>{t('auth.register')}</h1>
                        <p>{isRTL ? 'أنشئ حسابك الآن' : 'Create your account'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="name">{t('auth.name')}</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email')}</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">{t('auth.phone')}</label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t('auth.password')}</label>
                            <input
                                type="password"
                                id="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={8}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                            {isLoading ? t('common.loading') : t('auth.register')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.hasAccount')}{' '}
                            <Link to={ROUTES.LOGIN}>{t('auth.loginNow')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
