import { motion } from 'framer-motion';
import { BookOpen, FileQuestion, Plus, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../shared/constants';

export function QuickActionsGrid() {
    const navigate = useNavigate();

    const actions = [
        {
            title: "دورة جديدة",
            icon: BookOpen,
            color: "blue",
            path: ROUTES.TEACHER_COURSES,
            desc: "أضف محتوى تعليمي"
        },
        {
            title: "اختبار جديد",
            icon: FileQuestion,
            color: "purple",
            path: ROUTES.TEACHER_QUIZZES,
            desc: "قيم طلابك"
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden relative group">
            {/* abstract shapes - subtle for light mode */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110 duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-50/50 rounded-full -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                    <Plus className="text-shibl-crimson" />
                    الوصول السريع
                </h2>

                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group text-center"
                        >
                            <div className={`w-10 h-10 rounded-xl bg-${action.color}-50 flex items-center justify-center mb-3 group-hover:bg-${action.color}-100 transition-colors`}>
                                <action.icon size={20} className={`text-${action.color}-600`} />
                            </div>
                            <span className="font-bold text-sm text-slate-700">{action.title}</span>
                            <span className="text-[10px] text-slate-400 mt-1">{action.desc}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
