import { Calendar as CalendarIcon, Clock, Video } from 'lucide-react';

export function StudentSchedulePage() {
    // Mock Schedule Data for a week
    const schedule = [
        {
            day: 'اليوم',
            date: '28 ديسمبر',
            active: true,
            classes: [
                { id: 1, subject: 'الرياضيات', time: '09:00 - 10:30', teacher: 'د. محمد علي', type: 'lecture' },
                { id: 2, subject: 'الفيزياء', time: '11:00 - 12:30', teacher: 'أ. فاطمة حسن', type: 'lab' },
            ]
        },
        {
            day: 'غداً',
            date: '29 ديسمبر',
            active: false,
            classes: [
                { id: 3, subject: 'اللغة العربية', time: '10:00 - 11:30', teacher: 'أ. سارة أحمد', type: 'lecture' }
            ]
        },
        {
            day: 'الأربعاء',
            date: '30 ديسمبر',
            active: false,
            classes: []
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-extrabold text-charcoal mb-6 flex items-center gap-2">
                <CalendarIcon className="text-shibl-crimson" />
                الجدول الدراسي
            </h1>

            <div className="space-y-6">
                {schedule.map((day, idx) => (
                    <div key={idx} className={`rounded-[20px] p-6 border ${day.active ? 'bg-white border-shibl-crimson shadow-md' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className={`text-lg font-bold ${day.active ? 'text-shibl-crimson' : 'text-slate-600'}`}>{day.day}</h3>
                                <p className="text-sm text-slate-400">{day.date}</p>
                            </div>
                            {day.active && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">نشط الآن</span>}
                        </div>

                        {day.classes.length > 0 ? (
                            <div className="space-y-3">
                                {day.classes.map(cls => (
                                    <div key={cls.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between hover:shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cls.type === 'lab' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {cls.type === 'lab' ? <Video size={20} /> : <CalendarIcon size={20} />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-charcoal">{cls.subject}</h4>
                                                <p className="text-xs text-slate-500">{cls.teacher}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg">
                                            <Clock size={16} />
                                            {cls.time}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">لا توجد حصص لهذا اليوم</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
