import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ROUTES } from '../../../shared/constants';
import { ReportProblemModal } from '../ui/ReportProblemModal';

export const Footer = () => {
    const [showReportModal, setShowReportModal] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // We can import commonService here or just hardcode for valid MVP if imports are tricky circle-wise
                // But let's try to do it right.
                // Dynamic import or moving Footer might be needed if commonService depends on something that depends on Footer?
                // commonService -> apiClient -> axios. No circular dependency likely.
                const { commonService } = await import('../../../data/api/commonService');
                const data = await commonService.getSettings();
                const settingsMap: any = {};
                if (data && Array.isArray(data)) {
                    data.forEach((s: any) => { settingsMap[s.key] = s.value; });
                }
                setSettings(settingsMap);
            } catch (error) {
                console.error("Failed to fetch settings footer", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="bg-charcoal pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 text-white" id="contact">
            <ReportProblemModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            />
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-8 mb-8 sm:mb-12 md:mb-16 border-b border-slate-700 pb-8 sm:pb-12 md:pb-16 items-start text-center sm:text-right">
                    <div className="sm:col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-4 sm:mb-6">
                            {settings.logo_path ? (
                                <img src={settings.logo_path} alt={settings.platform_name || "سُبُل"} className="w-10 h-10 object-contain bg-white rounded-full p-1" />
                            ) : (
                                <img src="/images/subol-white.png" alt="سُبُل" className="w-8 h-8 sm:w-10 sm:h-10" />
                            )}
                            <span className="text-xl sm:text-2xl font-extrabold">{settings.platform_name || "سُبُل"}</span>
                        </div>
                        <p className="text-slate-400 leading-[1.8] max-w-sm mx-auto sm:mx-0 text-sm sm:text-base">
                            {settings.description || "سُبل - علم يوصل للمستقبل. نحول التعليم الرقمي إلى تجربة تفاعلية مليئة بالإبداع والتميز."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">عن سُبُل</h4>
                        <Link to={ROUTES.HOME} className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">الرئيسية</Link>
                        <a href="/#stages" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">المراحل الدراسية</a>
                        <Link to={ROUTES.FEATURES} className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">المميزات</Link>
                        <Link to="/privacy-policy" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">سياسة الخصوصية</Link>
                        <Link to="/terms-and-conditions" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">الشروط والأحكام</Link>
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">الدعم</h4>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base text-right"
                        >
                            الإبلاغ عن مشكلة
                        </button>
                        <Link to="/contact" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">تواصل معنا</Link>
                        <Link to={ROUTES.TECH_SUPPORT} className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">الدعم الفني</Link>
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-6">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">تواصل معنا</h4>
                        <p className="text-slate-400 text-sm sm:text-base dir-ltr text-right">
                            {settings.support_email || "support@subol.edu.om"}
                        </p>
                        {settings.contact_phone && (
                            <p className="text-slate-400 text-sm sm:text-base dir-ltr text-right">
                                {settings.contact_phone}
                            </p>
                        )}
                        <div className="flex gap-4 mt-2 justify-center sm:justify-start">
                            {settings.social_twitter && (
                                <a href={settings.social_twitter} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Twitter (X)</a>
                            )}
                            {settings.social_facebook && (
                                <a href={settings.social_facebook} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
                            )}
                            {settings.social_instagram && (
                                <a href={settings.social_instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
                            )}
                            {settings.social_youtube && (
                                <a href={settings.social_youtube} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">YouTube</a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-slate-500 text-xs sm:text-sm font-bold">© {new Date().getFullYear()} {settings.platform_name || "سُبُل"}. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
};
