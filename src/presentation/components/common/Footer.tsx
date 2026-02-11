import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ROUTES } from '../../../shared/constants';
import { ReportProblemModal } from '../ui/ReportProblemModal';

export const Footer = () => {
    const [showReportModal, setShowReportModal] = useState(false);

    return (
        <footer className="bg-charcoal pt-10 sm:pt-14 md:pt-16 lg:pt-20 pb-6 sm:pb-8 md:pb-10 px-4 sm:px-6 text-white" id="contact">
            <ReportProblemModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
            />
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12 md:mb-16 border-b border-slate-700 pb-8 sm:pb-12 md:pb-16 items-start text-center sm:text-right">
                    <div className="sm:col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-4 sm:mb-6">
                            <img src="/images/subol-white.png" alt="سُبُل" className="w-8 h-8 sm:w-10 sm:h-10" />
                            <span className="text-xl sm:text-2xl font-extrabold">سُبُل</span>
                        </div>
                        <p className="text-slate-400 leading-[1.8] max-w-sm mx-auto sm:mx-0 text-sm sm:text-base">
                            سُبل - علم يوصل للمستقبل. نحول التعليم الرقمي إلى تجربة تفاعلية مليئة بالإبداع والتميز.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">روابط سريعة</h4>
                        <Link to={ROUTES.HOME} className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">الرئيسية</Link>
                        <a href="#stages" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">المراحل الدراسية</a>
                        <a href="#features" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">المميزات</a>
                        <Link to="/privacy-policy" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">سياسة الخصوصية</Link>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base text-right"
                        >
                            الإبلاغ عن مشكلة
                        </button>
                        <a href="#contact" className="text-slate-400 hover:text-shibl-crimson transition-colors text-sm sm:text-base">تواصل معنا</a>
                    </div>

                    <div className="flex flex-col gap-4 sm:gap-6">
                        <h4 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">تواصل معنا</h4>
                        <p className="text-slate-400 text-sm sm:text-base">support@subol.edu.om</p>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-slate-500 text-xs sm:text-sm font-bold">© 2024 سُبل. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
};
