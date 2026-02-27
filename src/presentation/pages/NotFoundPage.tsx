import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Headphones, HelpCircle, ArrowRight } from 'lucide-react';

/**
 * 404 Not Found Page
 * Displays a friendly error page when users navigate to non-existent routes
 */
export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                {/* 404 Number with Illustration */}
                <div className="relative mb-8">
                    {/* Large 404 Text */}
                    <h1 className="text-[120px] md:text-[180px] font-extrabold text-slate-200 leading-none select-none">
                        4<span className="text-shibl-crimson/20">0</span>4
                    </h1>

                    {/* Illustration overlaid */}
                    <img
                        src="/images/404-illustration.webp"
                        alt="Lost student illustration"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-auto"
                    />
                </div>

                {/* Error Message */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                        عذراً، هذه الصفحة غير موجودة
                    </h2>
                    <p className="text-slate-500 text-lg max-w-md">
                        Oops! Page not found. It seems you've taken a wrong turn on your learning journey.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3 bg-shibl-crimson text-white rounded-xl font-semibold hover:bg-shibl-crimson-dark transition-colors shadow-lg shadow-shibl-crimson/30"
                    >
                        <Home size={20} />
                        العودة للصفحة الرئيسية
                    </button>

                    <Link
                        to="/dashboard/courses"
                        className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30"
                    >
                        <BookOpen size={20} />
                        تصفح الدورات
                    </Link>
                </div>

                {/* Help Links */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 w-full max-w-md">
                    <Link
                        to="/support"
                        className="flex items-center justify-between py-3 border-b border-slate-100 hover:text-shibl-crimson transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Headphones size={20} className="text-shibl-crimson" />
                            <span className="font-medium text-slate-700">الدعم الفني</span>
                        </div>
                        <ArrowRight size={18} className="text-slate-400" />
                    </Link>

                    <Link
                        to="/faq"
                        className="flex items-center justify-between py-3 hover:text-shibl-crimson transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <HelpCircle size={20} className="text-teal-500" />
                            <span className="font-medium text-slate-700">الأسئلة الشائعة</span>
                        </div>
                        <ArrowRight size={18} className="text-slate-400" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
