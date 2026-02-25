import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentChildrenSkeleton } from '../../components/ui/skeletons/ParentChildrenSkeleton';
import { ROUTES, generatePath } from '../../../shared/constants';
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
    Zap,
    Loader2,
    Users,
    Unlink2,
    X,
    AlertTriangle,
    ShoppingBag
} from 'lucide-react';
import { LinkStudentModal } from '../../components/parent';
import { parentService, type LinkedStudent } from '../../../data/api';
import { useAuthStore } from '../../store/authStore';
import { getToken } from '../../../data/api/ApiClient';
import { initializeParentEcho, subscribeToParentChannel, unsubscribeFromParentChannel, disconnectParentEcho } from '../../../services/websocket';
import toast from 'react-hot-toast';

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

interface QuizResult {
    quiz_title: string;
    score: number;
    total_possible_score: number;
    passing_percentage: number;
    status: 'passed' | 'failed' | 'completed';
    completed_at: string;
}

interface MonthlyStats {
    month: string;
    gpa: number;
}

interface Child {
    id: number;
    name: string;
    grade: string;
    avatar: string | null;
    school: string;
    gpa: number;
    attendance?: number;
    ranking?: number;
    alertCount?: number;
    gpaHistory?: MonthlyStats[];
    skills?: {
        logic: number;
        creativity: number;
        participation: number;
    };

    subjects: Subject[];
    quizzes: QuizResult[];
    package_subscriptions?: Array<{
        id: number;
        package_id: number;
        package_name: string;
        package_image?: string;
        original_price: number;
        price: number;
        status: 'pending' | 'active' | 'rejected' | 'expired' | 'cancelled';
        status_label: string;
        start_date?: string;
        end_date?: string;
    }>;
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
    // Handle edge cases
    if (!data || data.length < 2) {
        return (
            <div className="w-full h-24 flex items-center justify-center text-slate-400 text-sm">
                لا توجد بيانات كافية للرسم البياني
            </div>
        );
    }

    // Simple SVG line chart logic
    const height = 80;
    const width = 300;
    const maxGPA = 4.0;
    const minGPA = 2.0;

