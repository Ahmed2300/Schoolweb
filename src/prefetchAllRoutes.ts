/**
 * prefetchAllRoutes — Background module preloader
 *
 * Fires all route-level dynamic imports in the background immediately
 * after the app paints. Every `import()` call returns the same module
 * promise once resolved, so when React.lazy later requests the same
 * chunk, it resolves instantly from the browser's module cache.
 *
 * Strategy:
 *  1. `requestIdleCallback` (or 2-second fallback) to avoid blocking
 *     first paint and main-thread interactivity.
 *  2. Small staggered batches to avoid saturating the network with
 *     60+ parallel requests — the browser's HTTP/2 limit is ~6-8
 *     concurrent streams per origin.
 *  3. Each import is individually caught so one failure never blocks
 *     the rest.
 */

// ── All route imports (mirrors App.tsx exactly) ──────────────────

const routeImports: Array<() => Promise<unknown>> = [
    // Public / Landing
    () => import('./presentation/pages/landing/LandingPage'),
    () => import('./presentation/pages/landing/FeaturesPage'),
    () => import('./presentation/pages/landing/PrivacyPolicyPage'),
    () => import('./presentation/pages/landing/TermsAndConditionsPage'),
    () => import('./presentation/pages/landing/TechSupportPage'),
    () => import('./presentation/pages/ContactPage'),
    () => import('./presentation/pages/NotFoundPage'),

    // Auth
    () => import('./presentation/pages/auth/SignInPage'),
    () => import('./presentation/pages/auth/SignupPage'),
    () => import('./presentation/pages/auth/VerifyEmailPage'),
    () => import('./presentation/pages/auth/ForgotPasswordPage'),
    () => import('./presentation/pages/auth/ResetPasswordPage'),
    () => import('./presentation/pages/auth/AdminLoginPage'),
    () => import('./presentation/pages/auth/TeacherVerifyEmailPage'),

    // Layouts
    () => import('./presentation/components/admin'),
    () => import('./presentation/components/teacher'),
    () => import('./presentation/pages/dashboard/StudentLayout'),
    () => import('./presentation/pages/dashboard/ParentLayout'),

    // Student Dashboard
    () => import('./presentation/pages/dashboard/StudentHomePage'),
    () => import('./presentation/pages/dashboard/StudentCoursesPage'),
    () => import('./presentation/pages/dashboard/StudentCourseDetailPage'),
    () => import('./presentation/pages/dashboard/StudentSchedulePage'),
    () => import('./presentation/pages/dashboard/StudentQuizzesPage'),
    () => import('./presentation/pages/dashboard/StudentLivePage'),
    () => import('./presentation/pages/dashboard/StudentProfilePage'),
    () => import('./presentation/pages/dashboard/StudentPackagesPage'),
    () => import('./presentation/pages/dashboard/StudentParentRequestsPage'),
    () => import('./presentation/pages/student/LecturePlayerPage'),

    // Parent Dashboard
    () => import('./presentation/pages/dashboard/ParentHomePage'),
    () => import('./presentation/pages/dashboard/ParentChildrenPage'),
    () => import('./presentation/pages/dashboard/ParentStorePage'),
    () => import('./presentation/pages/dashboard/ParentSettingsPage'),
    () => import('./presentation/pages/dashboard/ParentCourseProgressPage'),

    // Teacher Dashboard
    () => import('./presentation/pages/teacher/TeacherDashboardPage'),
    () => import('./presentation/pages/teacher/TeacherCoursesPage'),
    () => import('./presentation/pages/teacher/TeacherCourseDetailsPage'),
    () => import('./presentation/pages/teacher/TeacherQuizzesPage'),
    () => import('./presentation/pages/teacher/TeacherSettingsPage'),
    () => import('./presentation/pages/teacher/AnalyticsPage'),
    () => import('./presentation/pages/teacher/TeacherSlotRequestsPage'),
    () => import('./presentation/pages/teacher/TeacherWeeklySchedulePage'),

    // Admin Dashboard
    () => import('./presentation/pages/admin/AdminDashboard'),
    () => import('./presentation/pages/admin/AdminAdminsPage'),
    () => import('./presentation/pages/admin/AdminUsersPage'),
    () => import('./presentation/pages/admin/AdminGradesPage'),
    () => import('./presentation/pages/admin/AdminCoursesPage'),
    () => import('./presentation/pages/admin/AdminCourseUnitsPage'),
    () => import('./presentation/pages/admin/AdminTeachersPage'),
    () => import('./presentation/pages/admin/AdminSubscriptionsPage'),
    () => import('./presentation/pages/admin/AdminReportsPage'),
    () => import('./presentation/pages/admin/AdminSettingsPage'),
    () => import('./presentation/pages/admin/AdminPaymentsPage'),
    () => import('./presentation/pages/admin/AdminSemestersPage'),
    () => import('./presentation/pages/admin/AdminSubjectsPage'),
    () => import('./presentation/pages/admin/AdminLecturesPage'),
    () => import('./presentation/pages/admin/packages/AdminPackagesPage'),
    () => import('./presentation/pages/admin/AdminPackageSubscriptionsPage'),
    () => import('./presentation/pages/admin/AdminAcademicGraphPage'),
    () => import('./presentation/pages/admin/AdminClientReportsPage'),
    () => import('./presentation/pages/admin/approvals/AdminContentApprovalsPage'),
    () => import('./presentation/pages/admin/quizzes/AdminQuizzesPage'),
    () => import('./presentation/pages/admin/AdminScheduleConfigPage'),
    () => import('./presentation/pages/admin/AdminSlotRequestsPage'),
    () => import('./presentation/pages/admin/AdminClassSchedulesPage'),
    () => import('./presentation/pages/admin/AdminStudentDetailsPage'),
    () => import('./presentation/pages/admin/AdminParentDetailsPage'),

    // Classroom
    () => import('./presentation/pages/classroom/LiveClassroomPage'),
];

// ── Batch executor ───────────────────────────────────────────────

const BATCH_SIZE = 6;
const BATCH_DELAY_MS = 100; // small gap between batches

async function executeBatch(batch: Array<() => Promise<unknown>>): Promise<void> {
    await Promise.allSettled(batch.map((fn) => fn()));
}

async function prefetchSequentially(): Promise<void> {
    for (let i = 0; i < routeImports.length; i += BATCH_SIZE) {
        const batch = routeImports.slice(i, i + BATCH_SIZE);
        await executeBatch(batch);
        // Small yield to keep main thread responsive
        if (i + BATCH_SIZE < routeImports.length) {
            await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
    }
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Call once after the app has rendered its first paint.
 * Uses `requestIdleCallback` where available, otherwise
 * falls back to a 2-second `setTimeout`.
 */
export function prefetchAllRoutes(): void {
    const start = () => {
        prefetchSequentially().catch(() => {
            // Silently swallow — individual import errors are already
            // handled by `allSettled`; this catch is a safety net.
        });
    };

    // Delay prefetching to avoid competing with initial page load and LCP
    const delayedStart = () => {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(start, { timeout: 5000 });
        } else {
            // Safari / older browsers
            setTimeout(start, 3000);
        }
    };

    // Wait 5 seconds after invocation before even queueing the prefetch
    setTimeout(delayedStart, 5000);
}
