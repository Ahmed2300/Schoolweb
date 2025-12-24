// Application routes
export const ROUTES = {
    // Public routes
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',

    // Course routes
    COURSES: '/courses',
    COURSE_DETAIL: '/courses/:id',
    COURSE_LESSON: '/courses/:courseId/lessons/:lessonId',

    // Student routes
    DASHBOARD: '/dashboard',
    MY_COURSES: '/my-courses',
    SCHEDULE: '/schedule',
    QUIZZES: '/quizzes',
    QUIZ_TAKE: '/quizzes/:id',
    QUIZ_RESULT: '/quizzes/:id/result',
    PROFILE: '/profile',
    SETTINGS: '/settings',

    // Parent routes
    PARENT_DASHBOARD: '/parent',
    PARENT_CHILDREN: '/parent/children',
    PARENT_CHILD_PROGRESS: '/parent/children/:id',

    // Teacher routes
    TEACHER_DASHBOARD: '/teacher',
    TEACHER_COURSES: '/teacher/courses',
    TEACHER_COURSE_EDIT: '/teacher/courses/:id',
    TEACHER_LESSONS: '/teacher/courses/:courseId/lessons',
    TEACHER_QUIZZES: '/teacher/quizzes',
    TEACHER_GRADING: '/teacher/grading',
    TEACHER_ANALYTICS: '/teacher/analytics',

    // Admin routes
    ADMIN_DASHBOARD: '/admin',
    ADMIN_USERS: '/admin/users',
    ADMIN_COURSES: '/admin/courses',
    ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
    ADMIN_SESSIONS: '/admin/sessions',
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_SETTINGS: '/admin/settings',
} as const;

// Helper to generate paths with params
export const generatePath = (route: string, params: Record<string, string>): string => {
    let path = route;
    Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
    });
    return path;
};
