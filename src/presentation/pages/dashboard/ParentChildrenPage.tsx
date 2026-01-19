import { useState } from 'react';
import {
    GraduationCap,
    Calendar,
    Award,
    FileText,
    TrendingUp,
    Plus,
    BookOpen,
    ArrowUpRight,
    ArrowRight,
    CheckCircle2,
    Brain,
    Zap
} from 'lucide-react';

// --- Types ---

interface Subject {
    id: number;
    name: string;
    teacher: string;
    score: number;
    grade: string;
    feedback: string;
    progress: number; // 0-100 course completion
    assignments: { total: number; completed: number };
}

interface MonthlyStats {
    month: string;
    gpa: number;
}

interface Child {
    id: number;
    name: string;
    grade: string;
    avatar: string;
    school: string;
    gpa: string;
    attendance: number;
    ranking: number;
    alertCount: number;
    gpaHistory: MonthlyStats[];
    skills: {
        logic: number;
        creativity: number;
        participation: number;
    };
    subjects: Subject[];
}

// --- Custom Components (No external libs) ---

const CircularProgress = ({ value, color, label, size = 60 }: { value: number; color: string; label: string; size?: number }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - ((value || 0) / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Ring */}
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        className="text-slate-100"
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                    />
                    {/* Progress Ring */}
                    <circle
                        style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset }}
                        strokeWidth="5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50%"
                        cy="50%"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-sm font-extrabold text-charcoal">{value}%</span>
                </div>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-slate-400 mt-2">{label}</span>
        </div>
    );
};

