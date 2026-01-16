// src/presentation/pages/dashboard/StudentCourseDetailPage.tsx
// Wrapper component that routes to the working StudentCourseDetailsPage
import { useParams, useNavigate } from 'react-router-dom';
import StudentCourseDetailsPage from './StudentCourseDetailsPage';

export function StudentCourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const courseId = parseInt(id || '0', 10);

    if (!courseId || isNaN(courseId)) {
        return (
            <div className="p-10 text-center">
                <p className="text-xl font-bold text-slate-800 mb-6">Course not found</p>
                <button
                    onClick={() => navigate('/dashboard/courses')}
                    className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                >
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <StudentCourseDetailsPage
            courseId={courseId}
            onBack={() => navigate('/dashboard/courses')}
        />
    );
}
