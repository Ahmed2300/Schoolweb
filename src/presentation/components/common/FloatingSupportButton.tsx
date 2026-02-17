import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { ReportProblemModal } from '../ui/ReportProblemModal';

export function FloatingSupportButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-shibl-crimson text-white rounded-full shadow-lg shadow-shibl-crimson/30 hover:bg-shibl-crimson-dark transition-all duration-300 hover:scale-110 flex items-center justify-center group"
                aria-label="الإبلاغ عن مشكلة"
                title="الإبلاغ عن مشكلة"
            >
                <MessageCircleQuestion size={28} />

                {/* Tooltip for desktop */}
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
                    الإبلاغ عن مشكلة
                </span>
            </button>

            <ReportProblemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