const RadarChart = ({ logic, creativity, participation }: { logic: number; creativity: number; participation: number }) => {
    const size = 200;
    const center = size / 2;
    const radius = 80;

    // Convert generic value 0-100 to coordinates
    const getCoordinates = (value: number, index: number, total: number) => {
        const val = value || 0; // fallback
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const x = center + (radius * (val / 100)) * Math.cos(angle);
        const y = center + (radius * (val / 100)) * Math.sin(angle);
        return `${x},${y}`;
    };

    const points = [
        getCoordinates(logic, 0, 3),        // Logic (Top)
        getCoordinates(creativity, 1, 3),   // Creativity (Right)
        getCoordinates(participation, 2, 3) // Participation (Left)
    ].join(' ');

    const bgPoints = [
        getCoordinates(100, 0, 3),
        getCoordinates(100, 1, 3),
        getCoordinates(100, 2, 3)
    ].join(' ');

    return (
        <div className="relative w-full flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Triangle */}
                <polygon points={bgPoints} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points={[getCoordinates(50, 0, 3), getCoordinates(50, 1, 3), getCoordinates(50, 2, 3)].join(' ')} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                {/* Axes */}
                <line x1={center} y1={center} x2={center} y2={center - radius} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={center} y1={center} x2={center + radius * Math.cos(Math.PI * 2 / 3 - Math.PI / 2)} y2={center + radius * Math.sin(Math.PI * 2 / 3 - Math.PI / 2)} stroke="#e2e8f0" strokeWidth="1" />
                <line x1={center} y1={center} x2={center + radius * Math.cos(Math.PI * 4 / 3 - Math.PI / 2)} y2={center + radius * Math.sin(Math.PI * 4 / 3 - Math.PI / 2)} stroke="#e2e8f0" strokeWidth="1" />

                {/* Data Polygon */}
                <polygon points={points} fill="rgba(201, 28, 37, 0.2)" stroke="#C91C25" strokeWidth="2" />

                {/* Labels */}
                <text x={center} y={center - radius - 15} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">منطق</text>
                <text x={center + radius - 10} y={center + radius / 2 + 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">إبداع</text>
                <text x={center - radius + 10} y={center + radius / 2 + 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-500">مشاركة</text>
            </svg>
        </div>
    )
}

const TrendChart = ({ data }: { data: MonthlyStats[] }) => {
    // Simple SVG line chart logic
    const height = 80;
    const width = 300;
    const maxGPA = 4.0;
    const minGPA = 2.0;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.gpa - minGPA) / (maxGPA - minGPA)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-24 overflow-visible" preserveAspectRatio="none">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="gradientDetails" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#C91C25" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#C91C25" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {/* Area Fill */}
                <path
                    d={`M0,${height} ${points.split(' ').map((p, i) => `L${p}`).join(' ')} L${width},${height} Z`}
                    fill="url(#gradientDetails)"
                    className="transition-all duration-500"
                />
                {/* Line */}
                <polyline
                    fill="none"
                    stroke="#C91C25"
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />
                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - ((d.gpa - minGPA) / (maxGPA - minGPA)) * height;
                    return (
                        <g key={i} className="group cursor-pointer">
                            <circle cx={x} cy={y} r="4" fill="white" stroke="#C91C25" strokeWidth="2" />
                            {/* Tooltip on hover */}
                            <rect x={x - 20} y={y - 30} width="40" height="20" rx="4" fill="#1A1A1A" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            <text x={x} y={y - 17} textAnchor="middle" fill="white" fontSize="10" className="opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                                {d.gpa}
                            </text>
                            <text x={x} y={height + 15} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                                {d.month}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// --- Page Component ---

export function ParentChildrenPage() {
    // Expanded Mock Data
    const childrenData: Child[] = [
        {
            id: 1,
            name: 'أحمد',
            grade: 'الصف العاشر',
            avatar: '/images/signin-student.png',
            school: 'مدرسة التفوق النموذجية',
            gpa: '3.8',
            attendance: 95,
            ranking: 5,
            alertCount: 0,
            gpaHistory: [
                { month: 'سبتمبر', gpa: 3.2 },
                { month: 'أكتوبر', gpa: 3.5 },
                { month: 'نوفمبر', gpa: 3.6 },
                { month: 'ديسمبر', gpa: 3.8 },
                { month: 'يناير', gpa: 3.8 },
            ],
            skills: { logic: 85, creativity: 70, participation: 90 },
            subjects: [
                { id: 1, name: 'الرياضيات', teacher: 'أ. محمد العلي', score: 92, grade: 'A', feedback: 'ممتاز، يشارك بفعالية.', progress: 85, assignments: { total: 10, completed: 9 } },
                { id: 2, name: 'الفيزياء', teacher: 'أ. سامي يوسف', score: 88, grade: 'B+', feedback: 'يحتاج للتركيز عملياً.', progress: 70, assignments: { total: 8, completed: 6 } },
                { id: 3, name: 'اللغة العربية', teacher: 'أ. فهد الأحمد', score: 95, grade: 'A', feedback: 'متميز في التعبير.', progress: 95, assignments: { total: 12, completed: 12 } },
                { id: 4, name: 'اللغة الإنجليزية', teacher: 'Mr. John', score: 90, grade: 'A-', feedback: 'Excellent vocabulary.', progress: 80, assignments: { total: 10, completed: 9 } },
            ]
        },
        {
            id: 2,
            name: 'سارة',
            grade: 'الصف الخامس',
            avatar: '/images/signup-student.png',
            school: 'مدرسة المستقبل الابتدائية',
            gpa: '4.0',
            attendance: 98,
            ranking: 1,
            alertCount: 2,
            gpaHistory: [
                { month: 'سبتمبر', gpa: 3.9 },
                { month: 'أكتوبر', gpa: 4.0 },
                { month: 'نوفمبر', gpa: 3.9 },
                { month: 'ديسمبر', gpa: 4.0 },
                { month: 'يناير', gpa: 4.0 },
            ],
            skills: { logic: 92, creativity: 95, participation: 98 },
            subjects: [
                { id: 5, name: 'العلوم', teacher: 'أ. نورة', score: 98, grade: 'A+', feedback: 'عبقرية علمية صغيرة!', progress: 90, assignments: { total: 15, completed: 15 } },
                { id: 6, name: 'الفنون', teacher: 'أ. ليلى', score: 95, grade: 'A', feedback: 'رسماتها مبدعة جداً.', progress: 100, assignments: { total: 5, completed: 5 } },
            ]
        }
    ];

    const [selectedChildId, setSelectedChildId] = useState<number>(childrenData[0].id);
    const selectedChild = childrenData.find(c => c.id === selectedChildId) || childrenData[0];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. New Header & Student Selector Tabs (UX FIX + Responsive) */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal">إدارة الأبناء</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">تابع الأداء الأكاديمي والمهارات الشخصية لكل طفل</p>
                </div>

                {/* Big Student Tabs - Responsive Scrollable */}
                <div className="flex gap-4 border-b border-slate-200 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {childrenData.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`
                                flex items-center gap-3 px-6 py-4 border-b-4 transition-all duration-300 min-w-max
                                ${selectedChildId === child.id
                                    ? 'border-shibl-crimson text-charcoal'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50 rounded-t-xl'
                                }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-full border-2 p-0.5
                                ${selectedChildId === child.id ? 'border-shibl-crimson' : 'border-slate-200 opacity-50'}
                            `}>
                                <img src={child.avatar} alt={child.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div className="text-right">
                                <p className={`text-base md:text-lg font-bold ${selectedChildId === child.id ? 'text-charcoal' : 'text-slate-500'}`}>{child.name}</p>
                                <p className="text-xs font-medium text-slate-400">{child.grade}</p>
                            </div>
                        </button>
                    ))}
                    <button className="flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-shibl-crimson transition-colors min-w-max" title="إضافة ابن جديد">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus size={18} />
                        </div>
                    </button>
                </div>
            </div>

            {/* 2. Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

                {/* Left Column (Profile & Key Metrics) - Span 4 */}
                <div className="lg:col-span-4 space-y-6 md:space-y-8">

                    {/* Hero Card (Refined UX + Responsive) */}
                    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 relative shadow-sm group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-shibl-crimson to-rose-500"></div>

                        <div className="p-6 md:p-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-slate-100 mb-4 bg-white shadow-sm">
                                <img src={selectedChild.avatar} alt={selectedChild.name} className="w-full h-full rounded-full object-cover" />
                            </div>

                            <h2 className="text-xl md:text-2xl font-extrabold text-charcoal">{selectedChild.name}</h2>
                            <p className="text-slate-500 font-medium text-xs md:text-sm mt-1 mb-6 flex items-center gap-2">
                                <GraduationCap size={16} />
                                {selectedChild.grade} • {selectedChild.school}
                            </p>

                            {/* Circular Stats Row - Responsive */}
                            <div className="flex items-center justify-center gap-4 md:gap-6 w-full pt-6 border-t border-slate-100 flex-wrap sm:flex-nowrap">
                                <CircularProgress value={Number(selectedChild.gpa) * 25} color="#10B981" label="المعدل" size={50} />
                                <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                                <CircularProgress value={selectedChild.attendance} color="#3B82F6" label="الحضور" size={50} />
                            </div>
                        </div>
                    </div>

                    {/* Skill Radar */}
                    <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm text-center">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-charcoal flex items-center gap-2">
                                <Brain size={18} className="text-shibl-crimson" />
                                الملف المهاري
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold">رادار المهارات</span>
                        </div>
                        <div className="flex justify-center -my-2 transform scale-90 sm:scale-100">
                            <RadarChart
                                logic={selectedChild.skills.logic}
                                creativity={selectedChild.skills.creativity}
                                participation={selectedChild.skills.participation}
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">يظهر الرسم البياني مجالات تميز الطالب مقارنة بأقرانه</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-shibl-crimson/30 hover:shadow-sm transition-all group">
                            <span className="flex items-center gap-3 font-bold text-charcoal text-sm md:text-base">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                التقرير الفصلي
                            </span>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-shibl-crimson transition-colors rtl:rotate-180" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-shibl-crimson/30 hover:shadow-sm transition-all group">
                            <span className="flex items-center gap-3 font-bold text-charcoal text-sm md:text-base">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Calendar size={16} />
                                </div>
                                سجل الغياب
                            </span>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-shibl-crimson transition-colors rtl:rotate-180" />
                        </button>
                    </div>
                </div>

                {/* Right Column (Detailed Analysis) - Span 8 */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">

                    {/* 1. Academic Trend Graph */}
                    <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div>
                                <h3 className="text-lg md:text-xl font-extrabold text-charcoal flex items-center gap-2">
                                    <TrendingUp className="text-shibl-crimson" />
                                    تطور المستوى الأكاديمي
                                </h3>
                                <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">مؤشر التقدم خلال الـ 6 أشهر الماضية</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 md:px-3 md:py-1 bg-green-50 text-green-700 text-[10px] md:text-xs font-bold rounded-lg flex items-center gap-1 border border-green-100">
                                    <ArrowUpRight size={14} />
                                    <span className="hidden sm:inline">+0.4 تحسن ملحوظ</span>
                                    <span className="sm:hidden">+0.4</span>
                                </span>
                            </div>
                        </div>
                        {/* Custom Chart Component */}
                        <div className="mt-4 px-2 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="min-w-[300px]">
                                <TrendChart data={selectedChild.gpaHistory} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Subject Cards Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h3 className="text-lg md:text-xl font-extrabold text-charcoal flex items-center gap-2">
                                <BookOpen className="text-blue-500" />
                                المواد الدراسية
                            </h3>
                            <button className="text-xs md:text-sm font-bold text-slate-400 hover:text-charcoal transition-colors">عرض الجدول</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {selectedChild.subjects.map(subject => (
                                <div key={subject.id} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-50 to-white rounded-bl-full -mr-4 -mt-4"></div>

                                    <div className="flex justify-between items-start mb-6 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600">
                                                <BookOpen size={20} className="md:w-6 md:h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-base md:text-lg text-charcoal">{subject.name}</h4>
                                                <p className="text-xs text-slate-400 font-bold mt-1">{subject.teacher}</p>
                                            </div>
                                        </div>
                                        {/* Big Grade Badge */}
                                        <div className={`
                                            w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-sm
                                            ${subject.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                                subject.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}
                                        `}>
                                            {subject.grade}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs font-bold text-slate-500">
                                            <span>اكتمال المنهج</span>
                                            <span>{subject.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors" style={{ width: `${subject.progress}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            {subject.assignments.completed}/{subject.assignments.total} واجبات
                                        </div>
                                        <button className="text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50">
                                            التفاصيل
                                            <ArrowRight size={14} className="rtl:rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ParentChildrenPage;