    const points = data.map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
        const y = height - ((d.gpa - minGPA) / (maxGPA - minGPA)) * height;
        return `${isNaN(x) ? 0 : x},${isNaN(y) ? height : y}`;
    }).join(' ');

    // Build the path safely
    const pathPoints = points.split(' ').filter(p => p && !p.includes('NaN'));
    const pathD = pathPoints.length > 0
        ? `M0,${height} ${pathPoints.map(p => `L${p}`).join(' ')} L${width},${height} Z`
        : `M0,${height} L${width},${height} Z`;

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
                    d={pathD}
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
                    const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
                    const y = height - ((d.gpa - minGPA) / (maxGPA - minGPA)) * height;
                    const safeX = isNaN(x) ? 0 : x;
                    const safeY = isNaN(y) ? height / 2 : y;
                    return (
                        <g key={i} className="group cursor-pointer">
                            <circle cx={safeX} cy={safeY} r="4" fill="white" stroke="#C91C25" strokeWidth="2" />
                            {/* Tooltip on hover */}
                            <rect x={safeX - 20} y={safeY - 30} width="40" height="20" rx="4" fill="#1A1A1A" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            <text x={safeX} y={safeY - 17} textAnchor="middle" fill="white" fontSize="10" className="opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                                {d.gpa}
                            </text>
                            <text x={safeX} y={height + 15} textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
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
    // --- State ---
    const [childrenData, setChildrenData] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'subjects' | 'packages'>('subjects');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const { user } = useAuthStore();

    // Unlink state
    const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [unlinkError, setUnlinkError] = useState<string | null>(null);

    // --- Effects ---
    const fetchChildren = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const students = await parentService.getLinkedStudents();

            // Map API data to UI model (filling missing fields with placeholders)
            const mappedChildren = students.map((student: LinkedStudent) => {
                // Map subjects first to allow for GPA calculation
                const subjects = (student.subjects || []).map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    teacher: s.teacher || 'غير محدد',
                    score: s.score || 0,
                    grade: s.grade || 'غير متاح',
                    feedback: s.feedback || '',
                    progress: s.progress || 0,
                    assignments: s.assignments || { total: 0, completed: 0 },
                    isAcademic: s.is_academic ?? true,
                    image: s.image || null,
                    subscription_status: s.subscription_status || 'نشط',
                    subscription_status_key: s.subscription_status_key || 'ACTIVE',
                }));

                // Calculate GPA Algorithm:
                // 1. Use backend 'overall_average_score' if available and non-zero.
                // 2. Fallback: Calculate mean of scores from all academic subjects.
                let gpaValue = Number(student.overall_average_score) || 0;

                if (gpaValue === 0) {
                    const academicSubjects = subjects.filter(s => s.isAcademic);

                    if (academicSubjects.length > 0) {
                        const totalScore = academicSubjects.reduce((acc, curr) => acc + (curr.score || 0), 0);
                        // Divide by total number of academic subjects (including those with 0 score) to get accurate average
                        gpaValue = Math.round(totalScore / academicSubjects.length);
                    }
                }

                return {
                    id: student.id,
                    name: student.name,
                    grade: typeof student.grade === 'object' ? student.grade?.name : (student.grade || 'غير محدد'),
                    school: 'مدرسة سُبُل',
                    avatar: student.image_path || student.avatar || null,
                    uid: student.uid,
                    gpa: gpaValue, // Store as number for CircularProgress
                    attendance: student.attendance,
                    ranking: student.ranking,
                    subjects: subjects,
                    totalSubscriptions: student.total_subscriptions || 0,
                    activeSubscriptions: student.active_subscriptions || 0,
                    // Map quizzes from API
                    quizzes: (student.quizzes || []).map((q: any) => ({
                        quiz_title: q.quiz_title,
                        score: Number(q.score),
                        total_possible_score: Number(q.total_possible_score),
                        passing_percentage: Number(q.passing_percentage),
                        status: q.status,
                        completed_at: q.completed_at
                    })),
                    // Map package subscriptions
                    package_subscriptions: student.package_subscriptions || [],
                };
            });

            setChildrenData(mappedChildren);
            if (mappedChildren.length > 0 && !selectedChildId) {
                setSelectedChildId(mappedChildren[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch children:', err);
            setError('فشل تحميل قائمة الأبناء');
        } finally {
            setIsLoading(false);
        }
    };
    const navigate = useNavigate();

    useEffect(() => {
        fetchChildren();

        // Real-time notifications subscription
        const token = getToken();
        // Since parents have their own user model but share the auth structure, we check user.id
        // We might want to verify user role, but for now assuming if on this page, they are a parent
        if (user?.id && token) {
            try {
                initializeParentEcho(token);
                subscribeToParentChannel(Number(user.id), (event: any) => {


                    if (event.type === 'link_accepted') {
                        toast.success(event.message || 'تم قبول طلب الربط! 🎉');
                        fetchChildren();
                    } else if (event.type === 'link_rejected') {
                        toast.error(event.message || 'تم رفض طلب الربط');
                        fetchChildren(); // To remove potential optimistic states if any, or just sync
                    }
                });
            } catch (err) {
                console.error('WebSocket connection failed:', err);
            }
        }

        return () => {
            if (user?.id) {
                unsubscribeFromParentChannel(Number(user.id));
            }
            disconnectParentEcho();
        };
    }, [user?.id]);

    // Handle unlinking a student
    const handleUnlinkStudent = async () => {
        if (!selectedChildId) return;

        setIsUnlinking(true);
        setUnlinkError(null);
        try {
            await parentService.unlinkStudent(selectedChildId);
            // Reset UI state
            setShowUnlinkConfirm(false);
            // Refresh children list
            await fetchChildren();
            // Select next child or clear selection
            if (childrenData.length <= 1) {
                setSelectedChildId(null);
            }
        } catch (err) {
            console.error('Failed to unlink student:', err);
            setUnlinkError('فشل إلغاء الربط. حاول مرة أخرى.');
        } finally {
            setIsUnlinking(false);
        }
    };

    const selectedChild = childrenData.find(c => c.id === selectedChildId) || childrenData[0];

    if (isLoading) {
        return <ParentChildrenSkeleton />;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. New Header & Student Selector Tabs (UX FIX + Responsive) */}
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal">متابعة الأبناء</h1>
                    <p className="text-slate-500 mt-1">تابع تقدم أبنائك الأكاديمي والمالي</p>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {childrenData.map(child => (
                        <button
                            key={child.id}
                            onClick={() => setSelectedChildId(child.id)}
                            className={`
                                flex items-center gap-3 pl-4 pr-2 py-2 rounded-full transition-all min-w-max border
                                ${selectedChildId === child.id
                                    ? 'bg-shibl-crimson text-white border-shibl-crimson shadow-lg shadow-shibl-crimson/20'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-shibl-crimson/30 hover:bg-slate-50'
                                }
                            `}
                        >
                            <div className={`
                                w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden
                                ${selectedChildId === child.id ? 'border-white/30' : 'border-slate-100'}
                            `}>
                                {child.avatar ? (
                                    <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={20} className={selectedChildId === child.id ? 'text-white' : 'text-slate-400'} />
                                )}
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-sm leading-tight">{child.name}</p>
                                <p className={`text-[10px] ${selectedChildId === child.id ? 'text-white/80' : 'text-slate-400'}`}>
                                    {child.grade}
                                </p>
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-4 text-slate-400 hover:text-shibl-crimson transition-colors min-w-max"
                        title="إضافة ابن جديد"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Plus size={18} />
                        </div>
                    </button>
                </div>
            </div>

            {!isLoading && childrenData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <Users size={40} className="text-slate-300" />
                    </div>
                    <h2 className="text-xl font-bold text-charcoal mb-2">لم يتم ربط أي أبناء بعد</h2>
                    <p className="text-slate-500 mb-6 max-w-md">قم بربط حسابات أبنائك لمتابعة أدائهم الأكاديمي والمالي من مكان واحد.</p>
                    <button
                        onClick={() => setIsLinkModalOpen(true)}
                        className="bg-shibl-crimson text-white px-8 py-3 rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        إضافة ابن جديد
                    </button>
                </div>
            )}

            {/* 2. Main Dashboard Grid */}
            {selectedChild && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Left Column (Profile & Key Metrics) - Span 4 */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8">

                        {/* Hero Card (Refined UX + Responsive) */}
                        <div className="bg-white rounded-[24px] overflow-hidden border border-slate-200 relative shadow-sm group hover:shadow-md transition-shadow">
                            <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-shibl-crimson to-rose-500"></div>

                            <div className="p-6 md:p-8 flex flex-col items-center text-center">
                                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 border-2 border-slate-100 mb-4 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    {selectedChild.avatar ? (
                                        <img src={selectedChild.avatar} alt={selectedChild.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Users size={48} className="text-slate-300" />
                                    )}
                                </div>

                                <h2 className="text-xl md:text-2xl font-extrabold text-charcoal">{selectedChild.name}</h2>
                                <p className="text-slate-500 font-medium text-xs md:text-sm mt-1 mb-6 flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    {selectedChild.grade} • {selectedChild.school}
                                </p>

                                {/* Circular Stats Row - Responsive */}
                                <div className="flex items-center justify-center gap-4 md:gap-6 w-full pt-6 border-t border-slate-100 flex-wrap sm:flex-nowrap">
                                    <CircularProgress value={selectedChild.gpa || 0} color="#10B981" label="المعدل" size={50} />
                                </div>


                                {/* Unlink Section */}
                                <div className="w-full pt-4 mt-4 border-t border-slate-100">
                                    {!showUnlinkConfirm ? (
                                        <button
                                            onClick={() => setShowUnlinkConfirm(true)}
                                            className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1.5 mx-auto transition-colors"
                                        >
                                            <Unlink2 size={14} />
                                            إلغاء ربط الطالب
                                        </button>
                                    ) : (
                                        <div className="bg-red-50 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center gap-2 text-red-600 mb-3">
                                                <AlertTriangle size={18} />
                                                <span className="font-bold text-sm">تأكيد إلغاء الربط</span>
                                            </div>
                                            <p className="text-xs text-red-600/80 mb-4">
                                                سيتم إزالة {selectedChild.name} من قائمة أبنائك. هل أنت متأكد؟
                                            </p>
                                            {unlinkError && (
                                                <p className="text-xs text-red-600 bg-red-100 px-3 py-2 rounded-lg mb-3">{unlinkError}</p>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setShowUnlinkConfirm(false);
                                                        setUnlinkError(null);
                                                    }}
                                                    disabled={isUnlinking}
                                                    className="flex-1 py-2 px-3 text-xs font-bold text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                                >
                                                    إلغاء
                                                </button>
                                                <button
                                                    onClick={handleUnlinkStudent}
                                                    disabled={isUnlinking}
                                                    className="flex-1 py-2 px-3 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    {isUnlinking ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Unlink2 size={14} />
                                                            تأكيد الإلغاء
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skill Radar - Only show if skills data exists and has non-zero values */}
                        {selectedChild.skills && (selectedChild.skills.logic > 0 || selectedChild.skills.creativity > 0 || selectedChild.skills.participation > 0) && (
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
                        )}

                        {/* Quick Actions (Keep existing) */}
                        {/* ... */}


                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(generatePath(ROUTES.PARENT_STORE, { childId: selectedChild.id.toString() }))}
                                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-shibl-crimson/30 hover:shadow-sm transition-all group"
                            >
                                <span className="flex items-center gap-3 font-bold text-charcoal text-sm md:text-base">
                                    <div className="w-8 h-8 rounded-lg bg-shibl-crimson/10 text-shibl-crimson flex items-center justify-center">
                                        <ShoppingBag size={16} />
                                    </div>
                                    تصفح المتجر (جديد)
                                </span>
                                <ArrowRight size={18} className="text-slate-300 group-hover:text-shibl-crimson transition-colors rtl:rotate-180" />
                            </button>



                        </div>
                    </div>

                    {/* Right Column (Detailed Analysis) - Span 8 */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">

                        {/* 1. Academic Trend Graph - Only show if history exists */}
                        {selectedChild.gpaHistory && selectedChild.gpaHistory.length > 0 && (
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
                        )}

                        {/* Recent Exams Section */}
                        {selectedChild.quizzes && selectedChild.quizzes.length > 0 && (
                            <div className="bg-white rounded-[24px] p-6 md:p-8 border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg md:text-xl font-extrabold text-charcoal flex items-center gap-2">
                                        <Award className="text-amber-500" />
                                        أحدث الاختبارات
                                        <span className="text-sm font-bold text-slate-400">({selectedChild.quizzes.length})</span>
                                    </h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-right">
                                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 rounded-tr-xl">الاختبار</th>
                                                <th className="px-4 py-3">التاريخ</th>
                                                <th className="px-4 py-3">الحالة</th>
                                                <th className="px-4 py-3 rounded-tl-xl text-left">الدرجة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedChild.quizzes.map((quiz: QuizResult, idx: number) => (
                                                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3 font-bold text-charcoal">{quiz.quiz_title}</td>
                                                    <td className="px-4 py-3 text-slate-500 font-medium whitespace-nowrap" dir="ltr">
                                                        {new Date(quiz.completed_at).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${quiz.status === 'passed' || quiz.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {quiz.status === 'passed' || quiz.status === 'completed' ? 'ناجح' : 'راسب'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-left">
                                                        <div className="flex flex-col items-end">
                                                            <span className={`font-black text-base ${(quiz.score / quiz.total_possible_score) * 100 >= 90 ? 'text-green-600' :
                                                                (quiz.score / quiz.total_possible_score) * 100 >= 75 ? 'text-blue-600' :
                                                                    (quiz.score / quiz.total_possible_score) * 100 >= 60 ? 'text-amber-600' : 'text-red-500'
                                                                }`}>
                                                                {quiz.score}/{quiz.total_possible_score}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-bold">
                                                                {Math.round((quiz.score / quiz.total_possible_score) * 100)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 2. Content Tabs & Grid */}
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-1">
                            <button
                                onClick={() => setActiveTab('subjects')}
                                className={`pb-3 text-sm md:text-base font-bold transition-all relative ${activeTab === 'subjects' ? 'text-shibl-crimson' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                المواد الدراسية
                                {activeTab === 'subjects' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-shibl-crimson rounded-t-full"></span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('packages')}
                                className={`pb-3 text-sm md:text-base font-bold transition-all relative ${activeTab === 'packages' ? 'text-shibl-crimson' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                الباقات المشتركة
                                {activeTab === 'packages' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-shibl-crimson rounded-t-full"></span>
                                )}
                            </button>
                        </div>

                        {/* Content Area */}
                        {activeTab === 'subjects' ? (() => {
                            const academicCourses = selectedChild.subjects.filter((s: any) => s.isAcademic !== false);
                            const nonAcademicCourses = selectedChild.subjects.filter((s: any) => s.isAcademic === false);

                            const renderCourseCard = (subject: any, isAcademic: boolean) => (
                                <div key={subject.id} className="bg-white rounded-[24px] border border-slate-100 hover:border-shibl-crimson/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col h-full">
                                    {/* Course Cover Image */}
                                    <div className={`h-32 md:h-40 relative overflow-hidden ${isAcademic ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gradient-to-br from-purple-50 to-fuchsia-50'}`}>
                                        {subject.image ? (
                                            <img
                                                src={subject.image}
                                                alt={subject.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative">
                                                {/* Decorative Pattern */}
                                                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                                                {isAcademic ? (
                                                    <div className="w-16 h-16 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                                        <GraduationCap size={32} className="text-blue-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                                        <Zap size={32} className="text-purple-500" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm backdrop-blur-md border border-white/20 ${subject.subscription_status_key === 'ACTIVE'
                                            ? 'bg-emerald-500/90 text-white'
                                            : subject.subscription_status_key === 'PENDING'
                                                ? 'bg-amber-500/90 text-white'
                                                : 'bg-slate-500/90 text-white'
                                            }`}>
                                            {subject.subscription_status || 'نشط'}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4 gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-extrabold text-lg text-charcoal truncate leading-tight mb-2 group-hover:text-shibl-crimson transition-colors">
                                                    {subject.name}
                                                </h4>
                                                <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 w-fit px-2 py-1 rounded-lg">
                                                    <Users size={12} className="text-slate-400" />
                                                    {subject.teacher}
                                                </p>
                                            </div>

                                            {/* Grade Badge - Only show if valid */}
                                            {isAcademic && subject.grade && subject.grade !== 'N/A' && subject.grade !== 'غير متاح' && subject.grade !== 'غير محدد' && (
                                                <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm shrink-0 border
                                                    ${subject.grade.startsWith('A') ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : subject.grade.startsWith('B') ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                    }
                                                `}>
                                                    {subject.grade}
                                                </div>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-auto space-y-3 mb-5">
                                            <div className="flex justify-between items-end text-xs font-bold">
                                                <span className="text-slate-400">نسبة الاكتمال</span>
                                                <span className={`${isAcademic ? 'text-blue-600' : 'text-purple-600'}`}>
                                                    {subject.progress || 0}%
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${isAcademic
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-400 shadow-blue-200'
                                                        : 'bg-gradient-to-r from-purple-500 to-purple-400 shadow-purple-200'
                                                        } shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                                                    style={{ width: `${subject.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl">
                                                <CheckCircle2 size={14} className={subject.assignments?.completed === subject.assignments?.total && subject.assignments?.total > 0 ? "text-emerald-500" : "text-slate-400"} />
                                                {subject.assignments?.completed || 0} / {subject.assignments?.total || 0} واجبات
                                            </div>
                                            <button
                                                onClick={() => navigate(generatePath(ROUTES.PARENT_COURSE_PROGRESS, { childId: selectedChild.id.toString(), courseId: subject.id.toString() }))}
                                                className={`text-xs font-black flex items-center gap-1.5 transition-all px-4 py-2 rounded-xl group/btn ${isAcademic
                                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                                                    : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white'
                                                    }`}>
                                                التفاصيل
                                                <ArrowRight size={14} className="rtl:rotate-180 transition-transform group-hover/btn:-translate-x-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );

                            return (
                                <>
                                    {/* Academic Courses Section */}
                                    {academicCourses.length > 0 && (
                                        <div className="mb-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-extrabold text-charcoal">المواد الأكاديمية</h3>
                                                        <p className="text-xs text-slate-400 font-bold mt-0.5">{academicCourses.length} مادة مسجلة</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {academicCourses.map((subject: any) => renderCourseCard(subject, true))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Non-Academic Courses Section */}
                                    {nonAcademicCourses.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <h3 className="text-lg md:text-xl font-extrabold text-charcoal flex items-center gap-2">
                                                    <Zap className="text-purple-500" />
                                                    الأنشطة والدورات
                                                    <span className="text-sm font-bold text-slate-400">({nonAcademicCourses.length})</span>
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                {nonAcademicCourses.map((subject: any) => renderCourseCard(subject, false))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {selectedChild.subjects.length === 0 && (
                                        <div className="bg-white rounded-[24px] p-8 md:p-12 border border-slate-200 text-center">
                                            <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد مواد مسجلة</h3>
                                            <p className="text-slate-400 text-sm">لم يتم تسجيل الطالب في أي مواد دراسية بعد</p>
                                        </div>
                                    )}
                                </>
                            );
                        })() : (
                            /* Packages Tab Content */
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {selectedChild.package_subscriptions && selectedChild.package_subscriptions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {selectedChild.package_subscriptions.map((sub) => (
                                            <div key={sub.id} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden hover:border-shibl-crimson/20 hover:shadow-xl transition-all duration-300 group flex flex-col">
                                                {/* Package Image Header */}
                                                <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                                                    {sub.package_image ? (
                                                        <img
                                                            src={sub.package_image}
                                                            alt={sub.package_name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <ShoppingBag size={40} className="text-slate-300" />
                                                        </div>
                                                    )}

                                                    {/* Status Badge */}
                                                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm backdrop-blur-md border border-white/20 ${sub.status === 'active' ? 'bg-emerald-500/90 text-white' :
                                                        sub.status === 'pending' ? 'bg-amber-500/90 text-white' :
                                                            sub.status === 'rejected' ? 'bg-red-500/90 text-white' :
                                                                'bg-slate-500/90 text-white'
                                                        }`}>
                                                        {sub.status_label}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h4 className="font-extrabold text-lg text-charcoal mb-2 leading-tight group-hover:text-shibl-crimson transition-colors">
                                                        {sub.package_name}
                                                    </h4>

                                                    <div className="space-y-3 mt-auto pt-4">
                                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl">
                                                            <span>تاريخ الاشتراك:</span>
                                                            <span dir="ltr">{sub.start_date || 'غير محدد'}</span>
                                                        </div>

                                                        {sub.end_date && (
                                                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl">
                                                                <span>تاريخ الانتهاء:</span>
                                                                <span dir="ltr">{sub.end_date}</span>
                                                            </div>
                                                        )}

                                                        <div className="pt-2 flex items-center justify-between">
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-lg font-black text-shibl-crimson">{sub.price}</span>
                                                                <span className="text-xs font-bold text-slate-400 mb-1">د.أ</span>
                                                            </div>

                                                            {/* We could add a 'View Details' button if there was a package detail page for parents */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[24px] p-12 border border-slate-200 text-center">
                                        <ShoppingBag size={48} className="text-slate-200 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-charcoal mb-2">لا توجد باقات مشتركة</h3>
                                        <p className="text-slate-400 text-sm mb-6">لم يشترك الطالب في أي باقات تعليمية بعد</p>
                                        <button
                                            onClick={() => navigate(generatePath(ROUTES.PARENT_STORE, { childId: selectedChild.id.toString() }))}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-shibl-crimson text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
                                        >
                                            <ShoppingBag size={18} />
                                            تصفح الباقات
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Link Student Modal */}
            <LinkStudentModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSuccess={() => {
                    // Refresh linked students list
                    fetchChildren();
                }}
            />
        </div>
    );
}

export default ParentChildrenPage;
