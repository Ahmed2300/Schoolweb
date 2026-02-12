import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    ChevronLeft,
    CheckCircle2,
    Clock,
    CalendarCheck,
    Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMyRequests } from '../../hooks';

const STORAGE_KEY = 'teacher_onboarding_status';

type OnboardingStatus = 'pending' | 'dismissed' | 'completed' | 'remind_later';

function getOnboardingStatus(): OnboardingStatus {
    return (localStorage.getItem(STORAGE_KEY) as OnboardingStatus) || 'pending';
}

function setOnboardingStatus(status: OnboardingStatus) {
    localStorage.setItem(STORAGE_KEY, status);
}

export function TeacherFirstLoginPopup() {
    const navigate = useNavigate();
    const { data: requests = [], isLoading } = useMyRequests();

    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Determine if wizard should show
    useEffect(() => {
        if (isLoading) return;

        const status = getOnboardingStatus();

        // Never show if completed or permanently dismissed
        if (status === 'completed' || status === 'dismissed') {
            return;
        }

        // Don't show if teacher already has bookings (implicit completion)
        if (requests.length > 0) {
            setOnboardingStatus('completed');
            return;
        }

        // Show for pending or remind_later (next session)
        // For remind_later, clear it so it shows this session
        if (status === 'remind_later') {
            setOnboardingStatus('pending');
        }

        setIsOpen(true);
    }, [isLoading, requests]);

    // Wizard steps - simple and informational
    const steps = [
        {
            id: 'welcome',
            title: 'مرحباً بك في منصة المعلمين',
            subtitle: 'إعداد جدولك الدراسي',
            description: 'قبل البدء في التدريس، تحتاج إلى تحديد مواعيد الحصص التي ستقوم بتدريسها.',
            icon: Sparkles,
            features: [
                { icon: Calendar, text: 'اختر المواعيد المتاحة لك' },
                { icon: Clock, text: 'حدد أوقات الحصص لكل صف' },
                { icon: CalendarCheck, text: 'أدر جدولك بسهولة' }
            ]
        },
        {
            id: 'ready',
            title: 'جاهز للبدء!',
            subtitle: 'صفحة الجدول الزمني',
            description: 'سننقلك الآن إلى صفحة الجدول الزمني حيث يمكنك حجز المواعيد المتاحة.',
            icon: CheckCircle2,
            features: [
                { icon: CheckCircle2, text: 'اختر الفترات الزمنية المناسبة' },
                { icon: CheckCircle2, text: 'راجع حجوزاتك في أي وقت' },
                { icon: CheckCircle2, text: 'يمكنك التعديل لاحقاً' }
            ]
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleGoToSchedule();
        }
    };

    const handleGoToSchedule = () => {
        setOnboardingStatus('completed');
        setIsOpen(false);
        navigate('/teacher/weekly-schedule');
    };

    const handleRemindLater = () => {
        setOnboardingStatus('remind_later');
        setIsOpen(false);
    };

    const handleDismiss = () => {
        setOnboardingStatus('dismissed');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    const currentStepData = steps[currentStep];
    const progress = ((currentStep + 1) / steps.length) * 100;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        {/* Progress Bar */}
                        <div className="h-1.5 bg-red-50 w-full">
                            <motion.div
                                className="h-full bg-gradient-to-r from-shibl-crimson to-rose-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            {/* Icon */}
                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 bg-gradient-to-br from-red-50 to-rose-100 dark:from-white/10 dark:to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
                            >
                                <currentStepData.icon className="w-10 h-10 text-shibl-crimson" />
                            </motion.div>

                            {/* Text */}
                            <motion.div
                                key={`text-${currentStep}`}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-sm text-shibl-crimson font-semibold mb-2">
                                    {currentStepData.subtitle}
                                </p>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                    {currentStepData.title}
                                </h2>
                                <p className="text-slate-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                                    {currentStepData.description}
                                </p>
                            </motion.div>

                            {/* Features List */}
                            <motion.div
                                key={`features-${currentStep}`}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-3 mb-8"
                            >
                                {currentStepData.features.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-right"
                                    >
                                        <div className="w-8 h-8 bg-white dark:bg-white/10 rounded-lg flex items-center justify-center shadow-sm">
                                            <feature.icon className="w-4 h-4 text-shibl-crimson" />
                                        </div>
                                        <span className="text-slate-700 dark:text-gray-300 font-medium flex-1">
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 pb-8">
                            {/* Main CTA */}
                            <button
                                onClick={handleNext}
                                className="w-full py-4 bg-gradient-to-r from-shibl-crimson to-shibl-crimson-dark text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-shibl-crimson/25 flex items-center justify-center gap-2 mb-3"
                            >
                                {isLastStep ? 'الذهاب لصفحة الجدول' : 'متابعة'}
                                <ChevronLeft size={20} />
                            </button>

                            {/* Secondary Actions */}
                            <div className="flex items-center justify-center gap-4 text-sm">
                                <button
                                    onClick={handleRemindLater}
                                    className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    ذكّرني لاحقاً
                                </button>
                                <span className="text-slate-200 dark:text-white/10">|</span>
                                <button
                                    onClick={handleDismiss}
                                    className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    لا تظهر مجدداً
                                </button>
                            </div>

                            {/* Step Indicators */}
                            <div className="flex justify-center gap-2 mt-6">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all ${idx === currentStep
                                            ? 'w-8 bg-shibl-crimson'
                                            : idx < currentStep
                                                ? 'w-2 bg-rose-300 dark:bg-rose-900'
                                                : 'w-2 bg-slate-200 dark:bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
