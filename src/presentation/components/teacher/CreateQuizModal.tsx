import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '../../hooks';
import {
    quizService,
    teacherService,
    getCourseName,
    CreateQuizData,
    QuizType,
    TeacherCourse,
    Quiz
} from '../../../data/api';
import type { Unit } from '../../../types/unit';

// Icons
import {
    X,
    ChevronRight,
    ChevronLeft,
    FileQuestion,
    FileEdit,
    Plus,
    Trash2,
    CheckCircle,
    AlertCircle,
    Loader2,
    Clock,
    BookOpen,
    Send
} from 'lucide-react';
import toast from 'react-hot-toast';

// ==================== TYPES ====================

interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    courses: TeacherCourse[];
    quiz?: Quiz | null;
    /** When provided, course is auto-selected and locked (not changeable) */
    lockedCourseId?: number;
    /** Optional unit context for creating nested quiz */
    unitId?: number | null;
    /** Optional lecture context for creating nested quiz */
    lectureId?: number | null;
}

interface QuestionData {
    id: string;
    question_text_ar: string;
    question_text_en: string;
    points: number;
    model_answer_ar?: string;
    model_answer_en?: string;
    options?: Array<{
        id: string;
        option_text_ar: string;
        option_text_en: string;
        is_correct: boolean;
    }>;
}

// ==================== STEP COMPONENTS ====================

// Step 1: Select Course and Quiz Type
interface Step1Props {
    courses: TeacherCourse[];
    units: Unit[];
    loadingUnits: boolean;
    selectedCourse: number | null;
    selectedUnit: number | null;
    selectedLecture: number | null;
    quizType: QuizType | null;
    onSelectCourse: (id: number) => void;
    onSelectUnit: (id: number | null) => void;
    onSelectLecture: (id: number | null) => void;
    onSelectType: (type: QuizType) => void;
    lockedCourseId?: number;
    lockedUnitId?: number | null;
    lockedLectureId?: number | null;
}

