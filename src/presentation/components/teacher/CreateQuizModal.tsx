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
    Send,
    ImageIcon,
    Eye,
    Timer
} from 'lucide-react';
import toast from 'react-hot-toast';

// ==================== TYPES ====================

interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (quiz?: any) => void;
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
    model_answer_image?: File | null;
    model_answer_image_preview?: string | null;
    model_answer_image_url?: string | null;
    question_image?: File | null;
    question_image_preview?: string | null;
    question_image_url?: string | null;
    options?: Array<{
        id: string;
        option_text_ar: string;
        option_text_en: string;
        is_correct: boolean;
        option_image?: File | null;
        option_image_preview?: string | null;
        option_image_url?: string | null;
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
                        <label className="block text-sm font-medium text-[#1F1F1F] dark:text-slate-200 mb-2">
                            الدورة <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedCourse || ''}
                            onChange={(e) => {
                                onSelectCourse(Number(e.target.value));
                                onSelectUnit(null);
                                onSelectLecture(null);
                            }}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] dark:text-white"
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
                        <label className="block text-sm font-medium text-[#1F1F1F] dark:text-slate-200 mb-2">
                            الوحدة <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedUnit || ''}
                            onChange={(e) => {
                                onSelectUnit(Number(e.target.value) || null);
                                onSelectLecture(null);
                            }}
                            disabled={!selectedCourse || loadingUnits}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] dark:text-white disabled:opacity-50"
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
                        <label className="block text-sm font-medium text-[#1F1F1F] dark:text-slate-200 mb-2">
                            المحاضرة <span className="text-xs text-slate-400">(اختياري)</span>
                        </label>
                        <select
                            value={selectedLecture || ''}
                            onChange={(e) => onSelectLecture(Number(e.target.value) || null)}
                            disabled={!selectedUnit}
                            className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] dark:text-white disabled:opacity-50"
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
            <div className="flex flex-wrap gap-2 items-center text-sm text-[#636E72] dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="font-medium text-[#1F1F1F] dark:text-white">المسار المحدد:</span>

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
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-white mb-3">
                    نوع الاختبار <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {/* MCQ Option */}
                    <button
                        onClick={() => onSelectType('mcq')}
                        className={`p-6 rounded-2xl border-2 transition-all text-center ${quizType === 'mcq'
                            ? 'border-shibl-crimson bg-red-50 dark:bg-red-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${quizType === 'mcq' ? 'bg-shibl-crimson text-white' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            }`}>
                            <FileQuestion size={28} />
                        </div>
                        <h3 className="font-semibold text-[#1F1F1F] dark:text-white mb-1">اختيار من متعدد</h3>
                        <p className="text-sm text-[#636E72] dark:text-slate-400">
                            أسئلة مع خيارات متعددة تُصحح تلقائياً
                        </p>
                    </button>

                    {/* Essay Option */}
                    <button
                        onClick={() => onSelectType('essay')}
                        className={`p-6 rounded-2xl border-2 transition-all text-center ${quizType === 'essay'
                            ? 'border-shibl-crimson bg-red-50 dark:bg-red-900/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${quizType === 'essay' ? 'bg-shibl-crimson text-white' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            }`}>
                            <FileEdit size={28} />
                        </div>
                        <h3 className="font-semibold text-[#1F1F1F] dark:text-white mb-1">أسئلة مكتوبة</h3>
                        <p className="text-sm text-[#636E72] dark:text-slate-400">
                            أسئلة مقالية مع إجابة نموذجية للطالب
                        </p>
                    </button>
                </div>
                <p className="text-xs text-[#636E72] dark:text-slate-400 mt-3 flex items-center gap-1">
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
    onQuestionImage: (questionId: string, file: File | null) => void;
    onModelAnswerImage: (questionId: string, file: File | null) => void;
    onOptionImage: (questionId: string, optionId: string, file: File | null) => void;
}

