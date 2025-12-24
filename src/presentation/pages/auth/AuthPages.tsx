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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData);
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
