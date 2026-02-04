import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    X,
    Calendar,
    ChevronLeft,
    CheckCircle2,
    UserCircle,
    BookOpen,
    Clock,
    LayoutGrid,
    ArrowRight,
    Lock,
    AlertCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTeacherCourses, useMyRequests, useRequestSlot } from '../../hooks';
import { teacherService } from '../../../data/api/teacherService';
import { TimeSlotPicker } from './timeslots/TimeSlotPicker';

export function TeacherFirstLoginPopup() {
    const navigate = useNavigate();

    // Data Fetching
    const { data: courses = [], isLoading: loadingCourses } = useTeacherCourses();
    const { data: requests = [], isLoading: loadingRequests } = useMyRequests();
    const requestMutation = useRequestSlot();

    // Derive Unique Grades from Courses
    const uniqueGrades = useMemo(() => {
        const gradesMap = new Map();
        courses.forEach(course => {
            if (course.grade && !gradesMap.has(course.grade.id)) {
                gradesMap.set(course.grade.id, course.grade);
            }
        });
        return Array.from(gradesMap.values());
    }, [courses]);

    // Check completion status per grade
    const gradeCompletionStatus = useMemo(() => {
        const status: Record<number, boolean> = {};
        uniqueGrades.forEach(grade => {
            // Simplified check: Does the teacher have ANY bookings matching this grade?
            // You'd ideally check against `requests` here.
            status[grade.id] = false;
        });
        return status;
    }, [uniqueGrades, requests]);

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [hasSlots, setHasSlots] = useState(false); // New state to track if schedule is published

    // Combined Loading
    const isLoading = loadingCourses || loadingRequests;

    // Steps Generation
    const steps = useMemo(() => {
        const baseSteps = [
            {
                id: 'welcome',
                title: "مرحباً بك في منصة المعلمين",
                description: "لضمان تجربة سلسة، يلزم إعداد جدولك الدراسي لكل صف تقوم بتدريسه.",
                icon: UserCircle,
                type: 'intro'
            }
        ];

        const gradeSteps = uniqueGrades.map(grade => ({
            id: `grade-${grade.id}`,
            title: `جدول ${grade.name}`,
            description: "يرجى حجز الفترات الزمنية المتاحة لهذا الصف وتحديد المواعيد المناسبة.",
            icon: Calendar,
            type: 'grade',
            grade: grade
        }));

        const finalStep = {
            id: 'complete',
            title: "تم الإعداد بنجاح!",
            description: "يمكنك الآن البدء في إدارة حصصك وطلابك.",
            icon: CheckCircle2,
            type: 'finish'
        };

        return [...baseSteps, ...gradeSteps, finalStep];
    }, [uniqueGrades]);

    // Visibility Logic
    useEffect(() => {
        const checkAvailabilityAndShow = async () => {
            if (isLoading || uniqueGrades.length === 0) return;

            try {
                // Check if ANY slots are available (Schedule Published?)
                // API call without date should return future slots or paginated list
                const slots = await teacherService.getAvailableSlots();
                if (slots && slots.length > 0) {
                    setHasSlots(true);

                    // Check Completion: Does every grade have at least one booking?
                    // "requests" contains all my bookings.
                    const allGradesBooked = uniqueGrades.every(grade =>
                        requests.some(req => (req as any).lecture?.course?.grade_id === grade.id || (req as any).lecture?.course?.grade?.id === grade.id)
                    );

                    // If NOT all booked, SHOW wizard
                    // Also check if they explicitly finished before?
                    // User said: "everytime he logs in whithout choosing his schedual" -> Implies strictly checks bookings.
                    // So we ignore 'teacher_schedule_setup_complete' localStorage if actual bookings are missing?
                    // Let's safe-guard: If missing bookings, SHOW.

                    if (!allGradesBooked) {
                        setIsOpen(true);
                    }
                }
            } catch (err) {
                console.error("Failed to check slots", err);
            }
        };

        checkAvailabilityAndShow();
    }, [isLoading, uniqueGrades, requests]);

    const handleNext = () => {
        const currentStepData = steps[currentStep] as any;

        // Validation: If it's a grade step, ensure at least one slot is booked for this grade
        if (currentStepData.type === 'grade' && currentStepData.grade) {
            // Check requests for ANY slot with this grade
            // Since we don't have deeply nested request data easily available (requests is flat TimeSlot[]),
            // and we rely on TimeSlotPicker logic...
            // We can check if `requests` contains any slot that matches the known booked slots for this grade?
            // Actually, we can just check if `requests` length increased?
            // Or better: Filter `requests` by `lecture.course.grade_id`.

            // Assuming `requests` contains fully hydrated lecture->course->grade objects:
            const gradeId = currentStepData.grade.id;
            const hasBooking = requests.some(req => (req as any).lecture?.course?.grade_id === gradeId || (req as any).lecture?.course?.grade?.id === gradeId);

            if (!hasBooking) {
                toast.error("يرجى تحديد موعد واحد على الأقل قبل المتابعة");
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setCompletedSteps(prev => [...prev, currentStep]);
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('teacher_schedule_setup_complete', 'true');
        setIsOpen(false);
        navigate('/teacher/timeslots');
    };

    // Placeholder for slot selection logging
    const queryClient = useQueryClient();
    const [bookingLoading, setBookingLoading] = useState(false);

    const handleSlotSelect = async (slot: any) => {
        const currentStepData = steps[currentStep] as any;
        if (!currentStepData.grade) return;

        const course = courses.find(c => c.grade?.id === currentStepData.grade.id);
        if (!course) {
            toast.error("لا يوجد كورس مرتبط لهذا الصف");
            return;
        }

        setBookingLoading(true);
        try {
            // 1. Get lectures for this course to find a valid lecture_id
            // We need to fetch this dynamically
            const lectures = await teacherService.getCourseLectures(course.id);
            if (!lectures || lectures.length === 0) {
                toast.error("لا توجد محاضرات في هذا الكورس. يرجى إضافة محاضرات أولاً.");
                return;
            }

            // 2. Pick the first lecture (or a specific "Schedule Placeholder" if exists)
            const targetLecture = lectures[0];

            // 3. Request the slot
            await requestMutation.mutateAsync({
                id: slot.id, // TimeSlot ID
                lectureId: targetLecture.id,
                notes: 'تم وتحديد الجدول من معالج البدء'
            });

            toast.success("تم حجز الموعد بنجاح");
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });

            // Optional: Auto-advance if we want user to just pick ONE, 
            // but usually schedule is multiple slots. 
            // So we stay on step.

        } catch (err) {
            console.error(err);
            toast.error("فشل حجز الموعد");
        } finally {
            setBookingLoading(false);
        }
    };

    if (!isOpen || isLoading) return null;

    const currentStepData = steps[currentStep];
    const isGradeStep = currentStepData.type === 'grade';
    const progress = ((currentStep) / (steps.length - 1)) * 100;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop - No click to close */}
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
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header Progress */}
                        <div className="h-2 bg-slate-100 w-full">
                            <motion.div
                                className="h-full bg-indigo-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Content Container */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                        <currentStepData.icon size={32} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentStepData.title}</h2>
                                    <p className="text-slate-500 max-w-lg mx-auto">{currentStepData.description}</p>
                                </div>

                                {/* Grade Scheduler Content */}
                                {isGradeStep && (currentStepData as any).grade && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[400px]">
                                        <TimeSlotPicker
                                            onSelect={handleSlotSelect}
                                            currentData={{ course: { grade: (currentStepData as any).grade } }}
                                            bookedSlots={requests}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-white z-10 flex justify-between items-center">
                            <div className="flex gap-2">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 rounded-full transition-all ${idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {currentStep > 0 && currentStepData.type !== 'finish' && (
                                    <button
                                        onClick={() => setCurrentStep(prev => prev - 1)}
                                        className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-colors"
                                    >
                                        السابق
                                    </button>
                                )}
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-600/20 flex items-center gap-2"
                                >
                                    {currentStep === steps.length - 1 ? 'إنهاء وكتابة الجدول' : 'متابعة'}
                                    {currentStep !== steps.length - 1 && <ChevronLeft size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