function Step2Questions({ quizType, questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion, onAddOption, onUpdateOption, onDeleteOption, onQuestionImage, onModelAnswerImage, onOptionImage }: Step2Props) {
    // Compute validation errors for helpful messages
    const validationErrors: string[] = [];

    if (questions.length === 0) {
        validationErrors.push('يجب إضافة سؤال واحد على الأقل');
    } else {
        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            if (!q.question_text_ar.trim()) {
                validationErrors.push(`السؤال ${qNum}: يجب كتابة نص السؤال`);
            }
            if (quizType === 'mcq' && q.options) {
                const emptyOptions = q.options.filter(o => !o.option_text_ar.trim());
                if (emptyOptions.length > 0) {
                    validationErrors.push(`السؤال ${qNum}: يجب ملء نص جميع الخيارات (${emptyOptions.length} خيار فارغ)`);
                }
                const correctCount = q.options.filter(o => o.is_correct).length;
                if (correctCount === 0) {
                    validationErrors.push(`السؤال ${qNum}: يجب تحديد الإجابة الصحيحة`);
                }
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1F1F1F] dark:text-white">
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
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <FileQuestion size={40} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                    <p className="text-[#636E72] dark:text-slate-400">لا توجد أسئلة بعد</p>
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
                        <div key={question.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-shibl-crimson">
                                    السؤال {index + 1}
                                </span>
                                <button
                                    onClick={() => onDeleteQuestion(question.id)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                                    className="w-full h-10 px-3 rounded-lg bg-[#F8F9FA] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-sm dark:text-white"
                                />
                            </div>

                            {/* Question Text (English) */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Question text in English (optional)"
                                    value={question.question_text_en}
                                    onChange={(e) => onUpdateQuestion(question.id, { question_text_en: e.target.value })}
                                    className="w-full h-10 px-3 rounded-lg bg-[#F8F9FA] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-sm dark:text-white"
                                    dir="ltr"
                                />
                            </div>

                            {/* Question Image Upload */}
                            <div className="mb-3">
                                <label className="text-xs text-[#636E72] dark:text-slate-400 mb-2 block">صورة السؤال (اختياري)</label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors text-sm text-slate-600 dark:text-slate-300">
                                        <ImageIcon size={16} />
                                        <span>{question.question_image || question.question_image_url ? 'تغيير الصورة' : 'رفع صورة'}</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) onQuestionImage(question.id, file);
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                    {(question.question_image_preview || question.question_image_url) && (
                                        <div className="relative">
                                            <img
                                                src={question.question_image_preview || question.question_image_url || ''}
                                                alt="معاينة صورة السؤال"
                                                className="h-12 w-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                            />
                                            <button
                                                onClick={() => onQuestionImage(question.id, null)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Points */}
                            <div className="mb-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-[#636E72] dark:text-slate-400">الدرجة:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={question.points}
                                        onChange={(e) => onUpdateQuestion(question.id, { points: Number(e.target.value) })}
                                        className="w-16 h-8 px-2 rounded-lg bg-[#F8F9FA] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-sm text-center dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* MCQ Options */}
                            {quizType === 'mcq' && question.options && (
                                <div className="mt-4 space-y-3">
                                    <label className="text-xs text-[#636E72] dark:text-slate-400 mb-2 block">الخيارات:</label>
                                    {question.options.map((option, optIndex) => (
                                        <div key={option.id} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateOption(question.id, option.id, { is_correct: !option.is_correct })}
                                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${option.is_correct
                                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                                                        }`}
                                                >
                                                    {option.is_correct && <CheckCircle size={14} />}
                                                </button>
                                                <input
                                                    type="text"
                                                    placeholder={`الخيار ${optIndex + 1} بالعربية`}
                                                    value={option.option_text_ar}
                                                    onChange={(e) => onUpdateOption(question.id, option.id, { option_text_ar: e.target.value })}
                                                    className="flex-1 h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-sm dark:text-white"
                                                />
                                                {/* Option Image Upload */}
                                                <label className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors flex-shrink-0" title="إضافة صورة للخيار">
                                                    <ImageIcon size={14} className="text-slate-500" />
                                                    <input
                                                        type="file"
                                                        accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) onOptionImage(question.id, option.id, file);
                                                        }}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    onClick={() => onDeleteOption(question.id, option.id)}
                                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {/* Option Image Preview */}
                                            {(option.option_image_preview || option.option_image_url) && (
                                                <div className="flex items-center gap-2 mr-8">
                                                    <div className="relative">
                                                        <img
                                                            src={option.option_image_preview || option.option_image_url || ''}
                                                            alt={`صورة الخيار ${optIndex + 1}`}
                                                            className="h-10 w-10 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                                                        />
                                                        <button
                                                            onClick={() => onOptionImage(question.id, option.id, null)}
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <span className="text-xs text-slate-400">صورة الخيار</span>
                                                </div>
                                            )}
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
                                <div className="mt-4 space-y-3">
                                    <label className="text-xs text-[#636E72] dark:text-slate-400 mb-2 block">الإجابة النموذجية:</label>
                                    <textarea
                                        placeholder="الإجابة النموذجية بالعربية (تظهر للطالب بعد التسليم)"
                                        value={question.model_answer_ar || ''}
                                        onChange={(e) => onUpdateQuestion(question.id, { model_answer_ar: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-lg bg-[#F8F9FA] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-sm resize-none dark:text-white"
                                    />

                                    {/* Model Answer Image Upload */}
                                    <div>
                                        <label className="text-xs text-[#636E72] dark:text-slate-400 mb-2 block">صورة الإجابة النموذجية (اختياري)</label>
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors text-sm text-slate-600 dark:text-slate-300">
                                                <ImageIcon size={16} />
                                                <span>{question.model_answer_image || question.model_answer_image_url ? 'تغيير الصورة' : 'رفع صورة'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) onModelAnswerImage(question.id, file);
                                                    }}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(question.model_answer_image_preview || question.model_answer_image_url) && (
                                                <div className="relative">
                                                    <img
                                                        src={question.model_answer_image_preview || question.model_answer_image_url || ''}
                                                        alt="معاينة صورة الإجابة النموذجية"
                                                        className="h-12 w-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                                                    />
                                                    <button
                                                        onClick={() => onModelAnswerImage(question.id, null)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Validation Errors Display */}
            {validationErrors.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={18} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">يجب إكمال التالي للمتابعة:</p>
                            <ul className="space-y-1">
                                {validationErrors.map((error, idx) => (
                                    <li key={idx} className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
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
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-white mb-2">
                    اسم الاختبار <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    placeholder="مثال: اختبار الفصل الأول"
                    value={quizName}
                    onChange={(e) => onUpdateName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson focus:ring-4 focus:ring-shibl-crimson/10 outline-none transition-all text-[#1F1F1F] dark:text-white"
                />
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-white mb-2">
                    مدة الاختبار (بالدقائق)
                </label>
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[#636E72] dark:text-slate-400" />
                    <input
                        type="number"
                        min="0"
                        max="180"
                        value={durationMinutes}
                        onChange={(e) => onUpdateDuration(Number(e.target.value))}
                        className="w-24 h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-[#1F1F1F] dark:text-white text-center"
                    />
                    <span className="text-sm text-[#636E72] dark:text-slate-400">دقيقة</span>
                </div>
                <p className="text-xs text-[#636E72] mt-1">اتركه 0 للسماح بوقت غير محدود</p>
            </div>

            {/* Passing Percentage */}
            <div>
                <label className="block text-sm font-medium text-[#1F1F1F] dark:text-white mb-2">
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
                        className="w-24 h-12 px-4 rounded-xl bg-[#F8F9FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-shibl-crimson outline-none transition-all text-[#1F1F1F] dark:text-white text-center"
                    />
                    <span className="text-sm text-[#636E72]">%</span>
                </div>
            </div>
        </div>
    );
}

// ==================== LIVE PREVIEW COMPONENT ====================

interface LivePreviewProps {
    quizName: string;
    quizType: QuizType | null;
    questions: QuestionData[];
    durationMinutes: number;
    passingPercentage: number;
    currentStep: number;
}

function LivePreview({ quizName, quizType, questions, durationMinutes, passingPercentage, currentStep }: LivePreviewProps) {
    const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

    // Reset preview index when questions change
    useEffect(() => {
        if (previewQuestionIndex >= questions.length) {
            setPreviewQuestionIndex(Math.max(0, questions.length - 1));
        }
    }, [questions.length, previewQuestionIndex]);

    const currentQuestion = questions[previewQuestionIndex];
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <Eye size={18} className="text-shibl-crimson" />
                    <span className="font-bold text-slate-700 dark:text-white">معاينة الاختبار</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">كما يراه الطالب</span>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto p-5">
                {/* Quiz Info Card */}
                {currentStep >= 3 && quizName ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">{quizName || 'اسم الاختبار'}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                            {durationMinutes > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Timer size={14} />
                                    <span>{durationMinutes} دقيقة</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <FileQuestion size={14} />
                                <span>{questions.length} سؤال</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle size={14} className="text-emerald-500" />
                                <span>النجاح: {passingPercentage}%</span>
                            </div>
                        </div>
                    </div>
                ) : currentStep === 1 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                            <FileQuestion size={32} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">اختر نوع الاختبار للبدء</p>
                    </div>
                ) : null}

                {/* Question Preview */}
                {currentStep >= 2 && questions.length > 0 && currentQuestion ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                        {/* Question Navigation */}
                        {questions.length > 1 && (
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                    السؤال {previewQuestionIndex + 1} من {questions.length}
                                </span>
                                <div className="flex gap-1">
                                    {questions.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPreviewQuestionIndex(idx)}
                                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${idx === previewQuestionIndex
                                                ? 'bg-shibl-crimson text-white'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Question Content */}
                        <div className="mb-4">
                            <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold mb-3">
                                {currentQuestion.points} درجة
                            </span>
                            <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                                {currentQuestion.question_text_ar || 'نص السؤال...'}
                            </h4>
                            {/* Question Image Preview */}
                            {(currentQuestion.question_image_preview || currentQuestion.question_image_url) && (
                                <img
                                    src={currentQuestion.question_image_preview || currentQuestion.question_image_url || ''}
                                    alt="صورة السؤال"
                                    className="mt-3 max-w-full max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                                />
                            )}
                        </div>

                        {/* MCQ Options Preview */}
                        {quizType === 'mcq' && currentQuestion.options && (
                            <div className="space-y-2">
                                {currentQuestion.options.map((option, optIdx) => (
                                    <div
                                        key={option.id}
                                        className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all ${option.is_correct
                                            ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20'
                                            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${option.is_correct ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {option.is_correct && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-sm ${option.is_correct ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {option.option_text_ar || `الخيار ${optIdx + 1}`}
                                            </span>
                                            {option.is_correct && (
                                                <span className="mr-2 text-xs text-emerald-500">✓ صحيح</span>
                                            )}
                                            {/* Option Image Preview */}
                                            {(option.option_image_preview || option.option_image_url) && (
                                                <img
                                                    src={option.option_image_preview || option.option_image_url || ''}
                                                    alt={`صورة الخيار ${optIdx + 1}`}
                                                    className="mt-2 max-w-[150px] max-h-24 rounded-md border border-slate-200 object-contain"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Essay Answer Area Preview */}
                        {quizType === 'essay' && (
                            <div className="mt-4">
                                <div className="h-32 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    <span className="text-slate-400 dark:text-slate-500 text-sm">منطقة إجابة الطالب</span>
                                </div>
                                {(currentQuestion.model_answer_ar || currentQuestion.model_answer_image_preview || currentQuestion.model_answer_image_url) && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-900/50">
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 block">الإجابة النموذجية:</span>
                                        {currentQuestion.model_answer_ar && (
                                            <p className="text-sm text-amber-700 dark:text-amber-300">{currentQuestion.model_answer_ar}</p>
                                        )}
                                        {(currentQuestion.model_answer_image_preview || currentQuestion.model_answer_image_url) && (
                                            <img
                                                src={currentQuestion.model_answer_image_preview || currentQuestion.model_answer_image_url || ''}
                                                alt="صورة الإجابة النموذجية"
                                                className="mt-2 max-w-full max-h-32 rounded-lg border border-amber-200 dark:border-amber-900/50 object-contain"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : currentStep >= 2 && questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <FileQuestion size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-400 dark:text-slate-500 text-sm">أضف أسئلة لعرضها هنا</p>
                    </div>
                ) : null}

                {/* Summary Stats */}
                {currentStep >= 2 && questions.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <p className="text-2xl font-black text-shibl-crimson">{questions.length}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">سؤال</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700">
                            <p className="text-2xl font-black text-slate-700 dark:text-white">{totalPoints}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">درجة كاملة</p>
                        </div>
                    </div>
                )}
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

                // Map questions - preserve image URLs
                if (quiz.questions) {
                    setQuestions(quiz.questions.map(q => ({
                        id: q.id?.toString() || generateId(),
                        question_text_ar: typeof q.question_text === 'string' ? JSON.parse(q.question_text).ar : (q.question_text as any)?.ar || '',
                        question_text_en: typeof q.question_text === 'string' ? JSON.parse(q.question_text).en : (q.question_text as any)?.en || '',
                        points: q.points,
                        model_answer_ar: q.model_answer ? (typeof q.model_answer === 'string' ? JSON.parse(q.model_answer).ar : (q.model_answer as any)?.ar) : '',
                        model_answer_en: q.model_answer ? (typeof q.model_answer === 'string' ? JSON.parse(q.model_answer).en : (q.model_answer as any)?.en) : '',
                        // Preserve existing image URLs
                        model_answer_image_url: (q as any).model_answer_image_url || null,
                        question_image_url: (q as any).question_image_url || null,
                        options: q.options?.map(o => ({
                            id: o.id?.toString() || generateId(),
                            option_text_ar: typeof o.option_text === 'string' ? JSON.parse(o.option_text).ar : (o.option_text as any)?.ar || '',
                            option_text_en: typeof o.option_text === 'string' ? JSON.parse(o.option_text).en : (o.option_text as any)?.en || '',
                            is_correct: !!o.is_correct,
                            // Preserve existing option image URL
                            option_image_url: (o as any).option_image_url || null,
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

    // Image upload handlers
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];

    const handleQuestionImage = useCallback((questionId: string, file: File | null) => {
        if (file) {
            // Validate file size
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
                return;
            }
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error('يجب أن تكون الصورة بصيغة JPEG, PNG, GIF, أو SVG');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestions(prev => prev.map(q =>
                    q.id === questionId
                        ? { ...q, question_image: file, question_image_preview: reader.result as string }
                        : q
                ));
            };
            reader.readAsDataURL(file);
        } else {
            // Remove image
            setQuestions(prev => prev.map(q =>
                q.id === questionId
                    ? { ...q, question_image: null, question_image_preview: null }
                    : q
            ));
        }
    }, []);

    const handleModelAnswerImage = useCallback((questionId: string, file: File | null) => {
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
                return;
            }
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error('يجب أن تكون الصورة بصيغة JPEG, PNG, GIF, أو SVG');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestions(prev => prev.map(q =>
                    q.id === questionId
                        ? { ...q, model_answer_image: file, model_answer_image_preview: reader.result as string }
                        : q
                ));
            };
            reader.readAsDataURL(file);
        } else {
            setQuestions(prev => prev.map(q =>
                q.id === questionId
                    ? { ...q, model_answer_image: null, model_answer_image_preview: null, model_answer_image_url: null }
                    : q
            ));
        }
    }, []);

    const handleOptionImage = useCallback((questionId: string, optionId: string, file: File | null) => {
        if (file) {
            // Validate file size
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت');
                return;
            }
            // Validate file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error('يجب أن تكون الصورة بصيغة JPEG, PNG, GIF, أو SVG');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setQuestions(prev => prev.map(q => {
                    if (q.id === questionId && q.options) {
                        return {
                            ...q,
                            options: q.options.map(o =>
                                o.id === optionId
                                    ? { ...o, option_image: file, option_image_preview: reader.result as string }
                                    : o
                            )
                        };
                    }
                    return q;
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // Remove image
            setQuestions(prev => prev.map(q => {
                if (q.id === questionId && q.options) {
                    return {
                        ...q,
                        options: q.options.map(o =>
                            o.id === optionId
                                ? { ...o, option_image: null, option_image_preview: null }
                                : o
                        )
                    };
                }
                return q;
            }));
        }
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

                // For MCQ: Each question must have exactly one correct answer AND all options must have text
                if (quizType === 'mcq') {
                    const allQuestionsValid = questions.every(q => {
                        if (!q.options || q.options.length === 0) return false;

                        // Check each option has text (Arabic is required)
                        const allOptionsHaveText = q.options.every(o => o.option_text_ar.trim() !== '');
                        if (!allOptionsHaveText) return false;

                        // Check exactly one correct answer
                        const correctCount = q.options.filter(o => o.is_correct).length;
                        return correctCount === 1;
                    });
                    if (!allQuestionsValid) return false;
                }

                return true;

            case 3: return quizName.trim() !== '';
            default: return false;
        }
    };

    // Relaxed validation for saving as draft - only basic info required
    const canSaveDraft = () => {
        const courseSelected = lockedCourseId || selectedCourse !== null;
        const hasQuizType = quizType !== null;
        const hasName = quizName.trim() !== '';

        // Draft only requires: Course, Quiz Type, and Name
        return courseSelected && hasQuizType && hasName;
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
                submit_for_approval: shouldSubmitForApproval, // Include flag here
                questions: questions.map(q => ({
                    question_text: { ar: q.question_text_ar, en: q.question_text_en || undefined },
                    question_type: quizType,
                    points: q.points,
                    question_image: q.question_image || undefined,
                    model_answer_image: quizType === 'essay' && q.model_answer_image ? q.model_answer_image : undefined,
                    model_answer: quizType === 'essay' && q.model_answer_ar
                        ? { ar: q.model_answer_ar, en: q.model_answer_en || undefined }
                        : undefined,
                    options: quizType === 'mcq' && q.options
                        ? q.options.map(o => ({
                            option_text: { ar: o.option_text_ar, en: o.option_text_en || undefined },
                            is_correct: o.is_correct,
                            option_image: o.option_image || undefined
                        }))
                        : undefined
                }))
            };

            let quizId: number;

            if (quiz) {
                // Determine if we're submitting explicitly
                const updateData = {
                    ...quizData,
                    submit_for_approval: shouldSubmitForApproval
                };

                await quizService.updateQuiz(quiz.id, updateData);
                quizId = quiz.id;
            } else {
                const response = await quizService.createQuiz(quizData);
                // @ts-ignore
                quizId = response.data?.id || response.id; // Adjust based on API response
            }

            if (shouldSubmitForApproval) {
                toast.success('تم إنشاء الاختبار وإرساله للموافقة');
            } else {
                toast.success(quiz ? 'تم تحديث الاختبار بنجاح' : 'تم حفظ الاختبار كمسودة');
            }

            // Optimistic update object
            const optimisticQuiz = {
                id: quizId,
                ...quizData,
                // Ensure name is in correct format for the list
                name: typeof quizData.name === 'string' ? quizData.name : quizData.name.ar || quizData.name.en,
                questions_count: questions.length,
                is_active: quiz ? quiz.is_active : true, // Default to true if new?
                // Set status correctly for immediate UI update
                status: shouldSubmitForApproval ? 'pending' : 'draft',
            };
            onSuccess(optimisticQuiz);
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
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-[95vw] xl:max-w-[1400px] h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-shibl-crimson/10 rounded-xl flex items-center justify-center">
                            <FileQuestion size={20} className="text-shibl-crimson" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#1F1F1F] dark:text-white">
                                {quiz ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
                            </h2>
                            <p className="text-sm text-[#636E72] dark:text-slate-400">الخطوة {currentStep} من {totalSteps}</p>
                        </div>
                    </div>
                    {/* Progress Indicator */}
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step < currentStep
                                        ? 'bg-emerald-500 text-white'
                                        : step === currentStep
                                            ? 'bg-shibl-crimson text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                                        }`}>
                                        {step < currentStep ? <CheckCircle size={16} /> : step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar (mobile) */}
                <div className="h-1 bg-slate-100 dark:bg-slate-800 sm:hidden">
                    <div
                        className="h-full bg-shibl-crimson transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Split View Container */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
                    {/* Edit Panel (Right in RTL) */}
                    <div className="flex flex-col overflow-hidden border-l border-slate-100 dark:border-slate-800">
                        {/* Edit Header */}
                        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {currentStep === 1 && 'اختيار نوع الاختبار'}
                                {currentStep === 2 && 'إضافة الأسئلة'}
                                {currentStep === 3 && 'إعدادات الاختبار'}
                            </span>
                        </div>

                        {/* Edit Content */}
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
                                    onQuestionImage={handleQuestionImage}
                                    onModelAnswerImage={handleModelAnswerImage}
                                    onOptionImage={handleOptionImage}
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
                                <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel (Left in RTL) */}
                    <div className="hidden lg:flex flex-col h-full p-6 bg-slate-50 dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800">
                        <LivePreview
                            quizName={quizName}
                            quizType={quizType}
                            questions={questions}
                            durationMinutes={durationMinutes}
                            passingPercentage={passingPercentage}
                            currentStep={currentStep}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    {/* Left: Back/Cancel */}
                    <button
                        onClick={currentStep === 1 ? handleClose : handleBack}
                        disabled={submitting}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[#636E72] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <BackIcon size={18} />
                        {currentStep === 1 ? 'إلغاء' : 'السابق'}
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Center/Right: Save Draft (Always visible) */}
                        <button
                            onClick={() => handleSubmit(false)}
                            disabled={!canSaveDraft() || submitting}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={18} className="animate-spin" /> : <FileEdit size={18} />}
                            {quiz ? 'حفظ التعديلات' : 'حفظ كمسودة'}
                        </button>

                        {/* Right: Next or Submit */}
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
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default CreateQuizModal;
