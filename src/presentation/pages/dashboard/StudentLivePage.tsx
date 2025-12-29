import { Video, Calendar, User } from 'lucide-react';

export function StudentLivePage() {
    const sessions = [
        { id: 1, title: 'مراجعة نهائية - فيزياء', teacher: 'أ. فاطمة حسن', date: 'اليوم', time: '04:00 م', status: 'live' },
        { id: 2, title: 'حلقة نقاش - التاريخ', teacher: 'د. عمر خالد', date: 'غداً', time: '02:00 م', status: 'upcoming' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-extrabold text-charcoal mb-6 flex items-center gap-2">
                <Video className="text-shibl-crimson" />
                الجلسات المباشرة
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map(session => (
                    <div key={session.id} className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm flex flex-col">
                        <div className="h-32 bg-slate-900 relative flex items-center justify-center">
                            <div className={`absolute inset-0 opacity-50 ${session.status === 'live' ? 'bg-red-900' : 'bg-slate-800'}`}></div>
                            <Video className="text-white relative z-10" size={32} />
                            {session.status === 'live' && (
                                <span className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">
                                    مباشر الآن
                                </span>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-charcoal mb-2">{session.title}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <User size={16} />
                                    <span>{session.teacher}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar size={16} />
                                    <span>{session.date} • {session.time}</span>
                                </div>
                            </div>

                            <button className={`w-full py-3 rounded-xl font-bold text-sm mt-auto transition-colors ${session.status === 'live'
                                    ? 'bg-shibl-crimson text-white hover:bg-red-800'
                                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                                }`}>
                                {session.status === 'live' ? 'انضم الآن' : 'تذكيري'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