function Step1SelectType({
    courses,
    units,
    loadingUnits,
    selectedCourse,
    selectedUnit,
    selectedLecture,
    quizType,
    onSelectCourse,
    onSelectUnit,
    onSelectLecture,
    onSelectType,
    lockedCourseId,
    lockedUnitId,
    lockedLectureId
}: Step1Props) {
    // Find the locked course name if locked
    const lockedCourse = lockedCourseId ? courses.find(c => c.id === lockedCourseId) : null;

    // Get lectures for selected unit
    const activeUnit = units.find(u => u.id === selectedUnit);
    const lectures = activeUnit?.lectures || [];

    // Determine what to show based on locking level
    const showCourseSelect = !lockedCourseId;
    const showUnitSelect = !lockedUnitId;
    const showLectureSelect = !lockedLectureId;

    // Calculate display strings for locked contexts
    const lockedUnitName = lockedUnitId ? units.find(u => u.id === lockedUnitId)?.title : '';
    const lockedLectureName = lockedLectureId ? (units.find(u => u.id === lockedUnitId)?.lectures?.find((l: any) => l.id === lockedLectureId)?.title) : '';

    return (
        <div className="space-y-6">
            <div className={`grid grid-cols-1 ${lockedLectureId ? 'hidden' : 'md:grid-cols-2'} gap-4`}>
                {/* Course Selection */}
                {showCourseSelect ? (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                            الدورة <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCourse || ''}
                            onChange={(e) => {
                                onSelectCourse(Number(e.target.value));
                                onSelectUnit(null);
                                onSelectLecture(null);
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F]"
                        >
                            <option value="">-- اختر الدورة --</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {getCourseName(course.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                {/* Unit Selection */}
                {showUnitSelect && (
                    <div className={showCourseSelect ? "" : "md:col-span-2"}>
                        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                            الوحدة <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedUnit || ''}
                            onChange={(e) => {
                                onSelectUnit(Number(e.target.value) || null);
                                onSelectLecture(null);
                            }}
                            disabled={!selectedCourse || loadingUnits}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] disabled:opacity-50"
                        >
                            <option value="">{loadingUnits ? 'جاري التحميل...' : '-- اختر الوحدة --'}</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    {typeof unit.title === 'string' ? unit.title : unit.title.ar || unit.title.en}
                                </option>
                            ))}
                        </select>
                    </div>
                )}


                {/* Lecture Selection */}
                {showLectureSelect && (
                    <div className={showUnitSelect ? "" : "md:col-span-2"}>
                        <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                            المحاضرة <span className="text-xs text-slate-400">(اختياري)</span>
                        </label>
                        <select
                            value={selectedLecture || ''}
                            onChange={(e) => onSelectLecture(Number(e.target.value) || null)}
                            disabled={!selectedUnit}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] disabled:opacity-50"
                        >
                            <option value="">-- اختر المحاضرة --</option>
                            {lectures.map((lecture: any) => (
                                <option key={lecture.id} value={lecture.id}>
                                    {typeof lecture.title === 'string' ? lecture.title : lecture.title.ar || lecture.title.en}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Context Summary Badge (Shows what's locked/active) */}
            <div className="flex flex-wrap gap-2 items-center text-sm text-[#636E72] bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-medium text-[#1F1F1F]">المسار المحدد:</span>

                <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{lockedCourseId && lockedCourse ? getCourseName(lockedCourse.name) : (courses.find(c => c.id === selectedCourse)?.name && getCourseName(courses.find(c => c.id === selectedCourse)!.name) || 'غير محدد')}</span>
                </div>

                {(selectedUnit || lockedUnitId) && (
                    <>
                        <ChevronLeft size={14} className="text-slate-300 rtl:rotate-180" />
                        <span className="font-medium text-shibl-crimson">
                            {lockedUnitId
                                ? typeof lockedUnitName === 'string' ? lockedUnitName : (lockedUnitName as any)?.ar
                                : units.find(u => u.id === selectedUnit)?.title && (typeof units.find(u => u.id === selectedUnit)?.title === 'string' ? units.find(u => u.id === selectedUnit)?.title : (units.find(u => u.id === selectedUnit)?.title as any).ar)}
                        </span>
                    </>
                )}

                {(selectedLecture || lockedLectureId) && (
                    <>
                        <ChevronLeft size={14} className="text-slate-300 rtl:rotate-180" />
                        <span>
                            {lockedLectureId && lockedLectureName && (typeof lockedLectureName === 'string' ? lockedLectureName : (lockedLectureName as any).ar)}
                            {!lockedLectureId && selectedLecture && lectures.find((l: any) => l.id === selectedLecture)?.title && (typeof lectures.find((l: any) => l.id === selectedLecture)?.title === 'string' ? lectures.find((l: any) => l.id === selectedLecture)?.title : (lectures.find((l: any) => l.id === selectedLecture)?.title as any).ar)}
                        </span>
                    </>
                )}
            </div>

            {/* Quiz Type Selection */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-3">
                    نوع الاختبار <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {/* MCQ Option */}
                    <button
                        onClick={() => onSelectType('mcq')}
                        className={`p-6 rounded-2xl border-2 transition-all text-center ${quizType === 'mcq'
                            ? 'border-shibl-crimson bg-red-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                    >
                        <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${quizType === 'mcq' ? 'bg-shibl-crimson text-white' : 'bg-blue-100 text-blue-600'
                            }`}>
                            <FileQuestion size={28} />
                        </div>
                        <h3 className="font-semibold text-[#1F1F1F] mb-1">اختيار من متعدد</h3>
                        <p className="text-sm text-[#636E72]">
                            أسئلة مع خيارات متعددة تُصحح تلقائياً
                        </p>
                    </button>

                    {/* Essay Option */}
                    <button
                        onClick={() => onSelectType('essay')}
                        className={`p-6 rounded-2xl border-2 transition-all text-center ${quizType === 'essay'
                            ? 'border-shibl-crimson bg-red-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                    >
                        <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${quizType === 'essay' ? 'bg-shibl-crimson text-white' : 'bg-purple-100 text-purple-600'
                            }`}>
                            <FileEdit size={28} />
                        </div>
                        <h3 className="font-semibold text-[#1F1F1F] mb-1">أسئلة مكتوبة</h3>
                        <p className="text-sm text-[#636E72]">
                            أسئلة مقالية مع إجابة نموذجية للطالب
                        </p>
                    </button>
                </div>
                <p className="text-xs text-[#636E72] mt-3 flex items-center gap-1">
                    <AlertCircle size={12} />
                    لا يمكن الجمع بين النوعين في اختبار واحد
                </p>
            </div>
        </div>
    );
}

// Step 2: Add Questions
interface Step2Props {
    quizType: QuizType;
    questions: QuestionData[];
    onAddQuestion: () => void;
    onUpdateQuestion: (id: string, data: Partial<QuestionData>) => void;
    onDeleteQuestion: (id: string) => void;
    onAddOption: (questionId: string) => void;
    onUpdateOption: (questionId: string, optionId: string, data: { option_text_ar?: string; option_text_en?: string; is_correct?: boolean }) => void;
    onDeleteOption: (questionId: string, optionId: string) => void;
}

function Step2Questions({ quizType, questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onAddOption, onUpdateOption, onDeleteOption }: Step2Props) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F1F1F]">
                    الأسئلة ({questions.length})
                </h3>
                <button
                    onClick={onAddQuestion}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-shibl-crimson text-white text-sm font-medium hover:bg-red-600 transition-colors"
                >
                    <Plus size={16} />
                    إضافة سؤال
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <FileQuestion size={40} className="mx-auto text-slate-400 mb-3" />
                    <p className="text-[#636E72]">لا توجد أسئلة بعد</p>
                    <button
                        onClick={onAddQuestion}
                        className="mt-3 text-shibl-crimson hover:underline text-sm font-medium"
                    >
                        أضف سؤالك الأول
                    </button>
                </div>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {questions.map((question, index) => (
                        <div key={question.id} className="bg-white rounded-xl border border-slate-200 p-4">
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-shibl-crimson">
                                    السؤال {index + 1}
                                </span>
                                <button
                                    onClick={() => onDeleteQuestion(question.id)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Question Text (Arabic) */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="نص السؤال بالعربية *"
                                    value={question.question_text_ar}
                                    onChange={(e) => onUpdateQuestion(question.id, { question_text_ar: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm"
                                />
                            </div>

                            {/* Question Text (English) */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Question text in English (optional)"
                                    value={question.question_text_en}
                                    onChange={(e) => onUpdateQuestion(question.id, { question_text_en: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm"
                                    dir="ltr"
                                />
                            </div>

                            {/* Points */}
                            <div className="mb-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#636E72]">الدرجة:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={question.points}
                                        onChange={(e) => onUpdateQuestion(question.id, { points: Number(e.target.value) })}
                                        className="w-16 h-8 px-2 rounded-lg bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm text-center"
                                    />
                                </div>
                            </div>

                            {/* MCQ Options */}
                            {quizType === 'mcq' && question.options && (
                                <div className="mt-4 space-y-2">
                                    <label className="text-xs text-[#636E72] mb-2 block">الخيارات:</label>
                                    {question.options.map((option, optIndex) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                            <button
                                                onClick={() => onUpdateOption(question.id, option.id, { is_correct: !option.is_correct })}
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${option.is_correct
                                                    ? 'border-emerald-500 bg-emerald-500 text-white'
                                                    : 'border-slate-300 hover:border-slate-400'
                                                    }`}
                                            >
                                                {option.is_correct && <CheckCircle size={14} />}
                                            </button>
                                            <input
                                                type="text"
                                                placeholder={`الخيار ${optIndex + 1} بالعربية`}
                                                value={option.option_text_ar}
                                                onChange={(e) => onUpdateOption(question.id, option.id, { option_text_ar: e.target.value })}
                                                className="flex-1 h-9 px-3 rounded-lg bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm"
                                            />
                                            <button
                                                onClick={() => onDeleteOption(question.id, option.id)}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {question.options.length < 6 && (
                                        <button
                                            onClick={() => onAddOption(question.id)}
                                            className="text-sm text-shibl-crimson hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={14} />
                                            إضافة خيار
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Essay Model Answer */}
                            {quizType === 'essay' && (
                                <div className="mt-4">
                                    <label className="text-xs text-[#636E72] mb-2 block">الإجابة النموذجية:</label>
                                    <textarea
                                        placeholder="الإجابة النموذجية بالعربية (تظهر للطالب بعد التسليم)"
                                        value={question.model_answer_ar || ''}
                                        onChange={(e) => onUpdateQuestion(question.id, { model_answer_ar: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Step 3: Settings
interface Step3Props {
    quizName: string;
    durationMinutes: number;
    passingPercentage: number;
    onUpdateName: (name: string) => void;
    onUpdateDuration: (minutes: number) => void;
    onUpdatePassing: (percentage: number) => void;
}

function Step3Settings({ quizName, durationMinutes, passingPercentage, onUpdateName, onUpdateDuration, onUpdatePassing }: Step3Props) {
    return (
        <div className="space-y-6">
            {/* Quiz Name */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                    اسم الاختبار <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="مثال: اختبار الفصل الأول"
                    value={quizName}
                    onChange={(e) => onUpdateName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F]"
                />
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                    مدة الاختبار (بالدقائق)
                </label>
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[#636E72]" />
                    <input
                        type="number"
                        min="0"
                        max="180"
                        value={durationMinutes}
                        onChange={(e) => onUpdateDuration(Number(e.target.value))}
                        className="w-24 h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-[#1F1F1F] text-center"
                    />
                    <span className="text-sm text-[#636E72]">دقيقة</span>
                </div>
                <p className="text-xs text-[#636E72] mt-1">اتركه 0 للسماح بوقت غير محدود</p>
            </div>

            {/* Passing Percentage */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] mb-2">
                    نسبة النجاح (%)
                </label>
                <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-500" />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={passingPercentage}
                        onChange={(e) => onUpdatePassing(Number(e.target.value))}
                        className="w-24 h-12 px-4 rounded-xl bg-[#F8F9FA] border border-slate-200 focus:border-shibl-crimson outline-none transition-all text-[#1F1F1F] text-center"
                    />
                    <span className="text-sm text-[#636E72]">%</span>
                </div>
            </div>
        </div>
    );
}

// ==================== MAIN MODAL ====================

export function CreateQuizModal({ isOpen, onClose, onSuccess, courses, quiz, lockedCourseId, unitId, lectureId }: CreateQuizModalProps) {
    const { isRTL } = useLanguage();

    // Step state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Form state - auto-set course if locked
    const [selectedCourse, setSelectedCourse] = useState<number | null>(lockedCourseId || null);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(unitId || null);
    const [selectedLecture, setSelectedLecture] = useState<number | null>(lectureId || null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);

    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [quizName, setQuizName] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [passingPercentage, setPassingPercentage] = useState(60);
    const [questions, setQuestions] = useState<QuestionData[]>([]);

    // Fetch units when course changes (Moved to parent for validation)
    useEffect(() => {
        const fetchUnits = async () => {
            const courseIdToUse = lockedCourseId || selectedCourse;
            if (!courseIdToUse) {
                setUnits([]);
                return;
            }

            setLoadingUnits(true);
            try {
                const response = await teacherService.getUnits(courseIdToUse);
                const sortedUnits = (response.data || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                setUnits(sortedUnits);
            } catch (error) {
                // If create mode and no course selected yet, silent fail. 
                // But error might appear if selectedCourse is updated. 
                console.error('Failed to fetch units', error);
            } finally {
                setLoadingUnits(false);
            }
        };

        fetchUnits();
    }, [selectedCourse, lockedCourseId]);

    // Initialize/Reset State
    useEffect(() => {
        if (isOpen) {
            if (quiz) {
                // Edit Mode
                setSelectedCourse(quiz.course_id);
                setSelectedUnit(quiz.unit_id || null);
                setSelectedLecture(quiz.lecture_id || null);
                setQuizType(quiz.quiz_type);
                // Handle name translation properly
                const name = typeof quiz.name === 'string'
                    ? JSON.parse(quiz.name).ar // Fallback if name is JSON string
                    : (quiz.name as any).ar || (quiz.name as any).en || '';
                setQuizName(name);

                setDurationMinutes(quiz.duration_minutes);
                setPassingPercentage(Number(quiz.passing_percentage));

                // Map questions
                if (quiz.questions) {
                    setQuestions(quiz.questions.map(q => ({
                        id: q.id?.toString() || generateId(),
                        question_text_ar: typeof q.question_text === 'string' ? JSON.parse(q.question_text).ar : (q.question_text as any).ar,
                        question_text_en: typeof q.question_text === 'string' ? JSON.parse(q.question_text).en : (q.question_text as any).en || '',
                        points: q.points,
                        model_answer_ar: q.model_answer ? (typeof q.model_answer === 'string' ? JSON.parse(q.model_answer).ar : (q.model_answer as any).ar) : '',
                        model_answer_en: q.model_answer ? (typeof q.model_answer === 'string' ? JSON.parse(q.model_answer).en : (q.model_answer as any).en) : '',
                        options: q.options?.map(o => ({
                            id: o.id?.toString() || generateId(),
                            option_text_ar: typeof o.option_text === 'string' ? JSON.parse(o.option_text).ar : (o.option_text as any).ar,
                            option_text_en: typeof o.option_text === 'string' ? JSON.parse(o.option_text).en : (o.option_text as any).en || '',
                            is_correct: !!o.is_correct
                        }))
                    })));
                } else {
                    setQuestions([]);
                }
            } else {
                // Create Mode - Reset
                setCurrentStep(1);
                setSelectedCourse(lockedCourseId || null);
                setSelectedUnit(unitId || null);
                setSelectedLecture(lectureId || null);
                setQuizType(null);
                setQuizName('');
                setDurationMinutes(30);
                setPassingPercentage(60);
                setQuestions([]);
            }
            setCurrentStep(1);
            setError(null);
        }
    }, [isOpen, quiz]);

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Question management
    const handleAddQuestion = useCallback(() => {
        const newQuestion: QuestionData = {
            id: generateId(),
            question_text_ar: '',
            question_text_en: '',
            points: 5,
            options: quizType === 'mcq' ? [
                { id: generateId(), option_text_ar: '', option_text_en: '', is_correct: false },
                { id: generateId(), option_text_ar: '', option_text_en: '', is_correct: false },
            ] : undefined
        };
        setQuestions(prev => [...prev, newQuestion]);
    }, [quizType]);

    const handleUpdateQuestion = useCallback((id: string, data: Partial<QuestionData>) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
    }, []);

    const handleDeleteQuestion = useCallback((id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    }, []);

    const handleAddOption = useCallback((questionId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: [...q.options, { id: generateId(), option_text_ar: '', option_text_en: '', is_correct: false }]
                };
            }
            return q;
        }));
    }, []);

    const handleUpdateOption = useCallback((questionId: string, optionId: string, data: { option_text_ar?: string; option_text_en?: string; is_correct?: boolean }) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId && q.options) {
                // If setting is_correct to true, deselect all other options (radio button behavior)
                if (data.is_correct === true) {
                    return {
                        ...q,
                        options: q.options.map(o => ({
                            ...o,
                            is_correct: o.id === optionId ? true : false,
                            ...(o.id === optionId && data.option_text_ar !== undefined ? { option_text_ar: data.option_text_ar } : {}),
                            ...(o.id === optionId && data.option_text_en !== undefined ? { option_text_en: data.option_text_en } : {})
                        }))
                    };
                }
                // Normal update (text changes only, or deselecting)
                return {
                    ...q,
                    options: q.options.map(o => o.id === optionId ? { ...o, ...data } : o)
                };
            }
            return q;
        }));
    }, []);

    const handleDeleteOption = useCallback((questionId: string, optionId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId && q.options) {
                return {
                    ...q,
                    options: q.options.filter(o => o.id !== optionId)
                };
            }
            return q;
        }));
    }, []);

    // Navigation - check lockedCourseId OR selectedCourse for step 1
    const canGoNext = () => {
        switch (currentStep) {
            case 1:
                const courseSelected = (lockedCourseId || selectedCourse !== null);
                const unitSelected = (unitId || selectedUnit !== null);
                // Require unit selection if units are available or loaded
                // If units are loading, prevent next
                if (loadingUnits) return false;

                // If course has units, user MUST select one
                const unitsAvailable = units.length > 0;

                return courseSelected && quizType !== null && (!unitsAvailable || unitSelected);

            case 2:
                // Require at least one question with text
                if (questions.length === 0) return false;
                if (!questions.every(q => q.question_text_ar.trim() !== '')) return false;

                // For MCQ: Each question must have exactly one correct answer
                if (quizType === 'mcq') {
                    const allHaveCorrectAnswer = questions.every(q => {
                        if (!q.options || q.options.length === 0) return false;
                        const correctCount = q.options.filter(o => o.is_correct).length;
                        return correctCount === 1;
                    });
                    if (!allHaveCorrectAnswer) return false;
                }

                return true;

            case 3: return quizName.trim() !== '';
            default: return false;
        }
    };

    const handleNext = () => {
        if (canGoNext() && currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Submit
    const handleSubmit = async (shouldSubmitForApproval: boolean = false) => {
        const courseIdToUse = lockedCourseId || selectedCourse;
        const unitIdToUse = unitId || selectedUnit;
        const lectureIdToUse = lectureId || selectedLecture;

        if (!courseIdToUse || !quizType || !quizName) return;

        setSubmitting(true);
        setError(null);

        try {
            const quizData: CreateQuizData = {
                name: { ar: quizName, en: quizName },
                quiz_type: quizType,
                course_id: courseIdToUse,
                unit_id: unitIdToUse,
                lecture_id: lectureIdToUse,
                duration_minutes: durationMinutes,
                passing_percentage: passingPercentage,
                questions: questions.map(q => ({
                    question_text: { ar: q.question_text_ar, en: q.question_text_en || undefined },
                    question_type: quizType,
                    points: q.points,
                    model_answer: quizType === 'essay' && q.model_answer_ar
                        ? { ar: q.model_answer_ar, en: q.model_answer_en || undefined }
                        : undefined,
                    options: quizType === 'mcq' && q.options
                        ? q.options.map(o => ({
                            option_text: { ar: o.option_text_ar, en: o.option_text_en || undefined },
                            is_correct: o.is_correct
                        }))
                        : undefined
                }))
            };

            let quizId: number;

            if (quiz) {
                await quizService.updateQuiz(quiz.id, quizData);
                quizId = quiz.id;
            } else {
                const response = await quizService.createQuiz(quizData);
                // @ts-ignore
                quizId = response.data?.id || response.id; // Adjust based on API response
            }

            // If user wants to submit for approval immediately
            if (shouldSubmitForApproval && quizId) {
                await quizService.submitForApproval(quizId);
                toast.success('تم إنشاء الاختبار وإرساله للموافقة');
            } else {
                toast.success(quiz ? 'تم تحديث الاختبار بنجاح' : 'تم حفظ الاختبار كمسودة');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to save quiz:', err);
            setError(quiz ? 'فشل في تحديث الاختبار.' : 'فشل في إنشاء الاختبار. يرجى المحاولة مرة أخرى.');
        } finally {
            setSubmitting(false);
        }
    };

    // Close handler
    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const NextIcon = isRTL ? ChevronLeft : ChevronRight;
    const BackIcon = isRTL ? ChevronRight : ChevronLeft;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-[#1F1F1F]">
                            {quiz ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
                        </h2>
                        <p className="text-sm text-[#636E72]">الخطوة {currentStep} من {totalSteps}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-shibl-crimson transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && (
                        <Step1SelectType
                            courses={courses}
                            units={units}
                            loadingUnits={loadingUnits}
                            selectedCourse={selectedCourse}
                            selectedUnit={selectedUnit}
                            selectedLecture={selectedLecture}
                            quizType={quizType}
                            onSelectCourse={setSelectedCourse}
                            onSelectUnit={setSelectedUnit}
                            onSelectLecture={setSelectedLecture}
                            onSelectType={setQuizType}
                            lockedCourseId={lockedCourseId}
                            lockedUnitId={unitId}
                            lockedLectureId={lectureId}
                        />
                    )}
                    {currentStep === 2 && quizType && (
                        <Step2Questions
                            quizType={quizType}
                            questions={questions}
                            onAddQuestion={handleAddQuestion}
                            onUpdateQuestion={handleUpdateQuestion}
                            onDeleteQuestion={handleDeleteQuestion}
                            onAddOption={handleAddOption}
                            onUpdateOption={handleUpdateOption}
                            onDeleteOption={handleDeleteOption}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Settings
                            quizName={quizName}
                            durationMinutes={durationMinutes}
                            passingPercentage={passingPercentage}
                            onUpdateName={setQuizName}
                            onUpdateDuration={setDurationMinutes}
                            onUpdatePassing={setPassingPercentage}
                        />
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={currentStep === 1 ? handleClose : handleBack}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-[#636E72] hover:bg-white transition-colors disabled:opacity-50"
                    >
                        <BackIcon size={18} />
                        {currentStep === 1 ? 'إلغاء' : 'السابق'}
                    </button>

                    {currentStep < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!canGoNext() || submitting}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-shibl-crimson text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            التالي
                            <NextIcon size={18} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Save as Draft Button */}
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={!canGoNext() || submitting}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 size={18} className="animate-spin" /> : <FileEdit size={18} />}
                                {quiz ? 'حفظ التعديلات' : 'حفظ كمسودة'}
                            </button>

                            {/* Submit for Approval Button */}
                            <button
                                onClick={() => handleSubmit(true)}
                                disabled={!canGoNext() || submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-shibl-crimson text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Send size={18} />
                                )}
                                {quiz ? 'تحديث وإرسال للموافقة' : 'إنشاء وإرسال للموافقة'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

export default CreateQuizModal;
