import { FileQuestion, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizPlayer } from '../../components/student/quiz/QuizPlayer';

export function StudentQuizzesPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // If ID is present, show Quiz Player Stub (to be implemented fully later)
    if (id) {
        return (
            <QuizPlayer quizId={id} onExit={() => navigate(-1)} />
        );
    }

    const quizzes = [
        { id: 1, title: 'اختبار الجبر النصفي', subject: 'الرياضيات', date: '30 ديسمبر 2024', duration: '60 دقيقة', status: 'pending', score: null },
        { id: 2, title: 'كويز ميكانيكا', subject: 'الفيزياء', date: '25 ديسمبر 2024', duration: '30 دقيقة', status: 'completed', score: '18/20' },
        { id: 3, title: 'اختبار النحو', subject: 'اللغة العربية', date: '20 ديسمبر 2024', duration: '45 دقيقة', status: 'missed', score: null },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> قادم</span>;
            case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> مكتمل</span>;
            case 'missed': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle size={12} /> فائت</span>;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-extrabold text-charcoal mb-6 flex items-center gap-2">
                <FileQuestion className="text-shibl-crimson" />
                الاختبارات والكويزات
            </h1>

            <div className="grid gap-4">
                {quizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                                {quiz.subject[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-charcoal">{quiz.title}</h3>
                                <p className="text-xs text-slate-500">{quiz.subject} • {quiz.duration}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-400 mb-1">الموعد</p>
                                <p className="text-sm font-bold text-slate-700">{quiz.date}</p>
                            </div>

                            <div className="min-w-[100px] flex justify-center">
                                {getStatusBadge(quiz.status)}
                            </div>

                            <div className="min-w-[60px] text-center">
                                {quiz.score ? (
                                    <span className="font-extrabold text-lg text-charcoal">{quiz.score}</span>
                                ) : (
                                    <span className="text-slate-300">-</span>
                                )}
                            </div>

                            {quiz.status === 'pending' && (
                                <button className="bg-shibl-crimson text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-800 transition-colors">
                                    ابدأ الآن
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
